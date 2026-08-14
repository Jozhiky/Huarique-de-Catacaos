import React, { useState } from "react";
import type { MenuCategory } from "@huarique/domain";
import { ArrowUp, ArrowDown, Plus, Check, X, Tag } from "lucide-react";

interface CategoryManagerProps {
  categories: MenuCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onCreateCategory: (name: string) => Promise<void>;
  onToggleActive: (id: string, currentActive: boolean) => Promise<void>;
  onMoveCategory: (id: string, direction: "up" | "down") => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
  onToggleActive,
  onMoveCategory,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setLoading(true);
      await onCreateCategory(newCatName.trim());
      setNewCatName("");
      setIsCreating(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-4 shadow-lg mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-white tracking-wide uppercase font-title">
            Categorías de la Carta ({categories.length})
          </h2>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
          </button>
        )}
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="flex items-center gap-2 mb-4 p-3 bg-slate-900/80 border border-amber-500/40 rounded-lg"
        >
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nombre de la nueva categoría (ej. Bebidas)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !newCatName.trim()}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            <span>Guardar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setNewCatName("");
            }}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>
        </form>
      )}

      {/* Lista desplazable de categorías */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            selectedCategoryId === null
              ? "bg-amber-600 border-amber-500 text-slate-950 shadow-md font-bold"
              : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Todas las Categorías
        </button>

        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-all ${
              selectedCategoryId === cat.id
                ? "bg-slate-700 border-amber-500 text-amber-300 font-bold shadow-md"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750"
            } ${!cat.isActive ? "opacity-60 bg-red-950/20 border-red-900/40" : ""}`}
          >
            <button
              onClick={() => onSelectCategory(cat.id)}
              className="flex items-center gap-1.5 py-0.5 text-left focus:outline-none"
            >
              <span>{cat.name}</span>
              <span className="px-1.5 py-0.2 bg-slate-900/80 rounded-full text-[10px] text-slate-400 font-mono">
                {cat.itemsCount || 0}
              </span>
            </button>

            {/* Acciones de reordenamiento y desactivación */}
            <div className="flex items-center gap-0.5 ml-1 border-l border-slate-700/60 pl-1">
              <button
                disabled={idx === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveCategory(cat.id, "up");
                }}
                title="Mover arriba"
                className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                disabled={idx === categories.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveCategory(cat.id, "down");
                }}
                title="Mover abajo"
                className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleActive(cat.id, cat.isActive);
                }}
                title={
                  cat.isActive ? "Desactivar categoría" : "Activar categoría"
                }
                className={`p-0.5 rounded text-[10px] ${
                  cat.isActive
                    ? "text-emerald-400 hover:text-emerald-300"
                    : "text-red-400 hover:text-red-300"
                }`}
              >
                {cat.isActive ? "●" : "○"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
