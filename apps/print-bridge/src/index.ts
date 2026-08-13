/**
 * @huarique/print-bridge
 * Daemon local de impresión térmica para cocina — El Huarique de Catacaos
 * Diseñado bajo el principio de menor privilegio (staff_role = 'printer_agent')
 */

export * from "./types.js";

export function getPrintBridgeInfo() {
  return {
    name: "El Huarique de Catacaos — Print Bridge Daemon",
    version: "1.0.0",
    protocol: "TCP/IP ESC/POS",
    port: 9100,
    status: "initialized_ready_for_phase_5",
  };
}
