/* eslint-disable react/prop-types */
import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function toDate(value) {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  disabled,
  placeholder = "Selecciona una fecha",
  className,
  buttonClassName,
  error,
  id,
}) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = toDate(value);
  const minDate = toDate(min);
  const maxDate = toDate(max);

  const disabledMatchers = React.useMemo(() => {
    const matchers = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

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
            !selectedDate && "text-muted-foreground",
            error && "border-red-500 focus-visible:ring-red-500",
            buttonClassName
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "dd MMM yyyy", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", className)} align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              onChange?.("");
              return;
            }
            onChange?.(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          disabled={disabledMatchers}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

