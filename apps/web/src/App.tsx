import React, { useState, useRef } from "react";
import {
  TabletShell,
  Button,
  TableStatusPill,
  PrintJobStatusPill,
  NumericKeypad,
  Modal,
} from "@huarique/ui";
import {
  formatPEN,
  type TableStatus,
  type PrintJobStatus,
} from "@huarique/domain";
import { Users, Layers, ShieldCheck, Wifi, WifiOff } from "lucide-react";

interface SelectedTableState {
  number: number;
  capacity: number;
  status: TableStatus;
  total: number;
  waiter: string;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("mesas");
  const [selectedDiningRoom, setSelectedDiningRoom] = useState<
    "salon1" | "salon2" | "salon3"
  >("salon1");
  const [isOnline, setIsOnline] = useState(true);
  const [pinValue, setPinValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<SelectedTableState | null>(
    null,
  );

  // Referencias para accesibilidad y foco
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Demostración de mesas de los 3 salones (80 mesas totales: 30 / 25 / 25)
  const diningRooms = [
    { id: "salon1", name: "Salón Principal", count: 30, offset: 0 },
    { id: "salon2", name: "Salón Familiar", count: 25, offset: 30 },
    { id: "salon3", name: "Salón Terraza", count: 25, offset: 55 },
  ];

  const currentRoom =
    diningRooms.find((r) => r.id === selectedDiningRoom) ?? diningRooms[0]!;

  // Generación determinista de estados de mesa para demostración realista
  const tables: SelectedTableState[] = Array.from(
    { length: currentRoom.count },
    (_, i) => {
      const tableNumber = currentRoom.offset + i + 1;
      let status: TableStatus = "free";
      let total = 0;
      let waiter = "Carlos";

      if (tableNumber % 7 === 0) {
        status = "waiting_payment";
        total = 145.0;
        waiter = "Milagros";
      } else if (tableNumber % 4 === 0) {
        status = "waiting_kitchen";
        total = 78.0;
        waiter = "Ana";
      } else if (tableNumber % 3 === 0) {
        status = "occupied";
        total = 92.5;
        waiter = "José";
      } else if (tableNumber % 5 === 0) {
        status = "served";
        total = 110.0;
        waiter = "Carlos";
      }

      return {
        number: tableNumber,
        capacity: tableNumber % 2 === 0 ? 4 : 6,
        status,
        total,
        waiter,
      };
    },
  );

  const samplePrintStatuses: PrintJobStatus[] = [
    "pending",
    "claimed",
    "sent_unconfirmed",
    "printed_assumed",
    "printed_confirmed",
    "failed",
    "cancelled",
  ];

  const handleOpenTableModal = (
    table: SelectedTableState,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    modalTriggerRef.current = e.currentTarget;
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  return (
    <TabletShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      staffName="Carlos Gómez"
      staffRole="waiter"
      isOnline={isOnline}
      onLockSession={() => {
        setPinValue("");
        alert("Sesión bloqueada por seguridad. Ingrese su PIN de mozo.");
      }}
    >
      {/* Contenido según la pestaña activa */}
      {activeTab === "mesas" && (
        <div className="h-full flex flex-col p-3 sm:p-4 gap-3 overflow-hidden">
          {/* Barra de Filtros y Salones */}
          <div className="flex items-center justify-between bg-surface px-4 py-2.5 rounded-card shadow-sm border border-neutral-200 shrink-0">
            {/* Selector de Salones con Objetivos Táctiles >= 48px */}
            <div
              className="flex items-center gap-2"
              role="tablist"
              aria-label="Selector de Salones"
            >
              <Layers
                className="h-5 w-5 text-brand-navy mr-1 shrink-0"
                aria-hidden="true"
              />
              {diningRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedDiningRoom === room.id}
                  onClick={() =>
                    setSelectedDiningRoom(
                      room.id as "salon1" | "salon2" | "salon3",
                    )
                  }
                  className={`min-h-[48px] min-w-[48px] px-4 sm:px-5 py-2.5 rounded-touch font-display text-sm sm:text-base font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold ${
                    selectedDiningRoom === room.id
                      ? "bg-brand-navy text-brand-gold shadow-sm"
                      : "bg-brand-cream text-brand-navy hover:bg-[#EBE4D5]"
                  }`}
                >
                  {room.name} ({room.count})
                </button>
              ))}
            </div>

            {/* Leyenda de Estados */}
            <div className="hidden xl:flex items-center gap-2 text-xs">
              <TableStatusPill status="free" size="sm" />
              <TableStatusPill status="occupied" size="sm" />
              <TableStatusPill status="waiting_kitchen" size="sm" />
              <TableStatusPill status="served" size="sm" />
              <TableStatusPill status="waiting_payment" size="sm" />
            </div>
          </div>

          {/* Cuadrícula Táctil Accesible de Mesas (<button> nativo) */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3 pb-4">
              {tables.map((table) => (
                <button
                  key={table.number}
                  type="button"
                  onClick={(e) => handleOpenTableModal(table, e)}
                  aria-label={`Mesa ${table.number}, Capacidad ${table.capacity} personas, Estado ${table.status}, Mozo ${table.waiter}, Total ${formatPEN(table.total)}`}
                  className={`min-h-[110px] w-full text-left p-3 rounded-card bg-surface border-2 transition-all cursor-pointer select-none active:scale-95 shadow-sm flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-brand-navy ${
                    table.status === "free"
                      ? "border-success/40 hover:border-success"
                      : table.status === "waiting_kitchen"
                        ? "border-warning/60 bg-[#FFFDF9]"
                        : table.status === "waiting_payment"
                          ? "border-brand-gold bg-[#FCFBF8]"
                          : "border-brand-coastal/40 hover:border-brand-coastal"
                  }`}
                >
                  {/* Fila superior: Número de mesa y capacidad */}
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display text-2xl font-black text-brand-navy">
                      MESA {table.number}
                    </span>
                    <span className="flex items-center text-xs font-sans text-neutral-600 font-semibold gap-0.5">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {table.capacity}
                    </span>
                  </div>

                  {/* Estado Visual */}
                  <div className="my-1">
                    <TableStatusPill status={table.status} size="sm" />
                  </div>

                  {/* Fila inferior: Total o Mozo */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-200/60 w-full">
                    <span className="text-neutral-600 truncate max-w-[80px]">
                      {table.waiter}
                    </span>
                    <span className="font-display text-sm font-bold text-brand-navy tabular-nums">
                      {table.status !== "free" ? formatPEN(table.total) : "—"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pestaña: Catálogo de Componentes del Design System */}
      {activeTab === "pedidos" && (
        <div className="h-full overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          <div className="bg-surface p-6 rounded-card shadow-sm border border-neutral-200">
            <h2 className="font-display text-2xl font-bold text-brand-navy tracking-wide uppercase mb-1">
              Catálogo de Botones y Objetivos Táctiles (Mínimo 48 x 48 px)
            </h2>
            <p className="text-sm text-neutral-600 mb-4 font-sans">
              Todos los botones y controles táctiles cumplen estrictamente con
              dimensiones mínimas reales de 48×48 px.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="brand">Botón Brand Navy</Button>
              <Button variant="gold">Botón Gold Accent</Button>
              <Button variant="coastal">Botón Costero</Button>
              <Button variant="success">Confirmar / Pagado</Button>
              <Button variant="danger">Anular / Eliminar</Button>
              <Button variant="outline">Secundario Outline</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Badges de Estados de Mesas y Comandas */}
            <div className="bg-surface p-6 rounded-card shadow-sm border border-neutral-200">
              <h3 className="font-display text-xl font-bold text-brand-navy uppercase mb-3">
                Estados de Impresión y Cola (Fase 5)
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {samplePrintStatuses.map((st) => (
                  <PrintJobStatusPill key={st} status={st} />
                ))}
              </div>
            </div>

            {/* Teclado Numérico Táctil */}
            <div className="bg-surface p-6 rounded-card shadow-sm border border-neutral-200 flex flex-col items-center">
              <h3 className="font-display text-xl font-bold text-brand-navy uppercase mb-2">
                Teclado Numérico para PIN de Mozo
              </h3>
              <div className="w-full max-w-[300px] mb-3 p-3 bg-brand-cream rounded-touch text-center border border-neutral-200">
                <span className="font-sans text-xs text-neutral-600 block mb-1">
                  PIN Ingresado (Máx 6 dígitos):
                </span>
                <span
                  className="font-display text-3xl font-black tracking-widest text-brand-navy"
                  data-testid="pin-display"
                >
                  {pinValue ? (
                    "•".repeat(pinValue.length)
                  ) : (
                    <span className="text-neutral-400">______</span>
                  )}
                </span>
              </div>
              <NumericKeypad
                value={pinValue}
                onChange={setPinValue}
                maxLength={6}
                onSubmit={() =>
                  alert(`PIN verificado exitosamente: ${pinValue}`)
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Pestañas Informativas y de Auditoría */}
      {(activeTab === "caja" ||
        activeTab === "inventario" ||
        activeTab === "dashboard") && (
        <div className="h-full flex items-center justify-center p-8">
          <div className="bg-surface p-8 rounded-card max-w-xl text-center shadow-md border border-brand-gold/30">
            <div className="h-16 w-16 bg-[#072440] text-brand-gold rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-gold/30">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="font-display text-3xl font-bold text-brand-navy uppercase tracking-wide mb-2">
              Fase 1: Fundaciones y Tokens Completados
            </h2>
            <p className="text-sm text-neutral-600 font-sans leading-relaxed mb-6">
              Esta sección operativa será implementada secuencialmente en las
              Fases 6, 7 y 8 según el plan maestro aprobado. Toda la
              arquitectura por capas, sistema de tokens y tipografías locales ya
              se encuentran listos y verificados.
            </p>
            <Button variant="brand" onClick={() => setActiveTab("mesas")}>
              Volver a Salones y Mesas
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Mesa Accesible */}
      {selectedTable && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Detalle de Mesa ${selectedTable.number}`}
          subtitle={`Salón: ${currentRoom.name} — Capacidad: ${selectedTable.capacity} comensales`}
          footer={
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsModalOpen(false)}
              >
                Cerrar
              </Button>
              {selectedTable.status === "free" ? (
                <Button
                  variant="brand"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Abrir Pedido
                </Button>
              ) : (
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Ver Comanda
                </Button>
              )}
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-brand-cream rounded-touch border border-neutral-200">
              <span className="font-sans text-sm font-medium text-neutral-600">
                Estado Actual:
              </span>
              <TableStatusPill status={selectedTable.status} size="md" />
            </div>

            <div className="flex items-center justify-between p-3 bg-brand-cream rounded-touch border border-neutral-200">
              <span className="font-sans text-sm font-medium text-neutral-600">
                Mozo a cargo:
              </span>
              <span className="font-display text-base font-bold text-brand-navy">
                {selectedTable.waiter}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-brand-navy text-brand-gold rounded-touch border border-brand-gold/30">
              <span className="font-display text-base font-bold uppercase tracking-wider">
                Total Consumo:
              </span>
              <span className="font-display text-2xl font-black tabular-nums">
                {formatPEN(selectedTable.total)}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Botón Flotante de Desarrollo para Simular Conectividad (No ocupa espacio en la cabecera del POS) */}
      <div className="fixed bottom-3 right-3 z-40">
        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          aria-label="Alternar simulación de conexión"
          data-testid="toggle-offline-btn"
          className="min-h-[48px] min-w-[48px] px-3 py-2 rounded-touch bg-brand-navy text-brand-gold border border-brand-gold/40 shadow-lg text-xs font-display font-bold flex items-center gap-1.5 hover:bg-[#072440] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          {isOnline ? (
            <Wifi className="h-4 w-4 text-success" />
          ) : (
            <WifiOff className="h-4 w-4 text-warning" />
          )}
          <span>
            {isOnline ? "Dev: Simular Offline" : "Dev: Volver Online"}
          </span>
        </button>
      </div>
    </TabletShell>
  );
};

export default App;
