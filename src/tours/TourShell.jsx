import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TourProvider, useTour } from "@reactour/tour";
import { supabase } from "../supabase/client";
import { TOURS_REGISTRY } from "./registry";
import { Button } from "@/components/ui/button";

const AppTourContext = createContext(null);

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getAccountStorageKey = (accountType) => (accountType === "shop" ? "shop_info" : "gym_info");

const resolveAccount = ({ tourId }) => {
  const stored = localStorage.getItem("accountType");
  const inferred = stored === "shop" || stored === "gym" ? stored : "gym";
  if (tourId === "clients") return "gym";
  return inferred;
};

const getLocalTourKey = ({ userId, tourId }) => `tronoss.tours.v1.${userId}.${tourId}`;

const readLocalTourState = ({ userId, tourId }) => {
  if (!userId) return null;
  const raw = localStorage.getItem(getLocalTourKey({ userId, tourId }));
  if (!raw) return null;
  return safeJsonParse(raw, null);
};

const writeLocalTourState = ({ userId, tourId, next }) => {
  if (!userId) return;
  localStorage.setItem(getLocalTourKey({ userId, tourId }), JSON.stringify(next));
};

const updateCachedAccountInfo = ({ accountType, updater }) => {
  const key = getAccountStorageKey(accountType);
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const next = updater(parsed);
    sessionStorage.setItem(key, JSON.stringify(next));
  } catch {
    return;
  }
};

const useAppTourInternal = () => {
  const ctx = useContext(AppTourContext);
  if (!ctx) {
    throw new Error("useAppTour debe usarse dentro de <TourShell />");
  }
  return ctx;
};

