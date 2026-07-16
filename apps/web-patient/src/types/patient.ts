export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone: string;
  identityDocument?: string;
  level?: number;
  points?: number;
  totalPaid?: number;
  kycStatus?: string;
  isActive?: boolean;
  active?: boolean;
}

export interface CreditLine {
  id: string;
  type: "ESPECIALIDAD_PRINCIPAL" | "SALUD_COTIDIANA" | "MAYOR_CUIDADO" | string;
  limitAmount: number;
  available: number;
}

export interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  amountVES?: number;
  bcvRate?: number;
  status: "PENDING" | "PAID" | "OVERDUE" | string;
  installmentNumber?: number;
  totalInstallments?: number;
  transaction?: {
    id: string;
    merchant?: { tradeName: string };
  };
}

export interface Transaction {
  id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  merchant?: { tradeName: string };
  installments?: Installment[];
}

export interface Subscription {
  id: string;
  status: "ACTIVE" | "CANCELLED" | "PENDING" | string;
  plan?: string;
  monthlyAmount?: number;
  nextBilling?: string;
  merchant?: { tradeName: string };
  serviceType?: string;
}

export interface Triage {
  id: string;
  symptoms: string;
  perceivedSeverity: number;
  priority?: string;
  status?: string;
  createdAt: string;
  recommendation?: string;
}

export interface RecommendedMerchant {
  id: string;
  tradeName: string;
  category: string;
  city?: string;
}

export interface CheckoutPreview {
  merchantId: string;
  amount: number;
  amountVES?: number;
  bcvRate?: number;
  requestedInstallments: number;
  downPayment?: number;
  downPaymentVES?: number;
  financedAmount?: number;
  financedAmountVES?: number;
  installments: {
    amount: number;
    amountVES?: number;
    dueDate: string;
    installmentNumber: number;
  }[];
  total: number;
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface FetchAction<T> {
  type: "loading" | "success" | "error";
  payload?: T | string;
}

// ─── Medical Catalog ──────────────────────────────────────────────────────

export interface Merchant {
  id: string;
  tradeName: string;
  category: string;
  subcategory?: string;
  city?: string;
}

export interface MedicalService {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  priceUsd: number;
  priceVES?: number;
  durationMin?: number;
  merchantName?: string;
  merchantCity?: string;
  merchantId?: string;
}

export interface MedicalSupply {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  priceUsd: number;
  priceVES?: number;
  unit?: string;
  stock?: number;
  requiresPrescription?: boolean;
  merchantName?: string;
  merchantCity?: string;
  merchantId?: string;
}

export interface CheckoutItem {
  type: "SERVICE" | "SUPPLY";
  id: string;
  quantity: number;
}

export interface CheckoutResponse {
  transactionId: string;
  status: string;
  totalAmount: number;
  totalAmountVES?: number;
  downPayment: number;
  downPaymentVES?: number;
  financedAmount: number;
  financedAmountVES?: number;
  numInstallments: number;
  bcvRate?: number;
  creditLineType: string;
  installments: {
    amount: number;
    amountVES?: number;
    dueDate: string;
    installmentNumber: number;
  }[];
  items: {
    name: string;
    quantity: number;
    priceUsd: number;
  }[];
}
