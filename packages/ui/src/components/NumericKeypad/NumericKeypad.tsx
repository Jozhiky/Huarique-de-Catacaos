import React from "react";
import { Delete, Check } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface NumericKeypadProps {
  value: string;
  onChange: (newValue: string) => void;
  onSubmit?: () => void;
  maxLength?: number;
  mode?: "pin" | "currency" | "quantity";
  disabled?: boolean;
  className?: string;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  value,
  onChange,
  onSubmit,
  maxLength = 8,
  mode = "pin",
  disabled = false,
  className,
}) => {
  const handleDigit = (digit: string) => {
    if (disabled) return;
    if (value.length >= maxLength) return;

    if (mode === "currency" && digit === ".") {
      if (value.includes(".")) return;
      if (value === "") {
        onChange("0.");
        return;
      }
    }

    onChange(value + digit);
  };

  const handleBackspace = () => {
    if (disabled) return;
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (disabled) return;
    onChange("");
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [mode === "currency" ? "." : "C", "0", "DEL"],
  ];

  return (
    <div
      className={twMerge(
        clsx(
          "flex flex-col gap-2.5 max-w-[340px] w-full select-none",
          className,
        ),
      )}
    >
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-3 gap-2.5">
          {row.map((key) => {
            if (key === "DEL") {
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled || value.length === 0}
                  onClick={handleBackspace}
                  aria-label="Borrar último dígito"
                  className="min-h-[58px] min-w-[58px] flex items-center justify-center rounded-touch bg-[#EBE4D5] text-brand-navy hover:bg-[#DDD3C0] active:bg-[#CBC0AA] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all font-display text-xl font-bold shadow-sm"
                >
                  <Delete className="h-6 w-6" />
                </button>
              );
            }

            if (key === "C") {
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled || value.length === 0}
                  onClick={handleClear}
                  aria-label="Limpiar todo"
                  className="min-h-[58px] min-w-[58px] flex items-center justify-center rounded-touch bg-[#EBE4D5] text-danger hover:bg-[#DDD3C0] active:bg-[#CBC0AA] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all font-display text-xl font-bold shadow-sm"
                >
                  C
                </button>
              );
            }

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => handleDigit(key)}
                className="min-h-[58px] min-w-[58px] flex items-center justify-center rounded-touch bg-surface text-brand-navy hover:bg-brand-cream active:bg-brand-sand active:scale-95 disabled:opacity-40 transition-all font-display text-2xl font-bold shadow-sm border border-neutral-200"
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}

      {onSubmit && (
        <button
          type="button"
          disabled={disabled || value.length === 0}
          onClick={onSubmit}
          className="mt-2 min-h-[56px] w-full flex items-center justify-center gap-2 rounded-touch bg-brand-navy text-brand-gold hover:bg-[#072440] active:bg-[#051c33] active:scale-[0.98] disabled:opacity-40 transition-all font-display text-xl font-bold tracking-wide uppercase shadow-md border border-brand-gold/30"
        >
          <Check className="h-6 w-6" />
          <span>Confirmar</span>
        </button>
      )}
    </div>
  );
};
