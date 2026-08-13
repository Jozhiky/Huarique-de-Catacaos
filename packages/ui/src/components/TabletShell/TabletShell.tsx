import React from 'react';
import { Wifi, WifiOff, Lock, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  activeTab = 'mesas',
  onTabChange,
  staffName = 'Carlos (Mozo)',
  staffRole = 'waiter',
  isOnline = true,
  onLockSession,
  headerRight,
  className
}) => {
  const tabs = [
    { id: 'mesas', label: 'Salones y Mesas' },
    { id: 'pedidos', label: 'Toma de Pedidos' },
    { id: 'caja', label: 'Caja y Cobro' },
    { id: 'inventario', label: 'Inventario' },
    { id: 'dashboard', label: 'Dashboard' }
  ];

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen overflow-hidden flex flex-col bg-brand-cream select-none">
      {/* Alerta de Desconexión Honesta si no hay red */}
      {!isOnline && (
        <div
          role="alert"
          className="bg-warning text-neutral-900 px-4 py-2 text-center font-display text-sm tracking-wider font-extrabold flex items-center justify-center gap-2 border-b border-warning/40 shadow-sm shrink-0"
        >
          <WifiOff className="h-4 w-4" />
          <span>SIN CONEXIÓN — ESTE PEDIDO TODAVÍA NO LLEGÓ A COCINA</span>
        </div>
      )}

      {/* Cabecera Principal con fondo Azul Marino (#0B3156) */}
      <header className="h-[68px] bg-brand-navy border-b border-brand-gold/30 px-4 flex items-center justify-between shrink-0 shadow-md">
        {/* Contenedor del Logo Institucional con fondo Azul Marino */}
        <div className="flex items-center gap-3">
          <div className="h-[52px] px-3 bg-[#072440] rounded-touch border border-brand-gold/30 flex items-center justify-center shadow-inner">
            <img
              src="/brand/huarique-logo-transparente.png"
              alt="Huarique de Catacaos"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                // Fallback visual elegante si la imagen aún está cargando
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.parentElement) {
                  const fallback = document.createElement('span');
                  fallback.className = 'font-display font-bold text-brand-gold text-lg tracking-wider';
                  fallback.innerText = 'HUARIQUE DE CATACAOS';
                  target.parentElement.appendChild(fallback);
                }
              }}
            />
          </div>

          <div className="hidden lg:flex flex-col">
            <span className="font-display text-xs font-semibold text-brand-gold tracking-widest uppercase">
              Restaurante Turístico
            </span>
            <span className="font-sans text-xs text-brand-cream/70">Catacaos — Piura, Perú</span>
          </div>
        </div>

        {/* Pestañas de Navegación Operativa */}
        <nav className="flex items-center gap-1.5 bg-[#051C33] p-1.5 rounded-touch border border-brand-gold/20">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={clsx(
                  'min-h-[44px] px-3.5 py-1.5 rounded-touch font-display text-sm uppercase tracking-wider font-bold transition-all duration-150',
                  isActive
                    ? 'bg-brand-gold text-brand-navy shadow-sm'
                    : 'text-brand-cream/80 hover:text-white hover:bg-white/10 active:bg-white/15'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Estado, Usuario y Bloqueo Rápido */}
        <div className="flex items-center gap-3">
          {/* Indicador de Conexión */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-sans text-brand-cream">
            {isOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-success" />
                <span className="hidden sm:inline">En línea</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-warning" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {/* Información de Usuario */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-touch bg-[#072440] border border-brand-gold/20 text-brand-cream">
            <User className="h-4 w-4 text-brand-gold" />
            <div className="flex flex-col text-left">
              <span className="font-display text-xs font-bold leading-tight">{staffName}</span>
              <span className="font-sans text-[10px] text-brand-gold uppercase tracking-wider">{staffRole}</span>
            </div>
          </div>

          {/* Botón de Bloqueo Rápido de Sesión */}
          {onLockSession && (
            <button
              type="button"
              onClick={onLockSession}
              aria-label="Bloquear sesión de mozo"
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-touch bg-danger/20 text-danger hover:bg-danger/30 active:bg-danger/40 border border-danger/30 transition-all"
            >
              <Lock className="h-5 w-5" />
            </button>
          )}

          {headerRight}
        </div>
      </header>

      {/* Contenedor Principal (Con scroll confinado internamente sin scroll global) */}
      <main className={twMerge(clsx('flex-1 overflow-hidden relative', className))}>
        {children}
      </main>
    </div>
  );
};
