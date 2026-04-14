/* eslint-disable react/prop-types */
import * as React from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function timeToMinutes(value) {
  if (!value || typeof value !== "string") return undefined;
  const [h, m] = value.split(":");
  const hour = Number(h);
  const min = Number(m);
  if (Number.isNaN(hour) || Number.isNaN(min)) return undefined;
  if (hour < 0 || hour > 23 || min < 0 || min > 59) return undefined;
  return hour * 60 + min;
}

function clampStep(step) {
  const n = Number(step);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(60, Math.floor(n)));
}

export function TimePicker({
  value,
  onChange,
  min,
  max,
  minuteStep = 1,
  disabled,
  placeholder = "--:--",
  className,
  buttonClassName,
  error,
  id,
}) {
  const [open, setOpen] = React.useState(false);

  const currentMinutes = timeToMinutes(value);
  const currentHour = currentMinutes !== undefined ? Math.floor(currentMinutes / 60) : undefined;
  const currentMinute = currentMinutes !== undefined ? currentMinutes % 60 : undefined;

  const minMinutes = timeToMinutes(min);
  const maxMinutes = timeToMinutes(max);
  const step = clampStep(minuteStep);

  const isAllowed = React.useCallback(
    (hour, minute) => {
      const mins = hour * 60 + minute;
      if (minMinutes !== undefined && mins < minMinutes) return false;
      if (maxMinutes !== undefined && mins > maxMinutes) return false;
      return true;
    },
    [minMinutes, maxMinutes]
  );

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const minutes = React.useMemo(() => {
    const list = [];
    for (let m = 0; m < 60; m += step) list.push(m);
    return list;
  }, [step]);

  const allowedMinutesForHour = React.useMemo(() => {
    const hour = currentHour ?? 0;
    return minutes.filter((m) => isAllowed(hour, m));
  }, [currentHour, minutes, isAllowed]);

  const setHour = (hour) => {
    const nextHour = hour;
    const candidateMinute =
      currentMinute !== undefined && isAllowed(nextHour, currentMinute)
        ? currentMinute
        : (minutes.find((m) => isAllowed(nextHour, m)) ?? 0);

    if (!isAllowed(nextHour, candidateMinute)) {
      onChange?.("");
      return;
    }
    onChange?.(`${pad2(nextHour)}:${pad2(candidateMinute)}`);
  };

  const setMinute = (minute) => {
    const nextMinute = minute;
    const nextHour = currentHour ?? 0;
    if (!isAllowed(nextHour, nextMinute)) return;
    onChange?.(`${pad2(nextHour)}:${pad2(nextMinute)}`);
    setOpen(false);
  };

  const displayValue = currentMinutes !== undefined ? `${pad2(currentHour)}:${pad2(currentMinute)}` : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayValue && "text-muted-foreground",
            error && "border-red-500 focus-visible:ring-red-500",
            buttonClassName
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[320px] p-3", className)} align="start">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Hora</div>
            <ScrollArea className="h-56 rounded-md border">
              <div className="p-1">
                {hours.map((h) => {
                  const hasAnyMinute = minutes.some((m) => isAllowed(h, m));
                  const selected = currentHour === h;
                  return (
                    <Button
                      key={h}
                      type="button"
                      variant={selected ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      disabled={!hasAnyMinute}
                      onClick={() => setHour(h)}
                    >
                      {pad2(h)}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Minutos</div>
            <ScrollArea className="h-56 rounded-md border">
              <div className="p-1">
                {minutes.map((m) => {
                  const hour = currentHour ?? 0;
                  const allowed = isAllowed(hour, m);
                  const selected = currentMinute === m;
                  return (
                    <Button
                      key={m}
                      type="button"
                      variant={selected ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      disabled={!allowed || (currentHour === undefined && !allowedMinutesForHour.includes(m))}
                      onClick={() => setMinute(m)}
                    >
                      {pad2(m)}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

