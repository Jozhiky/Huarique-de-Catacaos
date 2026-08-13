import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "brand"
    | "gold"
    | "coastal"
    | "success"
    | "danger"
    | "outline"
    | "ghost";
  size?: "md" | "touch" | "lg";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "brand",
      size = "touch",
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-display tracking-wide uppercase transition-all duration-150 rounded-touch focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] font-bold";

    const sizeStyles = {
      md: "min-h-[48px] min-w-[48px] px-4 py-2.5 text-base", // Mínimo estricto >= 48x48 px
      touch: "min-h-[48px] min-w-[48px] px-5 py-3 text-lg", // Target táctil ergonómico >= 48x48 px
      lg: "min-h-[56px] min-w-[56px] px-6 py-4 text-xl",
    }[size];

    const variantStyles = {
      brand:
        "bg-brand-navy text-brand-gold hover:bg-[#072440] active:bg-[#051c33] focus:ring-brand-gold shadow-sm border border-brand-gold/30",
      gold: "bg-brand-gold text-brand-navy hover:bg-[#b5954e] active:bg-[#a68641] focus:ring-brand-navy shadow-sm font-extrabold",
      coastal:
        "bg-brand-coastal text-white hover:bg-[#126289] active:bg-[#0f5374] focus:ring-brand-coastal shadow-sm",
      success:
        "bg-success text-white hover:bg-[#20633d] active:bg-[#194f30] focus:ring-success shadow-sm",
      danger:
        "bg-danger text-white hover:bg-[#9c2f2f] active:bg-[#822727] focus:ring-danger shadow-sm",
      outline:
        "bg-transparent border-2 border-neutral-600 text-neutral-900 hover:bg-neutral-200/50 active:bg-neutral-200 focus:ring-neutral-600",
      ghost:
        "bg-transparent text-neutral-900 hover:bg-neutral-200/40 active:bg-neutral-200/70 focus:ring-brand-navy",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(
          clsx(
            baseStyles,
            sizeStyles,
            variantStyles,
            fullWidth && "w-full",
            className,
          ),
        )}
        {...props}
      >
        {leftIcon && (
          <span className="mr-2 inline-flex items-center">{leftIcon}</span>
        )}
        <span>{children}</span>
        {rightIcon && (
          <span className="ml-2 inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
