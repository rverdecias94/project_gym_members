const LEGACY_SELECTED_PLAN_KEY = 'selectedPlanId';
const LAST_USER_KEY = 'planStorage_lastUserId';
const KEY_PREFIX = 'selectedPlan_';
const STORAGE_VERSION = 1;

const ALLOWED_PLAN_IDS = new Set(['estandar', 'premium', 'market-fit']);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStorageAvailable(storage) {
  if (!storage) return false;
  try {
    const testKey = '__plan_storage_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function getStorage(preferSession = false) {
  const localOk = isStorageAvailable(window?.localStorage);
  const sessionOk = isStorageAvailable(window?.sessionStorage);

  if (preferSession) {
    if (sessionOk) return window.sessionStorage;
    if (localOk) return window.localStorage;
    return null;
  }

  if (localOk) return window.localStorage;
  if (sessionOk) return window.sessionStorage;
  return null;
}

export function buildSelectedPlanKey(userId) {
  if (!isNonEmptyString(userId)) return null;
  return `${KEY_PREFIX}${userId.trim()}`;
}

export function clearLegacySelectedPlanKey() {
  try {
    window?.localStorage?.removeItem(LEGACY_SELECTED_PLAN_KEY);
  } catch {
    return;
  }
}

export function onPlanStorageLogoutCleanup() {
  try {
    window?.sessionStorage?.removeItem(LAST_USER_KEY);
  } catch {
    return;
  }
  clearLegacySelectedPlanKey();
}

function parseRecord(raw) {
  if (!isNonEmptyString(raw)) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || data.v !== STORAGE_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

function isRecordValidForUser(record, userId) {
  if (!record) return false;
  if (!isNonEmptyString(userId)) return false;
  if (!isNonEmptyString(record.userId) || record.userId !== userId) return false;
  if (!isNonEmptyString(record.planId) || !ALLOWED_PLAN_IDS.has(record.planId)) return false;
  if (typeof record.expiresAt !== 'number' || !Number.isFinite(record.expiresAt)) return false;
  return record.expiresAt > Date.now();
}

export function getSelectedPlanForUser({ userId, preferSession = false } = {}) {
  const key = buildSelectedPlanKey(userId);
  if (!key) return null;
  const localOk = isStorageAvailable(window?.localStorage);
  const sessionOk = isStorageAvailable(window?.sessionStorage);
  const first = preferSession ? (sessionOk ? window.sessionStorage : null) : (localOk ? window.localStorage : null);
  const second = preferSession ? (localOk ? window.localStorage : null) : (sessionOk ? window.sessionStorage : null);

  const read = (storage) => {
    if (!storage) return null;
    const raw = storage.getItem(key);
    const record = parseRecord(raw);

    if (!record) {
      if (raw) {
        try {
          storage.removeItem(key);
        } catch {
          return null;
        }
      }
      return null;
    }

    if (!isRecordValidForUser(record, userId)) {
      try {
        storage.removeItem(key);
      } catch {
        return null;
      }
      return null;
    }

    return record.planId;
  };

  return read(first) ?? read(second);
}

export function setSelectedPlanForUser({
  userId,
  planId,
  preferSession = false,
  ttlDays = 90,
  primaryStorage,
  fallbackStorage,
} = {}) {
  if (!isNonEmptyString(userId)) return { ok: false, reason: 'missing_user' };
  if (!isNonEmptyString(planId) || !ALLOWED_PLAN_IDS.has(planId)) return { ok: false, reason: 'invalid_plan' };

  const key = buildSelectedPlanKey(userId);
  const ttlMs = Math.max(1, ttlDays) * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const record = {
    v: STORAGE_VERSION,
    userId,
    planId,
    updatedAt: now,
    expiresAt: now + ttlMs,
  };

  const primary = primaryStorage ?? getStorage(preferSession);
  const fallback = fallbackStorage ?? (preferSession ? getStorage(false) : getStorage(true));

  const payload = JSON.stringify(record);

  const write = (storage) => {
    storage.setItem(key, payload);
    try {
      window?.sessionStorage?.setItem(LAST_USER_KEY, userId);
    } catch {
      return;
    }
  };

  try {
    if (!primary) return { ok: false, reason: 'no_storage' };
    write(primary);
    clearLegacySelectedPlanKey();
    return { ok: true, storage: primary === window.localStorage ? 'localStorage' : 'sessionStorage' };
  } catch {
    try {
      if (!fallback) return { ok: false, reason: 'no_storage' };
      write(fallback);
      clearLegacySelectedPlanKey();
      return { ok: true, storage: fallback === window.localStorage ? 'localStorage' : 'sessionStorage' };
    } catch {
      return { ok: false, reason: 'write_failed' };
    }
  }
}

export function migrateLegacySelectedPlanForUser({ userId, preferSession = false, ttlDays = 90 } = {}) {
  if (!isNonEmptyString(userId)) return null;

  const existing = getSelectedPlanForUser({ userId, preferSession });
  if (existing) {
    clearLegacySelectedPlanKey();
    return existing;
  }

  let legacy = null;
  try {
    legacy = window?.localStorage?.getItem(LEGACY_SELECTED_PLAN_KEY);
  } catch {
    legacy = null;
  }

  if (!isNonEmptyString(legacy) || !ALLOWED_PLAN_IDS.has(legacy)) {
    clearLegacySelectedPlanKey();
    return null;
  }

  const res = setSelectedPlanForUser({ userId, planId: legacy, preferSession, ttlDays });
  return res.ok ? legacy : null;
}

export function markPlanStorageUser(userId) {
  if (!isNonEmptyString(userId)) return { changed: false };
  let last = null;
  try {
    last = window?.sessionStorage?.getItem(LAST_USER_KEY);
  } catch {
    last = null;
  }

  const changed = isNonEmptyString(last) && last !== userId;
  try {
    window?.sessionStorage?.setItem(LAST_USER_KEY, userId);
  } catch {
    return { changed };
  }

  if (changed) {
    clearLegacySelectedPlanKey();
  }

  return { changed };
}
