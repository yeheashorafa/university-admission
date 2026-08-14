"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SettingsCard({
  title,
  description,
  children,
}: SettingsCardProps) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-6 shadow-[0px_8px_30px_rgba(0,77,64,0.06)]">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-bold text-primary">{title}</h2>

        {description && (
          <p className="mt-2 leading-7 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

type SettingFieldProps = {
  label: string;
  description?: string;
  children: React.ReactNode;
};

export function SettingField({
  label,
  description,
  children,
}: SettingFieldProps) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 border-b border-border py-5 last:border-b-0  md:items-center">
      <div className="min-w-0">
        <p className="font-bold text-foreground">{label}</p>

        {description && (
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="min-w-0 w-full">{children}</div>
    </div>
  );
}

type ToggleSwitchProps = {
  checked?: boolean;
};

export function ToggleSwitch({ checked = false }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white transition",
          checked
            ? "translate-x-6 rtl:-translate-x-6"
            : "translate-x-1 rtl:-translate-x-1"
        )}
      />
    </button>
  );
}

type SettingsInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function SettingsInput(props: SettingsInputProps) {
  return (
    <input
      {...props}
      className="h-11 w-full min-w-0 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
    />
  );
}

export function SettingsSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className="h-11 w-full min-w-0 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
    />
  );
}

type SettingsCustomSelectOption = {
  label: string;
  value: string;
};

type SettingsCustomSelectProps = {
  id?: string;
  value: string;
  options: SettingsCustomSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function SettingsCustomSelect({
  id,
  value,
  options,
  onChange,
  disabled,
}: SettingsCustomSelectProps) {
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
    <div ref={wrapperRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-11 w-full min-w-0 items-center justify-between rounded-xl border border-border bg-card px-3 text-start text-sm font-semibold text-foreground outline-none transition",
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