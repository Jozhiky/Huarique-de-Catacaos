import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "./App";

describe("Aplicación Principal y Criterios de Accesibilidad — El Huarique de Catacaos", () => {
  it("renderiza la cabecera institucional y el logo oficial transparente", () => {
    render(<App />);
    const logo = screen.getByAltText("Huarique de Catacaos");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute(
      "src",
      "/brand/huarique-logo-transparente.png",
    );
  });

  it("muestra las pestañas de navegación táctiles con roles de botón (Mesas, Pedidos, Caja, Stock, Panel)", () => {
    render(<App />);
    const nav = screen.getByLabelText("Pestañas principales");
    expect(nav).toBeInTheDocument();
    expect(within(nav).getByText("Mesas")).toBeInTheDocument();
    expect(within(nav).getByText("Pedidos")).toBeInTheDocument();
    expect(within(nav).getByText("Caja")).toBeInTheDocument();
    expect(within(nav).getByText("Stock")).toBeInTheDocument();
    expect(within(nav).getByText("Panel")).toBeInTheDocument();
  });

  it("renderiza las mesas como botones interactivos y accesibles con aria-label", () => {
    render(<App />);
    const tableButton = screen.getByRole("button", { name: /Mesa 1,/i });
    expect(tableButton).toBeInTheDocument();
    expect(tableButton.tagName).toBe("BUTTON");
  });

  it("abre el modal accesible de detalle al hacer clic en una mesa y permite cerrarlo con Escape", () => {
    render(<App />);
    const tableButton = screen.getByRole("button", { name: /Mesa 7,/i });
    fireEvent.click(tableButton);

    // Modal dialog debe estar abierto y contener los datos de Mesa 7
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText("Detalle de Mesa 7")).toBeInTheDocument();
    expect(within(modal).getByText("Milagros")).toBeInTheDocument();
    expect(within(modal).getByText("S/ 145.00")).toBeInTheDocument();

    // Cerrar modal con Escape
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("permite alternar entre los tres salones (Principal, Familiar, Terraza)", () => {
    render(<App />);
    const tablist = screen.getByRole("tablist", {
      name: "Selector de Salones",
    });
    const familiarTab = within(tablist).getByRole("tab", {
      name: /Salón Familiar/i,
    });

    fireEvent.click(familiarTab);
    expect(familiarTab).toHaveAttribute("aria-selected", "true");
    // Salón Familiar inicia en Mesa 31
    expect(
      screen.getByRole("button", { name: /Mesa 31,/i }),
    ).toBeInTheDocument();
  });

  it("permite ingresar dígitos en el teclado numérico en la pestaña de pedidos", () => {
    render(<App />);
    const nav = screen.getByLabelText("Pestañas principales");
    const pedidosTab = within(nav).getByText("Pedidos");
    fireEvent.click(pedidosTab);

    // Debe mostrar el teclado numérico
    const digit1 = screen.getByRole("button", { name: "1" });
    const digit2 = screen.getByRole("button", { name: "2" });
    fireEvent.click(digit1);
    fireEvent.click(digit2);

    const pinDisplay = screen.getByTestId("pin-display");
    expect(pinDisplay.textContent).toBe("••");
  });
});
