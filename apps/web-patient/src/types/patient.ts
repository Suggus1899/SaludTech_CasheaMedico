export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  identityDocument?: string;
  level?: number;
  points?: number;
  kycStatus?: string;
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
  requestedInstallments: number;
  installments: {
    amount: number;
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
