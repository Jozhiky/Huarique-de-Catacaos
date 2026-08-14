import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { MenuCategory, MenuItem, MenuItemVariant } from "@huarique/domain";
import { menuService } from "../../services/menuService";
import { CategoryManager } from "./CategoryManager";
import { ProductCard } from "./ProductCard";
import { ProductEditorModal } from "./ProductEditorModal";
import { VariantManager } from "./VariantManager";
import { AvailabilityRulesModal } from "./AvailabilityRulesModal";
import { EditPriceModal } from "./EditPriceModal";
import {
  Search,
  Plus,
  RefreshCw,
  Utensils,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export const AdminMenu: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtros
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [variantModalProduct, setVariantModalProduct] =
    useState<MenuItem | null>(null);

  const [isDaysModalOpen, setIsDaysModalOpen] = useState(false);
  const [daysModalProduct, setDaysModalProduct] = useState<MenuItem | null>(
    null,
  );

  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<MenuItemVariant | null>(
    null,
  );
  const [isConfirmValidation, setIsConfirmValidation] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const loadMenuData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuService.getFullMenu();
      setCategories(data.categories);
      setItems(data.items);
    } catch (err: unknown) {
      console.error("Error al cargar la carta:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Error al conectar con la base de datos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  // Manejo de Categorías
  const handleCreateCategory = async (name: string) => {
    try {
      await menuService.createCategory(name, categories.length + 1);
      showSuccess(`Categoría "${name}" creada con éxito.`);
      await loadMenuData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al crear la categoría",
      );
    }
  };

  const handleToggleCategoryActive = async (
    categoryId: string,
    currentActive: boolean,
  ) => {
    try {
      await menuService.toggleCategoryActive(categoryId, !currentActive);
      showSuccess("Estado de categoría actualizado.");
      await loadMenuData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado");
    }
  };

  const handleMoveCategory = async (
    categoryId: string,
    direction: "up" | "down",
  ) => {
    const idx = categories.findIndex((c) => c.id === categoryId);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const newCategories = [...categories];
    const [moved] = newCategories.splice(idx, 1);
    if (moved) {
      newCategories.splice(targetIdx, 0, moved);
    }

    try {
      await menuService.reorderCategories(newCategories.map((c) => c.id));
      await loadMenuData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al reordenar");
    }
  };

  // Manejo de Productos
  const handleSaveProduct = async (data: {
    productId?: string;
    categoryId: string;
    name: string;
    description: string | null;
    displayOrder: number;
  }) => {
    if (data.productId) {
      await menuService.updateProduct(
        data.productId,
        data.name,
        data.description,
        data.displayOrder,
      );
      showSuccess(`Plato "${data.name}" actualizado.`);
    } else {
      const newId = await menuService.createProduct(
        data.categoryId,
        data.name,
        data.description,
        data.displayOrder,
      );
      // Por defecto crear variante Personal con S/ 20 para permitir ordenarlo
      await menuService.createVariant(newId, "Porción", 20.0, 1);
      showSuccess(`Plato "${data.name}" creado con éxito.`);
    }
    await loadMenuData();
  };

  const handleToggleProductAvailability = async (
    productId: string,
    isAvailable: boolean,
  ) => {
    try {
      await menuService.toggleProductAvailability(productId, isAvailable);
      showSuccess(
        isAvailable
          ? "Plato marcado como Disponible."
          : "Plato marcado como Agotado.",
      );
      await loadMenuData();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar disponibilidad",
      );
    }
  };

  const handleToggleProductActive = async (
    productId: string,
    isActive: boolean,
  ) => {
    try {
      await menuService.toggleProductActive(productId, !isActive);
      showSuccess(
        isActive ? "Plato desactivado de la carta." : "Plato activado.",
      );
      await loadMenuData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado");
    }
  };

  // Manejo de Variantes y Precios
  const handleSavePrice = async (
    variantId: string,
    newPrice: number,
    isConfirm: boolean,
  ) => {
    if (isConfirm) {
      await menuService.confirmValidatedPrice(variantId, newPrice);
      showSuccess(`Precio VALIDAR confirmado en S/ ${newPrice.toFixed(2)}.`);
    } else {
      await menuService.updateVariantPrice(variantId, newPrice);
      showSuccess(`Precio actualizado a S/ ${newPrice.toFixed(2)}.`);
    }
    await loadMenuData();
  };

  const handleToggleVariantOrderable = async (
    variantId: string,
    currentOrderable: boolean,
  ) => {
    try {
      await menuService.toggleVariantOrderable(variantId, !currentOrderable);
      showSuccess("Ordenabilidad de variante modificada.");
      await loadMenuData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al modificar variante",
      );
    }
  };

  // Filtrado y estadísticas
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      map.set(c.id, c.name);
    }
    return map;
  }, [categories]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategoryId
        ? item.categoryId === selectedCategoryId
        : true;
      const matchSearch = searchQuery.trim()
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return matchCat && matchSearch;
    });
  }, [items, selectedCategoryId, searchQuery]);

  const metrics = useMemo(() => {
    const totalDishes = items.length;
    const activeDishes = items.filter((i) => i.isActive).length;
    const pendingValidation = items.reduce(
      (acc, i) => acc + i.variants.filter((v) => v.priceNeedsValidation).length,
      0,
    );
    const unavailableDishes = items.filter(
      (i) => !i.isAvailable && i.isActive,
    ).length;

    return { totalDishes, activeDishes, pendingValidation, unavailableDishes };
  }, [items]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f172a] text-slate-100 p-4 md:p-6 overflow-y-auto">
      {/* Barra de Notificaciones y Errores */}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-950/90 border border-red-500/60 rounded-xl text-red-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-lg">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="px-2 py-0.5 bg-red-900/60 hover:bg-red-900 text-white rounded text-[10px]"
          >
            Descartar
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider font-title">
              Administración de Carta y Precios
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión en tiempo real de categorías, platos, presentaciones,
            disponibilidad y confirmación de precios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadMenuData()}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refrescar carta"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Plato</span>
          </button>
        </div>
      </div>

      {/* Métricas de Control */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Platos
          </span>
          <span className="text-2xl font-mono font-black text-white mt-1">
            {metrics.totalDishes}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Platos Activos
          </span>
          <span className="text-2xl font-mono font-black text-emerald-400 mt-1">
            {metrics.activeDishes}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Por Validar
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-mono font-black text-amber-300 mt-1">
            {metrics.pendingValidation}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Agotados Hoy
          </span>
          <span className="text-2xl font-mono font-black text-red-400 mt-1">
            {metrics.unavailableDishes}
          </span>
        </div>
      </div>

      {/* Administrador de Categorías */}
      <CategoryManager
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onCreateCategory={handleCreateCategory}
        onToggleActive={handleToggleCategoryActive}
        onMoveCategory={handleMoveCategory}
      />

      {/* Barra de Búsqueda */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar plato por nombre o descripción (ej. Ceviche mixto, Seco de chavelo)..."
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Grid de Platos */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-2" />
          <span className="text-xs uppercase tracking-widest font-semibold">
            Cargando carta oficial...
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 border border-dashed border-slate-800 rounded-2xl">
          <Utensils className="w-10 h-10 text-slate-600 mb-2" />
          <span className="text-sm font-semibold">
            No se encontraron platos con los filtros aplicados.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              categoryName={categoryMap.get(item.categoryId)}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }}
              onManageVariants={(p) => {
                setVariantModalProduct(p);
                setIsVariantModalOpen(true);
              }}
              onConfigureDays={(p) => {
                setDaysModalProduct(p);
                setIsDaysModalOpen(true);
              }}
              onToggleAvailability={handleToggleProductAvailability}
              onToggleActive={handleToggleProductActive}
              onEditVariantPrice={(v, isConfirm) => {
                setEditingVariant(v);
                setIsConfirmValidation(Boolean(isConfirm));
                setIsPriceModalOpen(true);
              }}
              onToggleVariantOrderable={handleToggleVariantOrderable}
            />
          ))}
        </div>
      )}

      {/* Modales de Administración */}
      <ProductEditorModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        categories={categories}
        initialProduct={editingProduct}
        defaultCategoryId={selectedCategoryId}
        onSave={handleSaveProduct}
      />

      <VariantManager
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        product={variantModalProduct}
        onCreateVariant={async (prodId, name, price) => {
          await menuService.createVariant(prodId, name, price);
          showSuccess(`Presentación "${name}" añadida.`);
        }}
        onToggleActive={async (varId, active) => {
          await menuService.toggleVariantActive(varId, !active);
        }}
        onToggleOrderable={async (varId, orderable) => {
          await menuService.toggleVariantOrderable(varId, !orderable);
        }}
        onRefreshMenu={loadMenuData}
      />

      <AvailabilityRulesModal
        isOpen={isDaysModalOpen}
        onClose={() => setIsDaysModalOpen(false)}
        product={daysModalProduct}
        onSaveDays={async (prodId, days) => {
          await menuService.setProductAvailabilityRules(prodId, days);
          showSuccess("Reglas de disponibilidad semanal actualizadas.");
          await loadMenuData();
        }}
      />

      <EditPriceModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        variant={editingVariant}
        isConfirmValidation={isConfirmValidation}
        onSavePrice={handleSavePrice}
      />
    </div>
  );
};
