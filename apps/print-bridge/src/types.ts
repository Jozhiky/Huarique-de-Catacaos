import type { PrintJob, PrintJobStatus } from "@huarique/domain";

export interface PrinterBridgeConfig {
  supabaseUrl: string;
  agentToken: string;
  restaurantId: string;
  printerId: string;
  printerIp: string;
  printerPort: number;
  leaseSeconds: number;
  heartbeatSeconds: number;
}

export interface PrinterAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  print(
    job: PrintJob,
  ): Promise<{ success: boolean; error?: string; status: PrintJobStatus }>;
  checkStatus(): Promise<"online" | "offline" | "paper_out" | "unknown">;
}
