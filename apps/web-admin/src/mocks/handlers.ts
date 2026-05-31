import { http, HttpResponse } from "msw";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUsers = [
  { id: "u-001", firstName: "María", lastName: "González", email: "maria@example.com", phone: "0414-1234567", identityDocument: "V-12345678", active: true, kycStatus: "APPROVED", createdAt: "2024-01-15" },
  { id: "u-002", firstName: "Carlos", lastName: "Pérez", email: "carlos@example.com", phone: "0424-2345678", identityDocument: "V-23456789", active: true, kycStatus: "APPROVED", createdAt: "2024-02-10" },
  { id: "u-003", firstName: "Luisa", lastName: "Martínez", email: "luisa@example.com", phone: "0416-3456789", identityDocument: "V-34567890", active: false, kycStatus: "PENDING", createdAt: "2024-03-05" },
  { id: "u-004", firstName: "Andrés", lastName: "Rodríguez", email: "andres@example.com", phone: "0412-4567890", identityDocument: "V-45678901", active: true, kycStatus: "APPROVED", createdAt: "2024-03-22" },
  { id: "u-005", firstName: "Sofía", lastName: "López", email: "sofia@example.com", phone: "0426-5678901", identityDocument: "V-56789012", active: true, kycStatus: "APPROVED", createdAt: "2024-04-01" },
  { id: "u-006", firstName: "Diego", lastName: "Ramírez", email: "diego@example.com", phone: "0418-6789012", identityDocument: "V-67890123", active: false, kycStatus: "REJECTED", createdAt: "2024-04-15" },
  { id: "u-007", firstName: "Valentina", lastName: "Torres", email: "valentina@example.com", phone: "0414-7890123", identityDocument: "V-78901234", active: true, kycStatus: "APPROVED", createdAt: "2024-05-03" },
  { id: "u-008", firstName: "José", lastName: "Flores", email: "jose@example.com", phone: "0424-8901234", identityDocument: "V-89012345", active: true, kycStatus: "PENDING", createdAt: "2024-05-20" },
];

const mockMerchants = [
  { id: "m-001", legalName: "Clínica Santa María C.A.", tradeName: "Clínica Santa María", rif: "J-12345678-9", category: "CLINIC", email: "admin@csm.com", phone: "0212-1234567", city: "Caracas", isActive: true, createdAt: "2024-01-10" },
  { id: "m-002", legalName: "Farmacia El Alivio S.R.L.", tradeName: "Farmacia El Alivio", rif: "J-23456789-0", category: "PHARMACY", email: "info@elalivio.com", phone: "0212-2345678", city: "Maracaibo", isActive: true, createdAt: "2024-02-05" },
  { id: "m-003", legalName: "Centro Médico Norte C.A.", tradeName: "CentroMed Norte", rif: "J-34567890-1", category: "CLINIC", email: "contact@cmn.com", phone: "0212-3456567", city: "Valencia", isActive: false, createdAt: "2024-03-18" },
  { id: "m-004", legalName: "Laboratorio BioAnalisis S.A.", tradeName: "BioAnalisis", rif: "J-45678901-2", category: "LAB", email: "lab@bioanalisis.com", phone: "0212-4567890", city: "Caracas", isActive: true, createdAt: "2024-04-22" },
];

const mockTransactions = [
  { id: "tx-001", amount: 120.00, status: "COMPLETED", type: "PURCHASE", createdAt: "2024-05-28T10:23:00Z", user: { fullName: "María González" }, merchant: { tradeName: "Clínica Santa María" } },
  { id: "tx-002", amount: 45.50, status: "COMPLETED", type: "PURCHASE", createdAt: "2024-05-28T11:05:00Z", user: { fullName: "Carlos Pérez" }, merchant: { tradeName: "Farmacia El Alivio" } },
  { id: "tx-003", amount: 200.00, status: "PENDING", type: "PURCHASE", createdAt: "2024-05-28T12:30:00Z", user: { fullName: "Sofía López" }, merchant: { tradeName: "CentroMed Norte" } },
  { id: "tx-004", amount: 75.00, status: "COMPLETED", type: "PURCHASE", createdAt: "2024-05-27T09:15:00Z", user: { fullName: "Andrés Rodríguez" }, merchant: { tradeName: "BioAnalisis" } },
  { id: "tx-005", amount: 30.00, status: "FAILED", type: "PURCHASE", createdAt: "2024-05-27T14:00:00Z", user: { fullName: "Diego Ramírez" }, merchant: { tradeName: "Farmacia El Alivio" } },
  { id: "tx-006", amount: 90.00, status: "COMPLETED", type: "PURCHASE", createdAt: "2024-05-26T16:45:00Z", user: { fullName: "Valentina Torres" }, merchant: { tradeName: "Clínica Santa María" } },
  { id: "tx-007", amount: 55.00, status: "COMPLETED", type: "PURCHASE", createdAt: "2024-05-26T08:20:00Z", user: { fullName: "José Flores" }, merchant: { tradeName: "BioAnalisis" } },
  { id: "tx-008", amount: 160.00, status: "COMPLETED", type: "PURCHASE", createdAt: "2024-05-25T13:10:00Z", user: { fullName: "Luisa Martínez" }, merchant: { tradeName: "Clínica Santa María" } },
  { id: "tx-009", amount: 25.00, status: "PENDING", type: "PURCHASE", createdAt: "2024-05-25T17:30:00Z", user: { fullName: "María González" }, merchant: { tradeName: "Farmacia El Alivio" } },
  { id: "tx-010", amount: 310.00, status: "COMPLETED", type: "PURCHASE", createdAt: "2024-05-24T10:00:00Z", user: { fullName: "Carlos Pérez" }, merchant: { tradeName: "CentroMed Norte" } },
];

