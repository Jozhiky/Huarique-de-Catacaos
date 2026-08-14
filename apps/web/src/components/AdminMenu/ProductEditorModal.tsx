import React, { useState, useEffect } from "react";
import type { MenuCategory, MenuItem } from "@huarique/domain";
import { X, Check } from "lucide-react";

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MenuCategory[];
  initialProduct?: MenuItem | null;
  defaultCategoryId?: string | null;
  onSave: (data: {
    productId?: string;
    categoryId: string;
    name: string;
    description: string | null;
    displayOrder: number;
  }) => Promise<void>;
}

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialProduct,
  defaultCategoryId,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setDescription(initialProduct.description || "");
      setCategoryId(initialProduct.categoryId);
      setDisplayOrder(initialProduct.displayOrder);
    } else {
      setName("");
      setDescription("");
      setCategoryId(defaultCategoryId || (categories[0]?.id ?? ""));
      setDisplayOrder(0);
    }
    setError(null);
  }, [initialProduct, defaultCategoryId, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      setError("El nombre y la categoría son obligatorios");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSave({
        productId: initialProduct?.id,
        categoryId,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        displayOrder: Number(displayOrder) || 0,
      });
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el producto",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <h3 className="text-lg font-bold text-white font-title tracking-wide uppercase">
            {initialProduct ? "Editar Plato" : "Nuevo Plato"}
          </h3>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nombre del Plato *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Seco de chavelo"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Categoría *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Descripción o Detalles Opcionales
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Humita con chifles, zarza criolla y guiso de cabrito"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Guardando..." : "Guardar Plato"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