const TourContent = (props) => {
  const { meta, setMeta } = useTour();
  const parsedMeta = useMemo(() => safeJsonParse(meta, {}), [meta]);
  const step = props.steps?.[props.currentStep] || {};
  const isLast = props.currentStep === (props.steps?.length || 1) - 1;

  return (
    <div className="w-[280px] sm:w-[340px] p-4">
      <div className="text-sm font-semibold text-foreground">{step.title || "Guía"}</div>
      <div className="mt-2 text-sm text-muted-foreground">{step.description || ""}</div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={props.currentStep === 0}
          onClick={() => props.setCurrentStep((s) => Math.max(0, s - 1))}
        >
          Anterior
        </Button>

        {isLast ? (
          <Button
            size="sm"
            onClick={() => {
              setMeta(
                JSON.stringify({
                  ...parsedMeta,
                  complete: true,
                  completedAt: Date.now(),
                })
              );
              props.setIsOpen(false);
            }}
          >
            Finalizar
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => props.setCurrentStep((s) => Math.min((props.steps?.length || 1) - 1, s + 1))}
          >
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
};

const AppTourManager = ({ children }) => {
  const { isOpen, setIsOpen, currentStep, setCurrentStep, steps, setSteps, meta, setMeta } = useTour();
  const [authUserId, setAuthUserId] = useState(null);
  const autoLockRef = useRef({});
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUserId(user?.id ?? null);
    };
    init();
  }, []);

  const persistToDb = useCallback(async ({ tourId, patch }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const accountType = resolveAccount({ tourId });
    const table = accountType === "shop" ? "info_shops" : "info_general_gym";
    const storageKey = getAccountStorageKey(accountType);
    const cached = safeJsonParse(sessionStorage.getItem(storageKey), {});
    const existing = cached?.onboarding_tours && typeof cached.onboarding_tours === "object" ? cached.onboarding_tours : {};

    const next = {
      ...existing,
      [tourId]: {
        ...(existing?.[tourId] || {}),
        ...patch,
      },
    };

    const { error } = await supabase
      .from(table)
      .update({ onboarding_tours: next })
      .eq("owner_id", user.id);

    if (!error) {
      updateCachedAccountInfo({
        accountType,
        updater: (prev) => ({
          ...prev,
          onboarding_tours: next,
        }),
      });
    }
  }, []);

  const markSeen = useCallback(async ({ tourId, startedAt }) => {
    const now = startedAt || Date.now();
    let userId = authUserId;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
      if (userId) setAuthUserId(userId);
    }
    const local = readLocalTourState({ userId, tourId }) || {};
    const next = {
      ...local,
      seenAt: local.seenAt || now,
    };
    writeLocalTourState({ userId, tourId, next });
    await persistToDb({ tourId, patch: { seenAt: next.seenAt } });
  }, [authUserId, persistToDb]);

  const markCompleted = useCallback(async ({ tourId, completedAt }) => {
    const now = completedAt || Date.now();
    let userId = authUserId;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
      if (userId) setAuthUserId(userId);
    }
    const local = readLocalTourState({ userId, tourId }) || {};
    const next = {
      ...local,
      seenAt: local.seenAt || now,
      completedAt: local.completedAt || now,
    };
    writeLocalTourState({ userId, tourId, next });
    await persistToDb({ tourId, patch: { seenAt: next.seenAt, completedAt: next.completedAt } });
  }, [authUserId, persistToDb]);

  const startTour = useCallback(async (tourId, ctx = {}, options = {}) => {
    const entry = TOURS_REGISTRY[tourId];
    if (!entry) return;

    const startedAt = Date.now();
    const mode = options?.mode === "auto" ? "auto" : "manual";
    const nextMeta = { tourId, mode, startedAt, complete: false };

    const nextSteps = entry.createSteps(ctx);
    setSteps(nextSteps);
    setCurrentStep(0);
    setMeta(JSON.stringify(nextMeta));
    setIsOpen(true);
    await markSeen({ tourId, startedAt });
  }, [markSeen, setCurrentStep, setIsOpen, setMeta, setSteps]);

  const canAutoStart = useCallback(async (tourId) => {
    const entry = TOURS_REGISTRY[tourId];
    if (!entry) return false;

    let userId = authUserId;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return false;
      userId = user.id;
      setAuthUserId(userId);
    }

    const local = readLocalTourState({ userId, tourId });
    if (local?.seenAt) return false;

    const accountType = resolveAccount({ tourId });
    const storageKey = getAccountStorageKey(accountType);
    const cached = safeJsonParse(sessionStorage.getItem(storageKey), {});
    const dbState = cached?.onboarding_tours?.[tourId];
    if (dbState?.seenAt) return false;

    return true;
  }, [authUserId]);

  const maybeAutoStartTour = useCallback(async (tourId, ctx = {}) => {
    if (autoLockRef.current[tourId]) return;
    autoLockRef.current[tourId] = true;

    const shouldStart = await canAutoStart(tourId);
    if (!shouldStart) return;
    await startTour(tourId, ctx, { mode: "auto" });
  }, [canAutoStart, startTour]);

  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    if (wasOpen && !isOpen) {
      const parsed = safeJsonParse(meta, {});
      if (parsed?.tourId && parsed?.complete) {
        markCompleted({ tourId: parsed.tourId, completedAt: parsed.completedAt });
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, markCompleted, meta]);

  const value = useMemo(() => ({
    isTourOpen: isOpen,
    currentStep,
    steps,
    startTour,
    maybeAutoStartTour,
    closeTour: () => setIsOpen(false),
  }), [currentStep, isOpen, maybeAutoStartTour, setIsOpen, startTour, steps]);

  return <AppTourContext.Provider value={value}>{children}</AppTourContext.Provider>;
};

export const useAppTour = () => useAppTourInternal();

export const TourShell = ({ children }) => {
  return (
    <TourProvider
      steps={[]}
      ContentComponent={TourContent}
      scrollSmooth
      disableWhenSelectorFalsy
      showCloseButton
      styles={{
        popover: (base) => ({
          ...base,
          padding: 0,
          borderRadius: 12,
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }),
        maskArea: (base) => ({
          ...base,
          rx: 12,
        }),
        badge: (base) => ({
          ...base,
          background: "hsl(var(--primary))",
        }),
      }}
    >
      <AppTourManager>{children}</AppTourManager>
    </TourProvider>
  );
};