const mockTriajes = [
  { id: "tr-001", userId: "u-003", userName: "Luisa Martínez", symptoms: "Fiebre alta de 39°C, dolor de cabeza y malestar general desde hace 2 días.", priority: "HIGH", status: "PENDING", createdAt: "2024-05-28T08:00:00Z" },
  { id: "tr-002", userId: "u-006", userName: "Diego Ramírez", symptoms: "Dolor en el pecho leve al respirar, dura desde esta mañana.", priority: "MEDIUM", status: "PENDING", createdAt: "2024-05-28T09:30:00Z" },
  { id: "tr-003", userId: "u-008", userName: "José Flores", symptoms: "Mareos frecuentes y náuseas, especialmente después de comer.", priority: "LOW", status: "PENDING", createdAt: "2024-05-28T10:45:00Z" },
];

const mockElderCare = {
  total: 12,
  active: 9,
  pending: 3,
  subscriptions: [
    { id: "ec-001", patientName: "Ana Herrera", age: 72, plan: "Premium", status: "ACTIVE", caregiver: "Rosa Díaz", lastVisit: "2024-05-25" },
    { id: "ec-002", patientName: "Pedro Suárez", age: 68, plan: "Básico", status: "ACTIVE", caregiver: "Luis Mora", lastVisit: "2024-05-27" },
    { id: "ec-003", patientName: "Carmen Vega", age: 75, plan: "Premium", status: "PENDING", caregiver: null, lastVisit: null },
  ],
};

const mockSubscriptions = [
  { id: "sub-001", userId: "u-001", userName: "María González", plan: "Salud Cotidiana", status: "ACTIVE", amount: 15.00, nextBilling: "2024-06-15", createdAt: "2024-01-15" },
  { id: "sub-002", userId: "u-002", userName: "Carlos Pérez", plan: "Salud Plus", status: "ACTIVE", amount: 30.00, nextBilling: "2024-06-10", createdAt: "2024-02-10" },
  { id: "sub-003", userId: "u-004", userName: "Andrés Rodríguez", plan: "Salud Cotidiana", status: "ACTIVE", amount: 15.00, nextBilling: "2024-06-22", createdAt: "2024-03-22" },
  { id: "sub-004", userId: "u-005", userName: "Sofía López", plan: "Salud Especializada", status: "CANCELLED", amount: 50.00, nextBilling: null, createdAt: "2024-04-01" },
  { id: "sub-005", userId: "u-007", userName: "Valentina Torres", plan: "Salud Plus", status: "ACTIVE", amount: 30.00, nextBilling: "2024-06-03", createdAt: "2024-05-03" },
];

const mockOverdue = [
  { id: "inst-001", dueDate: "2024-05-15", amount: 40.00, status: "OVERDUE", user: { fullName: "Diego Ramírez" } },
  { id: "inst-002", dueDate: "2024-05-20", amount: 25.00, status: "OVERDUE", user: { fullName: "Luisa Martínez" } },
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // Auth
  http.post(`${BASE}/auth/login`, () => {
    return HttpResponse.json({
      token: "demo-token",
      user: { id: "admin-001", email: "admin@saludtech.com", firstName: "Admin", lastName: "SaludTech", role: "ADMIN" },
    });
  }),

  // Dashboard stats
  http.get(`${BASE}/admin/dashboard/stats`, () => {
    return HttpResponse.json({
      totalUsers: 1248,
      activeUsers: 1102,
      totalMerchants: 87,
      activeMerchants: 74,
      totalTransactions: 4821,
      totalAmount: 186540.50,
      pendingTriajes: 3,
      overdueInstallments: 2,
    });
  }),

  // Transactions
  http.get(`${BASE}/admin/transactions`, () => {
    return HttpResponse.json({ content: mockTransactions, totalElements: 10, totalPages: 2 });
  }),

  // Users
  http.get(`${BASE}/admin/users`, () => {
    return HttpResponse.json({ content: mockUsers, totalElements: 8, totalPages: 1 });
  }),
  http.post(`${BASE}/admin/users`, () => {
    return HttpResponse.json({ id: "u-new", ...mockUsers[0] }, { status: 201 });
  }),
  http.post(`${BASE}/admin/users/:id/status`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Merchants
  http.get(`${BASE}/admin/merchants`, () => {
    return HttpResponse.json(mockMerchants);
  }),
  http.post(`${BASE}/admin/merchants`, () => {
    return HttpResponse.json({ id: "m-new", ...mockMerchants[0] }, { status: 201 });
  }),
  http.post(`${BASE}/admin/merchants/:id/approve`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Triajes
  http.get(`${BASE}/admin/triage/pending`, () => {
    return HttpResponse.json(mockTriajes);
  }),
  http.put(`${BASE}/admin/triage/:id/respond`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Elder Care
  http.get(`${BASE}/admin/elder-care`, () => {
    return HttpResponse.json(mockElderCare);
  }),

  // Subscriptions
  http.get(`${BASE}/admin/subscriptions/all`, () => {
    return HttpResponse.json(mockSubscriptions);
  }),

  // Overdue installments
  http.get(`${BASE}/admin/installments/overdue`, () => {
    return HttpResponse.json(mockOverdue);
  }),
];
