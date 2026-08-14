import React, { useState } from "react";
import type { MenuItem } from "@huarique/domain";
import { X, Plus, Check } from "lucide-react";

interface VariantManagerProps {
  isOpen: boolean;
  onClose: () => void;
  product: MenuItem | null;
  onCreateVariant: (
    productId: string,
    name: string,
    price: number,
  ) => Promise<void>;
  onToggleActive: (variantId: string, currentActive: boolean) => Promise<void>;
  onToggleOrderable: (
    variantId: string,
    currentOrderable: boolean,
  ) => Promise<void>;
  onRefreshMenu: () => Promise<void>;
}

export const VariantManager: React.FC<VariantManagerProps> = ({
  isOpen,
  onClose,
  product,
  onCreateVariant,
  onToggleActive,
  onToggleOrderable,
  onRefreshMenu,
}) => {
  const [newVariantName, setNewVariantName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice);
    if (!newVariantName.trim() || isNaN(priceNum) || priceNum <= 0) {
      setError("Nombre y precio (> 0) son obligatorios");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onCreateVariant(product.id, newVariantName.trim(), priceNum);
      setNewVariantName("");
      setNewPrice("");
      setIsAdding(false);
      await onRefreshMenu();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al crear la variante",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-title tracking-wide uppercase">
              Presentaciones / Variantes
            </h3>
            <span className="text-xs text-amber-400 font-semibold">
              {product.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-700/60 rounded-lg text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Lista de variantes actuales */}
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
          {product.variants.map((v) => (
            <div
              key={v.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                !v.isActive
                  ? "bg-red-950/20 border-red-900/40 text-slate-400"
                  : "bg-slate-800/80 border-slate-700 text-slate-200"
              }`}
            >
              <div>
                <span className="font-semibold text-white mr-2">
                  {v.variantName}
                </span>
                {v.priceNeedsValidation ? (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded text-[9px]">
                    VALIDAR
                  </span>
                ) : (
                  <span className="font-mono font-bold text-emerald-400">
                    S/ {v.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={async () => {
                    await onToggleOrderable(v.id, v.isOrderable);
                    await onRefreshMenu();
                  }}
                  disabled={v.priceNeedsValidation}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    v.isOrderable
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700/50"
                      : "bg-red-950 text-red-300 border border-red-700/50"
                  }`}
                >
                  {v.isOrderable ? "Ordenable" : "No Ordenable"}
                </button>
                <button
                  onClick={async () => {
                    await onToggleActive(v.id, v.isActive);
                    await onRefreshMenu();
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                    v.isActive
                      ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      : "bg-red-900/60 text-red-200 hover:bg-red-900"
                  }`}
                >
                  {v.isActive ? "Activo" : "Inactivo"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario para añadir nueva variante */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-amber-400 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-dashed border-amber-500/40"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Otra Presentación</span>
          </button>
        ) : (
          <form
            onSubmit={handleAdd}
            className="p-3 bg-slate-950 border border-amber-500/50 rounded-xl space-y-3"
          >
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Nueva Presentación
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                placeholder="Nombre (ej. Fuente)"
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                step="0.50"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Precio S/"
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{loading ? "Guardando..." : "Guardar"}</span>
              </button>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
