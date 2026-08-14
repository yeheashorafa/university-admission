"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminCustomSelectOption = {
  label: string;
  value: string;
};

type AdminCustomSelectProps = {
  id?: string;
  label?: string;
  value: string;
  options: AdminCustomSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

export function AdminCustomSelect({
  id,
  label,
  value,
  options,
  onChange,
  className,
  disabled,
}: AdminCustomSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative space-y-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-muted-foreground"
        >
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border border-border bg-card px-4 text-start text-sm font-semibold text-foreground outline-none transition",
          "hover:border-primary/50 hover:bg-muted/40",
          "focus:border-primary focus:ring-2 focus:ring-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-primary ring-2 ring-primary/15"
        )}
      >
        <span className="truncate">{selectedOption?.label}</span>

        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition",
            open && "rotate-180 text-primary"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 max-h-64 w-full overflow-hidden rounded-xl border border-border bg-card shadow-[0px_14px_40px_rgba(0,0,0,0.12)]">
          <div className="max-h-64 overflow-y-auto p-1">
            {options.map((option) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-start text-sm font-medium transition",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span>{option.label}</span>

                  {selected && <Check className="size-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}