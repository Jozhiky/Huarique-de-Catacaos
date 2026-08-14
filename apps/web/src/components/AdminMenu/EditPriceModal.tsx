import React, { useState, useEffect } from "react";
import type { MenuItemVariant } from "@huarique/domain";
import { X, DollarSign, Check, AlertTriangle } from "lucide-react";

interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: MenuItemVariant | null;
  isConfirmValidation?: boolean;
  onSavePrice: (
    variantId: string,
    newPrice: number,
    isConfirm: boolean,
  ) => Promise<void>;
}

export const EditPriceModal: React.FC<EditPriceModalProps> = ({
  isOpen,
  onClose,
  variant,
  isConfirmValidation = false,
  onSavePrice,
}) => {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (variant) {
      setPrice(variant.price > 0 ? variant.price.toString() : "");
    }
    setError(null);
  }, [variant, isOpen]);

  if (!isOpen || !variant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("El precio debe ser un monto válido estrictamente mayor a 0");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSavePrice(variant.id, priceNum, isConfirmValidation);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el precio",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-white font-title tracking-wide uppercase">
              {isConfirmValidation
                ? "Confirmar Precio Oficial"
                : "Modificar Precio"}
            </h3>
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

        {isConfirmValidation && (
          <div className="mb-4 p-3 bg-amber-950/40 border border-amber-500/50 rounded-xl flex items-start gap-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Este plato estaba registrado como <strong>VALIDAR</strong>. Al
              confirmar el precio, quedará habilitado automáticamente para que
              los mozos puedan ordenarlo.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">
              Presentación:{" "}
              <span className="font-semibold text-white">
                {variant.variantName}
              </span>
            </div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Precio en Soles (S/) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 font-mono">
                S/
              </span>
              <input
                type="number"
                step="0.50"
                required
                autoFocus
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-lg font-bold font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !price}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Guardando..." : "Guardar Precio"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
