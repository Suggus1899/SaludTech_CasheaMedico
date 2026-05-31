import { NextRequest, NextResponse } from "next/server";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockDailyTxs = [
  { id: "QR-20240528-001", amount: "$120.00", mdrFee: "$3.60", status: "Liquidado", time: "09:15 AM" },
  { id: "QR-20240528-002", amount: "$45.50", mdrFee: "$1.37", status: "Liquidado", time: "10:42 AM" },
  { id: "QR-20240528-003", amount: "$200.00", mdrFee: "$6.00", status: "Pendiente", time: "11:30 AM" },
];

const mockHistoryTxs = [
  { id: "QR-20240527-001", amount: "$75.00", mdrFee: "$2.25", status: "Liquidado", date: "2024-05-27", patient: "Carlos Pérez" },
  { id: "QR-20240527-002", amount: "$30.00", mdrFee: "$0.90", status: "Fallido", date: "2024-05-27", patient: "Diego Ramírez" },
  { id: "QR-20240526-001", amount: "$90.00", mdrFee: "$2.70", status: "Liquidado", date: "2024-05-26", patient: "Valentina Torres" },
  { id: "QR-20240526-002", amount: "$55.00", mdrFee: "$1.65", status: "Liquidado", date: "2024-05-26", patient: "José Flores" },
  { id: "QR-20240525-001", amount: "$160.00", mdrFee: "$4.80", status: "Liquidado", date: "2024-05-25", patient: "Luisa Martínez" },
  { id: "QR-20240525-002", amount: "$25.00", mdrFee: "$0.75", status: "Pendiente", date: "2024-05-25", patient: "María González" },
  { id: "QR-20240524-001", amount: "$310.00", mdrFee: "$9.30", status: "Liquidado", date: "2024-05-24", patient: "Carlos Pérez" },
  { id: "QR-20240523-001", amount: "$80.00", mdrFee: "$2.40", status: "Liquidado", date: "2024-05-23", patient: "Sofía López" },
  { id: "QR-20240523-002", amount: "$140.00", mdrFee: "$4.20", status: "Liquidado", date: "2024-05-23", patient: "Andrés Rodríguez" },
  { id: "QR-20240522-001", amount: "$65.00", mdrFee: "$1.95", status: "Liquidado", date: "2024-05-22", patient: "María González" },
];

const mockPayouts = [
  { id: "pay-001", amount: 892.50, fee: 26.78, net: 865.72, status: "COMPLETED", period: "2024-05-01 / 2024-05-15", paidAt: "2024-05-17" },
  { id: "pay-002", amount: 1240.00, fee: 37.20, net: 1202.80, status: "PENDING", period: "2024-05-16 / 2024-05-31", paidAt: null },
];

const mockElderSubs = [
  { id: "ec-001", patientName: "Ana Herrera", age: 72, plan: "Premium", status: "ACTIVE", monthlyFee: 80.00, nextBilling: "2024-06-15" },
  { id: "ec-002", patientName: "Pedro Suárez", age: 68, plan: "Básico", status: "ACTIVE", monthlyFee: 40.00, nextBilling: "2024-06-10" },
  { id: "ec-003", patientName: "Carmen Vega", age: 75, plan: "Premium", status: "PENDING", monthlyFee: 80.00, nextBilling: null },
];

// ─── Router ───────────────────────────────────────────────────────────────────

function resolve(path: string[], method: string) {
  const route = path.join("/");

  if (method === "POST" && route === "auth/login") {
    return { token: "demo-token", user: { id: "mc-001", email: "comercio@saludtech.com", firstName: "Clínica", lastName: "Santa María", role: "MERCHANT", merchantId: "m-001" } };
  }
  if (method === "POST" && route === "merchant/qr/generate") {
    return { token: "qr-demo-token-abc123", expiresAt: new Date(Date.now() + 300000).toISOString() };
  }
  if (route.match(/^merchant\/qr\/.+\/status$/)) return { status: "PENDING" };
  if (route === "merchant/reconciliation/transactions/today") return mockDailyTxs;
  if (route === "merchant/reconciliation/transactions") return mockHistoryTxs;
  if (route === "merchant/payouts") return mockPayouts;
  if (route === "merchant/elder-care/subscriptions") return mockElderSubs;

  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const data = resolve(path, "GET");
  if (!data) return NextResponse.json({ error: "Mock not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const data = resolve(path, "POST");
  if (!data) return NextResponse.json({ error: "Mock not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return NextResponse.json({ success: true });
}
