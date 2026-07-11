import { NextRequest, NextResponse } from "next/server";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUser = {
  id: "u-001",
  firstName: "María",
  lastName: "González",
  email: "maria@example.com",
  phone: "0414-1234567",
  identityDocument: "V-12345678",
  level: 3,
  points: 1250,
  kycStatus: "APPROVED",
  active: true,
};

const mockCreditLines = [
  {
    id: "cl-001",
    type: "ESPECIALIDAD_PRINCIPAL",
    limitAmount: 5000,
    available: 3200,
  },
  {
    id: "cl-002",
    type: "SALUD_COTIDIANA",
    limitAmount: 1500,
    available: 850,
  },
  {
    id: "cl-003",
    type: "MAYOR_CUIDADO",
    limitAmount: 3000,
    available: 2800,
  },
];

const mockInstallments = [
  {
    id: "inst-001",
    dueDate: "2026-07-13",
    amount: 15,
    status: "PENDING",
    installmentNumber: 1,
    totalInstallments: 3,
    transaction: { id: "tx-001", merchant: { tradeName: "Farmatodo" } },
  },
  {
    id: "inst-002",
    dueDate: "2026-07-15",
    amount: 350,
    status: "PENDING",
    installmentNumber: 2,
    totalInstallments: 6,
    transaction: { id: "tx-002", merchant: { tradeName: "Clínica Ávila" } },
  },
  {
    id: "inst-003",
    dueDate: "2026-06-20",
    amount: 50,
    status: "PAID",
    installmentNumber: 1,
    totalInstallments: 2,
    transaction: { id: "tx-003", merchant: { tradeName: "BioAnalisis" } },
  },
  {
    id: "inst-004",
    dueDate: "2026-06-01",
    amount: 180,
    status: "OVERDUE",
    installmentNumber: 3,
    totalInstallments: 6,
    transaction: { id: "tx-002", merchant: { tradeName: "Clínica Ávila" } },
  },
  {
    id: "inst-005",
    dueDate: "2026-05-28",
    amount: 75,
    status: "OVERDUE",
    installmentNumber: 2,
    totalInstallments: 3,
    transaction: { id: "tx-004", merchant: { tradeName: "Farmacia Central" } },
  },
];

const mockTransactions = [
  {
    id: "tx-001",
    amount: 45,
    status: "COMPLETED",
    type: "PURCHASE",
    createdAt: "2026-06-15T10:23:00Z",
    merchant: { tradeName: "Farmatodo" },
    installments: mockInstallments.slice(0, 1),
  },
  {
    id: "tx-002",
    amount: 2100,
    status: "COMPLETED",
    type: "PURCHASE",
    createdAt: "2026-05-28T11:05:00Z",
    merchant: { tradeName: "Clínica Ávila" },
    installments: mockInstallments.slice(1, 2),
  },
];

const mockSubscriptions = [
  {
    id: "sub-001",
    status: "ACTIVE",
    plan: "Salud Cotidiana",
    monthlyAmount: 15,
    nextBilling: "2026-07-15",
    merchant: { tradeName: "Farmatodo" },
  },
  {
    id: "sub-002",
    status: "ACTIVE",
    plan: "Salud Plus",
    monthlyAmount: 30,
    nextBilling: "2026-07-10",
    merchant: { tradeName: "Farmacia El Alivio" },
  },
];

const mockTriages = [
  {
    id: "tr-001",
    symptoms: "Fiebre alta de 39°C, dolor de cabeza y malestar general.",
    perceivedSeverity: 3,
    priority: "HIGH",
    status: "COMPLETED",
    createdAt: "2026-06-20T08:00:00Z",
    recommendation: "Acudir a urgencias en menos de 6 horas.",
  },
  {
    id: "tr-002",
    symptoms: "Mareos frecuentes y náuseas después de comer.",
    perceivedSeverity: 2,
    priority: "MEDIUM",
    status: "COMPLETED",
    createdAt: "2026-06-25T10:45:00Z",
    recommendation: "Consultar con médico general en 48 horas.",
  },
];

const mockElderCareSubscriptions = [
  {
    id: "ec-001",
    status: "ACTIVE",
    serviceType: "VISITA_DIARIA",
    monthlyAmount: 200,
    merchant: { tradeName: "Cuidados Ana" },
  },
  {
    id: "ec-002",
    status: "ACTIVE",
    serviceType: "ENFERMERIA_24H",
    monthlyAmount: 500,
    merchant: { tradeName: "Centro de Cuidados Norte" },
  },
];

