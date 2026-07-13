// Merchant API response shapes (mirrors backend-go/internal/merchant).
// Decimal/numeric columns (pgtype.Numeric) arrive as JSON strings; nullable
// text/timestamp columns (pgtype.Text / pgtype.Timestamptz) arrive as strings
// or null.

/** A transaction row from GET merchant/transactions (GetMerchantTransactionsRow). */
export interface Transaction {
  id: string;
  user_id: string;
  merchant_id: string;
  credit_line_id: string;
  total_amount: string;
  down_payment: string;
  financed_amount: string;
  num_installments: number;
  status: string;
  qr_code_token: string | null;
  qr_expires_at: string | null;
  mdr_fee: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_phone: string;
}

/** GET merchant/transactions response envelope. */
export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

/** A medical service row from GET merchant/services (MedicalService). */
export interface Service {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  price_usd: string;
  duration_min: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** GET merchant/services response envelope. */
export interface ServicesResponse {
  services: Service[];
}
