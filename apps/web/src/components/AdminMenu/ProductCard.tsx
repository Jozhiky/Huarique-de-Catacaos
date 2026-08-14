import React from "react";
import type { MenuItem, MenuItemVariant } from "@huarique/domain";
import {
  Edit3,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

interface ProductCardProps {
  item: MenuItem;
  categoryName?: string;
  onEditProduct: (item: MenuItem) => void;
  onManageVariants: (item: MenuItem) => void;
  onConfigureDays: (item: MenuItem) => void;
  onToggleAvailability: (
    productId: string,
    isAvailable: boolean,
  ) => Promise<void>;
  onToggleActive: (productId: string, isActive: boolean) => Promise<void>;
  onEditVariantPrice: (
    variant: MenuItemVariant,
    isConfirmValidation?: boolean,
  ) => void;
  onToggleVariantOrderable: (
    variantId: string,
    currentOrderable: boolean,
  ) => Promise<void>;
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  categoryName,
  onEditProduct,
  onManageVariants,
  onConfigureDays,
  onToggleAvailability,
  onToggleActive,
  onEditVariantPrice,
  onToggleVariantOrderable,
}) => {
  const hasValidationPending = item.variants.some(
    (v) => v.priceNeedsValidation,
  );

  return (
    <div
      className={`bg-slate-900 border rounded-xl p-4 shadow-md transition-all flex flex-col justify-between ${
        !item.isActive
          ? "border-red-900/40 opacity-60 bg-red-950/10"
          : !item.isAvailable
            ? "border-amber-900/50 bg-amber-950/10"
            : "border-slate-800 hover:border-slate-700 bg-[#1e293b]/70"
      }`}
    >
      {/* Cabecera del Plato */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {item.name}
              </h3>
              {!item.isActive && (
                <span className="px-1.5 py-0.5 bg-red-900/50 text-red-300 border border-red-700/50 rounded text-[10px] font-bold">
                  Inactivo
                </span>
              )}
            </div>
            {categoryName && (
              <span className="text-[11px] font-medium text-amber-400/90 uppercase tracking-wider">
                {categoryName}
              </span>
            )}
          </div>

          {/* Toggle de Disponibilidad (Agotado / Disponible) */}
          <button
            onClick={() => onToggleAvailability(item.id, !item.isAvailable)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm ${
              item.isAvailable
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 hover:bg-emerald-900/80"
                : "bg-red-950/90 text-red-300 border border-red-600/60 hover:bg-red-900/90"
            }`}
          >
            {item.isAvailable ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Disponible</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span>Agotado</span>
              </>
            )}
          </button>
        </div>

        {item.description && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2 italic">
            {item.description}
          </p>
        )}

        {/* Días de disponibilidad semanal */}
        {item.availableDays && item.availableDays.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 px-2 py-1 bg-slate-800/80 border border-slate-700/60 rounded-md text-[11px] text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300">Días:</span>
            <span>
              {item.availableDays.map((d) => DAY_NAMES[d]).join(", ")}
            </span>
          </div>
        )}

        {/* Tabla de Variantes */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2 mb-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Presentaciones ({item.variants.length})</span>
            {hasValidationPending && (
              <span className="text-amber-400 flex items-center gap-1 text-[10px] font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Validación requerida
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {item.variants.map((v) => (
              <div
                key={v.id}
                className={`flex items-center justify-between p-1.5 rounded text-xs border ${
                  v.priceNeedsValidation
                    ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                    : !v.isOrderable
                      ? "bg-slate-900/50 border-slate-800 text-slate-400"
                      : "bg-slate-900 border-slate-800/80 text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{v.variantName}</span>
                  {v.priceNeedsValidation ? (
                    <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded text-[9px] uppercase tracking-wider">
                      VALIDAR
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-emerald-400">
                      S/ {v.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {v.priceNeedsValidation ? (
                    <button
                      onClick={() => onEditVariantPrice(v, true)}
                      className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-[10px] transition-colors shadow-sm"
                    >
                      Confirmar
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => onEditVariantPrice(v, false)}
                        className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] transition-colors"
                        title="Cambiar precio"
                      >
                        S/
                      </button>
                      <button
                        onClick={() =>
                          onToggleVariantOrderable(v.id, v.isOrderable)
                        }
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          v.isOrderable
                            ? "bg-emerald-950 text-emerald-300 hover:bg-emerald-900"
                            : "bg-red-950 text-red-300 hover:bg-red-900"
                        }`}
                        title={
                          v.isOrderable
                            ? "Deshabilitar para pedido"
                            : "Habilitar para pedido"
                        }
                      >
                        {v.isOrderable ? "Activo" : "Bloq."}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones del Plato */}
      <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEditProduct(item)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Editar plato"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onManageVariants(item)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Administrar variantes"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => onConfigureDays(item)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Configurar días de disponibilidad"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onToggleActive(item.id, item.isActive)}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
            item.isActive
              ? "text-slate-400 hover:text-red-400 hover:bg-red-950/30"
              : "text-emerald-400 hover:text-emerald-300 bg-emerald-950/40"
          }`}
        >
          {item.isActive ? "Desactivar" : "Activar"}
        </button>
      </div>
    </div>
  );
};
