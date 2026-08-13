import React from "react";
import { Wifi, WifiOff, Lock, User } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface TabletShellProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  staffName?: string;
  staffRole?: string;
  isOnline?: boolean;
  onLockSession?: () => void;
  headerRight?: React.ReactNode;
  className?: string;
}

export const TabletShell: React.FC<TabletShellProps> = ({
  children,
  activeTab = "mesas",
  onTabChange,
  staffName = "Carlos (Mozo)",
  staffRole = "waiter",
  isOnline = true,
  onLockSession,
  headerRight,
  className,
}) => {
  const tabs = [
    { id: "mesas", label: "Salones y Mesas", shortLabel: "Mesas" },
    { id: "pedidos", label: "Toma de Pedidos", shortLabel: "Pedidos" },
    { id: "caja", label: "Caja y Cobro", shortLabel: "Caja" },
    { id: "inventario", label: "Inventario", shortLabel: "Stock" },
    { id: "dashboard", label: "Dashboard", shortLabel: "Panel" },
  ];

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen overflow-hidden flex flex-col bg-brand-cream select-none">
      {/* Alerta de Desconexión Honesta si no hay red */}
      {!isOnline && (
        <div
          role="alert"
          className="bg-warning text-neutral-900 px-4 py-1.5 text-center font-display text-sm tracking-wider font-extrabold flex items-center justify-center gap-2 border-b border-warning/40 shadow-sm shrink-0"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>SIN CONEXIÓN — ESTE PEDIDO TODAVÍA NO LLEGÓ A COCINA</span>
        </div>
      )}

      {/* Cabecera Principal con fondo Azul Marino (#0B3156) optimizada para 1024x600 y 1280x800 */}
      <header className="min-h-[64px] bg-brand-navy border-b border-brand-gold/30 px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-md gap-2 overflow-x-hidden">
        {/* Contenedor del Logo Institucional con fondo Azul Marino */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-[48px] px-2.5 bg-[#072440] rounded-touch border border-brand-gold/30 flex items-center justify-center shadow-inner">
            <img
              src="/brand/huarique-logo-transparente.png"
              alt="Huarique de Catacaos"
              className="h-9 w-auto max-w-[140px] sm:max-w-none object-contain"
            />
          </div>

          <div className="hidden xl:flex flex-col">
            <span className="font-display text-xs font-semibold text-brand-gold tracking-widest uppercase">
              Restaurante Turístico
            </span>
            <span className="font-sans text-[11px] text-brand-cream/70">
              Catacaos — Piura
            </span>
          </div>
        </div>

        {/* Pestañas de Navegación Operativa con Objetivos Táctiles >= 48px */}
        <nav
          className="flex items-center gap-1 bg-[#051C33] p-1 rounded-touch border border-brand-gold/20 shrink-0"
          aria-label="Pestañas principales"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={clsx(
                  "min-h-[48px] min-w-[48px] px-3 sm:px-3.5 py-2 rounded-touch font-display text-xs sm:text-sm uppercase tracking-wider font-bold transition-all duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-gold",
                  isActive
                    ? "bg-brand-gold text-brand-navy shadow-sm"
                    : "text-brand-cream/80 hover:text-white hover:bg-white/10 active:bg-white/15",
                )}
              >
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Estado, Usuario y Bloqueo Rápido */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Indicador de Conexión */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 text-xs font-sans text-brand-cream min-h-[40px]">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-success shrink-0" />
                <span className="hidden lg:inline">En línea</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-warning shrink-0" />
                <span className="hidden lg:inline">Offline</span>
              </>
            )}
          </div>

          {/* Información de Usuario */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-touch bg-[#072440] border border-brand-gold/20 text-brand-cream min-h-[48px]">
            <User className="h-4 w-4 text-brand-gold shrink-0" />
            <div className="flex flex-col text-left">
              <span className="font-display text-xs font-bold leading-tight truncate max-w-[90px] sm:max-w-[120px]">
                {staffName}
              </span>
              <span className="font-sans text-[9px] text-brand-gold uppercase tracking-wider">
                {staffRole}
              </span>
            </div>
          </div>

          {/* Botón de Bloqueo Rápido de Sesión (>= 48x48 px) */}
          {onLockSession && (
            <button
              type="button"
              onClick={onLockSession}
              aria-label="Bloquear sesión de mozo"
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-touch bg-danger/20 text-danger hover:bg-danger/30 active:bg-danger/40 border border-danger/30 transition-all focus:outline-none focus:ring-2 focus:ring-danger"
            >
              <Lock className="h-5 w-5" />
            </button>
          )}

          {headerRight}
        </div>
      </header>

      {/* Contenedor Principal (Con scroll confinado internamente sin scroll global) */}
      <main
        className={twMerge(clsx("flex-1 overflow-hidden relative", className))}
      >
        {children}
      </main>
    </div>
  );
};
