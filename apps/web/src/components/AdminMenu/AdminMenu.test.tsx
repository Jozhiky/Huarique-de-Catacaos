import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminMenu } from "./AdminMenu";
import { menuService } from "../../services/menuService";

vi.mock("../../services/menuService", () => ({
  menuService: {
    getFullMenu: vi.fn(),
    createCategory: vi.fn(),
    toggleCategoryActive: vi.fn(),
    reorderCategories: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    toggleProductActive: vi.fn(),
    toggleProductAvailability: vi.fn(),
    createVariant: vi.fn(),
    toggleVariantActive: vi.fn(),
    toggleVariantOrderable: vi.fn(),
    updateVariantPrice: vi.fn(),
    confirmValidatedPrice: vi.fn(),
    setProductAvailabilityRules: vi.fn(),
  },
}));

const mockFullMenu = {
  categories: [
    {
      id: "cat-1",
      restaurantId: "rest-1",
      name: "Ceviches",
      displayOrder: 1,
      isActive: true,
      itemsCount: 2,
    },
    {
      id: "cat-2",
      restaurantId: "rest-1",
      name: "Entradas",
      displayOrder: 2,
      isActive: true,
      itemsCount: 1,
    },
  ],
  items: [
    {
      id: "prod-1",
      restaurantId: "rest-1",
      categoryId: "cat-1",
      name: "Ceviche Simple",
      description: "Pescado fresco del día con limón sutil",
      isActive: true,
      isAvailable: true,
      displayOrder: 1,
      variants: [
        {
          id: "var-1",
          restaurantId: "rest-1",
          productId: "prod-1",
          variantName: "Personal",
          price: 30,
          priceNeedsValidation: false,
          isOrderable: true,
          isActive: true,
          displayOrder: 1,
        },
      ],
    },
    {
      id: "prod-2",
      restaurantId: "rest-1",
      categoryId: "cat-1",
      name: "Caballa Saltpresa",
      description: "Típico norteño",
      isActive: true,
      isAvailable: true,
      displayOrder: 2,
      variants: [
        {
          id: "var-2",
          restaurantId: "rest-1",
          productId: "prod-2",
          variantName: "Fuente",
          price: 100,
          priceNeedsValidation: true,
          isOrderable: false,
          isActive: true,
          displayOrder: 1,
        },
      ],
    },
  ],
};

describe("AdminMenu Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(menuService.getFullMenu).mockResolvedValue(mockFullMenu);
  });

  it("renderiza la cabecera, métricas, categorías y platos cargados", async () => {
    render(<AdminMenu />);

    await waitFor(() => {
      expect(
        screen.getByText(/Administración de Carta y Precios/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Ceviche Simple")).toBeInTheDocument();
    expect(screen.getByText("Caballa Saltpresa")).toBeInTheDocument();
    expect(screen.getByText("VALIDAR")).toBeInTheDocument();
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });

  it("filtra platos mediante el buscador de texto", async () => {
    render(<AdminMenu />);

    await waitFor(() => {
      expect(screen.getByText("Ceviche Simple")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Buscar plato por nombre o descripción/i,
    );
    fireEvent.change(searchInput, { target: { value: "Saltpresa" } });

    expect(screen.queryByText("Ceviche Simple")).not.toBeInTheDocument();
    expect(screen.getByText("Caballa Saltpresa")).toBeInTheDocument();
  });

  it("permite alternar la disponibilidad de un plato (Disponible <-> Agotado)", async () => {
    vi.mocked(menuService.toggleProductAvailability).mockResolvedValue(
      undefined,
    );
    render(<AdminMenu />);

    await waitFor(() => {
      expect(screen.getByText("Ceviche Simple")).toBeInTheDocument();
    });

    const availableButtons = screen.getAllByRole("button", {
      name: /Disponible/i,
    });
    if (availableButtons[0]) {
      fireEvent.click(availableButtons[0]);
    }

    await waitFor(() => {
      expect(menuService.toggleProductAvailability).toHaveBeenCalledWith(
        "prod-1",
        false,
      );
    });
  });

  it("abre el modal de confirmación de precio VALIDAR al pulsar 'Confirmar'", async () => {
    render(<AdminMenu />);

    await waitFor(() => {
      expect(screen.getByText("Caballa Saltpresa")).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole("button", { name: "Confirmar" });
    fireEvent.click(confirmButton);

    expect(screen.getByText(/Confirmar Precio Oficial/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Este plato estaba registrado como/i),
    ).toBeInTheDocument();
  });
});
