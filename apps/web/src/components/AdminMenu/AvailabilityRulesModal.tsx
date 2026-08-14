import React, { useState, useEffect } from "react";
import type { MenuItem } from "@huarique/domain";
import { X, Calendar, Check } from "lucide-react";

interface AvailabilityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MenuItem | null;
  onSaveDays: (productId: string, days: number[]) => Promise<void>;
}

const DAYS = [
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" },
  { id: 0, name: "Domingo" },
];

export const AvailabilityRulesModal: React.FC<AvailabilityRulesModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveDays,
}) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product?.availableDays) {
      setSelectedDays([...product.availableDays]);
    } else {
      setSelectedDays([]);
    }
    setError(null);
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSaveDays(product.id, selectedDays);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al guardar reglas de disponibilidad",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-white font-title tracking-wide uppercase">
                Días de Disponibilidad
              </h3>
              <span className="text-xs text-amber-400 font-semibold">
                {product.name}
              </span>
            </div>
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

        <p className="text-xs text-slate-400 mb-4">
          Selecciona los días específicos en los que este plato está disponible
          en la carta. Si no marcas ningún día, estará disponible todos los días
          de la semana.
        </p>

        <div className="space-y-2 mb-6">
          {DAYS.map((day) => {
            const isChecked = selectedDays.includes(day.id);
            return (
              <label
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                  isChecked
                    ? "bg-amber-950/40 border-amber-500/60 text-amber-200"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="text-sm font-semibold">{day.name}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="w-4 h-4 text-amber-600 bg-slate-900 border-slate-700 rounded focus:ring-amber-500"
                />
              </label>
            );
          })}
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
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? "Guardando..." : "Guardar Reglas"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