const mockRecommendedMerchants = [
  {
    id: "m-001",
    tradeName: "Clínica Santa María",
    category: "CLINIC",
    city: "Caracas",
  },
  {
    id: "m-002",
    tradeName: "Laboratorio BioAnalisis",
    category: "LAB",
    city: "Caracas",
  },
];

// ─── Router ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolve(path: string[], method: string, body: any): any {
  const route = path.join("/");

  // Auth
  if (method === "POST" && route === "auth/login") {
    return { token: "demo-token", user: mockUser };
  }
  if (method === "POST" && route === "auth/register") {
    return { token: "demo-token", user: { ...mockUser, ...body } };
  }

  // Credit lines
  if (route === "patient/credit-lines") return mockCreditLines;

  // Transactions
  if (route === "patient/transactions/my") return mockTransactions;
  if (route === "patient/transactions/my/installments/pending") {
    return mockInstallments.filter((i) => i.status === "PENDING" || i.status === "OVERDUE");
  }
  if (route.match(/^patient\/installments\/[^/]+$/) && method === "GET") {
    const id = route.split("/")[2];
    return mockInstallments.find((i) => i.id === id) ?? null;
  }
  if (method === "POST" && route === "patient/transactions/preview") {
    const amount = Number(body?.amount ?? 100);
    const installments = Number(body?.requestedInstallments ?? 3);
    const each = amount / installments;
    return {
      merchantId: body?.merchantId,
      amount,
      requestedInstallments: installments,
      installments: Array.from({ length: installments }, (_, i) => ({
        amount: each,
        dueDate: new Date(Date.now() + (i + 1) * 30 * 86400000).toISOString(),
        installmentNumber: i + 1,
      })),
      total: amount,
    };
  }
  if (method === "POST" && route === "patient/transactions") {
    return { id: "tx-new", status: "COMPLETED", ...body };
  }

  // Payments
  if (method === "POST" && route === "patient/payments") {
    return { id: "pay-new", status: "COMPLETED", ...body };
  }

  // Subscriptions (pharmacy)
  if (route === "patient/subscriptions") return mockSubscriptions;
  if (method === "DELETE" && route.match(/^patient\/subscriptions\/.+$/)) {
    return new NextResponse(null, { status: 204 });
  }

  // Triage
  if (route === "patient/triage") {
    if (method === "POST") {
      return {
        id: "tr-new",
        ...body,
        priority: Number(body?.perceivedSeverity) >= 3 ? "HIGH" : "MEDIUM",
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
        recommendation: "Seguir indicaciones del médico asignado.",
      };
    }
    return mockTriages;
  }
  if (route.match(/^patient\/triage\/[^/]+$/) && method === "GET") {
    const id = route.split("/")[2];
    return mockTriages.find((t) => t.id === id) ?? mockTriages[0];
  }
  if (route.match(/^patient\/triage\/[^/]+\/recommended-merchants$/)) {
    return mockRecommendedMerchants;
  }
  if (method === "POST" && route.match(/^patient\/triage\/[^/]+\/book$/)) {
    return { id: "tx-book", status: "COMPLETED", ...body };
  }

  // Elder care
  if (route === "patient/elder-care/subscriptions") {
    if (method === "POST") {
      return { id: "ec-new", status: "ACTIVE", ...body };
    }
    return mockElderCareSubscriptions;
  }
  if (method === "DELETE" && route.match(/^patient\/elder-care\/subscriptions\/.+$/)) {
    return new NextResponse(null, { status: 204 });
  }

  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (process.env.NEXT_PUBLIC_MOCK_API !== "true") {
    return NextResponse.json({ error: "Mock API disabled" }, { status: 404 });
  }
  const { path } = await params;
  const data = resolve(path, "GET", null);
  if (data instanceof NextResponse) return data;
  if (!data) return NextResponse.json({ error: "Mock not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (process.env.NEXT_PUBLIC_MOCK_API !== "true") {
    return NextResponse.json({ error: "Mock API disabled" }, { status: 404 });
  }
  const { path } = await params;
  const body = await req.json().catch(() => ({}));
  const data = resolve(path, "POST", body);
  if (data instanceof NextResponse) return data;
  if (!data) return NextResponse.json({ error: "Mock not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (process.env.NEXT_PUBLIC_MOCK_API !== "true") {
    return NextResponse.json({ error: "Mock API disabled" }, { status: 404 });
  }
  const { path } = await params;
  const data = resolve(path, "DELETE", null);
  if (data instanceof NextResponse) return data;
  if (!data) return NextResponse.json({ error: "Mock not found" }, { status: 404 });
  return NextResponse.json(data);
}
