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
    { id: "mesas", label: "Mesas", fullLabel: "Salones y Mesas" },
    { id: "pedidos", label: "Pedidos", fullLabel: "Toma de Pedidos" },
    { id: "caja", label: "Caja", fullLabel: "Caja y Cobro" },
    { id: "inventario", label: "Stock", fullLabel: "Inventario" },
    { id: "dashboard", label: "Panel", fullLabel: "Dashboard" },
  ];

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen overflow-hidden flex flex-col bg-brand-cream select-none">
      {/* Alerta de Desconexión Honesta si no hay red */}
      {!isOnline && (
        <div
          role="alert"
          className="bg-warning text-neutral-900 px-4 py-1.5 text-center font-display text-sm tracking-wider font-extrabold flex items-center justify-center gap-2 border-b border-warning/40 shadow-sm shrink-0"
        >
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>SIN CONEXIÓN — ESTE PEDIDO TODAVÍA NO LLEGÓ A COCINA</span>
        </div>
      )}

      {/* Cabecera Principal Ergonómica (Ajuste natural en 1024x600 y 1280x800) */}
      <header
        data-testid="pos-header"
        className="h-[64px] min-h-[64px] w-full bg-brand-navy border-b border-brand-gold/30 px-3 flex items-center justify-between shrink-0 shadow-md gap-2"
      >
        {/* Contenedor del Logo Institucional con fondo Azul Marino */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-[48px] px-2.5 bg-[#072440] rounded-touch border border-brand-gold/30 flex items-center justify-center shadow-inner">
            <img
              src="/brand/huarique-logo-transparente.png"
              alt="Huarique de Catacaos"
              className="h-8 w-auto max-w-[130px] object-contain"
            />
          </div>

          <div className="hidden xl:flex flex-col">
            <span className="font-display text-xs font-semibold text-brand-gold tracking-widest uppercase leading-tight">
              Restaurante Turístico
            </span>
            <span className="font-sans text-[10px] text-brand-cream/70 leading-tight">
              Catacaos — Piura
            </span>
          </div>
        </div>

        {/* Pestañas de Navegación Operativa con Objetivos Táctiles >= 48x48 px */}
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
                  "min-h-[48px] min-w-[48px] px-3.5 py-2 rounded-touch font-display text-sm uppercase tracking-wider font-bold transition-all duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-gold",
                  isActive
                    ? "bg-brand-gold text-brand-navy shadow-sm"
                    : "text-brand-cream/80 hover:text-white hover:bg-white/10 active:bg-white/15",
                )}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Estado, Usuario y Bloqueo Rápido */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Indicador de Conexión (>= 48x48 px) */}
          <div
            className="min-h-[48px] min-w-[48px] px-2.5 py-1.5 rounded-touch bg-white/10 text-xs font-sans text-brand-cream flex items-center justify-center gap-1"
            title={isOnline ? "Conectado a Internet" : "Sin conexión"}
          >
            {isOnline ? (
              <>
                <Wifi
                  className="h-4 w-4 text-success shrink-0"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline text-xs font-semibold">
                  Online
                </span>
              </>
            ) : (
              <>
                <WifiOff
                  className="h-4 w-4 text-warning shrink-0"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline text-xs font-semibold text-warning">
                  Offline
                </span>
              </>
            )}
          </div>

          {/* Información de Usuario (>= 48px) */}
          <div className="min-h-[48px] px-2.5 py-1 rounded-touch bg-[#072440] border border-brand-gold/20 text-brand-cream flex items-center gap-1.5">
            <User
              className="h-4 w-4 text-brand-gold shrink-0"
              aria-hidden="true"
            />
            <div className="flex flex-col text-left">
              <span className="font-display text-xs font-bold leading-tight truncate max-w-[85px] sm:max-w-[110px]">
                {staffName}
              </span>
              <span className="font-sans text-[9px] text-brand-gold uppercase tracking-wider leading-none">
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
              <Lock className="h-5 w-5" aria-hidden="true" />
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
