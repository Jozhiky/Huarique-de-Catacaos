import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "md",
  className,
  initialFocusRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Gestión de foco accesible (Focus trap, foco inicial y restauración de foco)
  useEffect(() => {
    if (!isOpen) return;

    // Guardar elemento previamente enfocado para restaurarlo al cerrar
    previousActiveElement.current =
      document.activeElement as HTMLElement | null;

    // Establecer foco inicial
    const timeout = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        // Obtener todos los elementos enfocables dentro del modal
        const focusableElements =
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: si estamos en el primer elemento, ir al último
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: si estamos en el último elemento, ir al primero
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
      // Restaurar foco al elemento que activó el modal
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === "function"
      ) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose, initialFocusRef]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-[2px] animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Contenedor Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={twMerge(
          clsx(
            "w-full bg-surface rounded-card shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh] overflow-hidden select-none outline-none",
            maxWidthStyles,
            className,
          ),
        )}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 bg-brand-navy text-white shrink-0 border-b border-brand-gold/30">
          <div>
            <h3
              id="modal-title"
              className="font-display text-2xl font-bold text-brand-gold tracking-wide uppercase"
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-brand-cream/80 font-sans mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-touch text-brand-cream hover:text-white hover:bg-white/10 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cuerpo con Scroll interno (evita scroll global) */}
        <div className="px-6 py-5 overflow-y-auto flex-1 text-neutral-900 font-sans">
          {children}
        </div>

        {/* Pie de página opcional */}
        {footer && (
          <div className="px-6 py-4 bg-[#F8F5EE] border-t border-neutral-200 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
