"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@saludtech/ui";
import { Badge } from "@saludtech/ui";
import { Button } from "@saludtech/ui";
import { Input } from "@saludtech/ui";
import { Label } from "@saludtech/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@saludtech/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@saludtech/ui";
import {
  Store,
  Wallet,
  CheckCircle2,
  QrCode,
  ArrowRight,
  Stethoscope,
  LogOut,
  RefreshCw,
  AlertCircle,
  Sun,
  Moon,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  Clock,
  ChevronDown,
  Settings,
  User,
  Calendar,
  Filter,
  Download,
  ArrowLeft,
  Shield,
  Activity,
  UserPlus,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

function getApiUrl(path: string): string {
  if (process.env.NEXT_PUBLIC_MOCK_API === "true") return `/api/mock/${path}`;
  return `${API_BASE}/${path}`;
}

type MerchantView = "generar-qr" | "liquidaciones" | "historial" | "suscripciones-ec";

interface DailyTx {
  id: string;
  amount: string;
  mdrFee: string;
  time: string;
  status: string;
}

interface Payout {
  id: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  mdrDeducted: number;
  netAmount: number;
  status: string;
  paidAt: string | null;
}

interface HistoryTx {
  id: string;
  totalAmount: number;
  status: string;
  description: string;
  mdrFee: number;
  createdAt: string;
}

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchQrToken(amount: number, description: string): Promise<string> {
  const res = await fetch(getApiUrl("merchant/qr/generate"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount, description }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return data.qrToken as string;
}

async function fetchQrStatus(token: string): Promise<string> {
  const res = await fetch(getApiUrl(`merchant/qr/${token}/status`), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return "UNKNOWN";
  const data = await res.json();
  return data.status as string;
}

async function fetchTodayTransactions(): Promise<DailyTx[]> {
  const res = await fetch(getApiUrl("merchant/reconciliation/transactions/today"), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data as Array<Record<string, unknown>>).map((tx) => ({
    id: String(tx.id).slice(0, 8).toUpperCase(),
    amount: `$${Number(tx.totalAmount).toFixed(2)}`,
    mdrFee: `$${(Number(tx.totalAmount) * 0.035).toFixed(2)}`,
    time: new Date(String(tx.createdAt)).toLocaleTimeString("es-VE", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: tx.status === "ACTIVE" || tx.status === "COMPLETED" ? "Liquidado" : "Pendiente",
  }));
}

async function fetchAllTransactions(): Promise<HistoryTx[]> {
  const res = await fetch(getApiUrl("merchant/reconciliation/transactions"), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data as Array<Record<string, unknown>>).map((tx) => ({
    id: String(tx.id).slice(0, 8).toUpperCase(),
    totalAmount: Number(tx.totalAmount),
    status: String(tx.status),
    description: String(tx.description ?? "Cobro Médico"),
    mdrFee: Number(tx.totalAmount) * 0.035,
    createdAt: String(tx.createdAt),
  }));
}

async function fetchPayouts(): Promise<Payout[]> {
  const res = await fetch(getApiUrl("merchant/payouts"), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

const VIEW_TITLES: Record<MerchantView, string> = {
  "generar-qr": "Generar Cobro BNPL",
  liquidaciones: "Liquidaciones",
  historial: "Historial de Transacciones",
  "suscripciones-ec": "Elder Care — Mis Suscripciones",
};

// ─── Elder Care Subscriptions View ───────────────────────────────────────────
function ElderCareSubscriptionsView() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(getApiUrl("merchant/elder-care/subscriptions"), {
          headers: getAuthHeaders(),
        });
        if (res.ok) setSubs(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const SERVICE_LABELS: Record<string, string> = {
    NURSE: "Enfermera",
    CAREGIVER: "Cuidador/a",
    PHYSIOTHERAPY: "Fisioterapia",
    GERIATRIC_SPECIALIST: "Geriatría",
  };

  const totalMonthly = subs
    .filter((s) => s.status === "ACTIVE")
    .reduce((acc, s) => acc + (s.monthlyAmount ?? 0), 0);

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" /> Cargando suscripciones Elder Care...
      </div>
    );

  return (
    <div className="max-w-4xl space-y-6">
      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Suscriptores Activos", value: 124, icon: Shield, color: "text-violet-600" },
          { label: "Nuevas Suscripciones", value: "+12", icon: UserPlus, color: "text-blue-600" },
          { label: "Servicios Diferentes", value: "8", icon: Activity, color: "text-pink-600" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="p-2.5 rounded-lg bg-muted">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-(family-name:--font-syne)">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-(family-name:--font-syne)">Suscripciones Elder Care</CardTitle>
          <CardDescription>Pacientes suscritos a tus servicios de cuidado mayor</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {subs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin suscripciones activas</p>
              <p className="text-sm mt-1">Los pacientes pueden suscribirse desde su app.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Servicio</th>
                    <th className="text-right px-4 py-3 font-medium">Monto/Mes</th>
                    <th className="text-center px-4 py-3 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 font-medium">Próximo Cobro</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.id} className="border-b border-border/60 hover:bg-accent/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                          <Shield className="w-3 h-3" />
                          {SERVICE_LABELS[s.serviceType] ?? s.serviceType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">
                        ${(s.monthlyAmount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={s.status === "ACTIVE" ? "default" : "secondary"}>
                          {s.status === "ACTIVE" ? "Activa" : "Cancelada"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {s.nextBillingDate
                          ? new Date(s.nextBillingDate).toLocaleDateString("es-VE")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



function SidebarNav({ activeView, navigate, router, merchantUser, handleLogout }: {
  activeView: MerchantView;
  navigate: (view: MerchantView) => void;
  router: any;
  merchantUser: any;
  handleLogout: () => void;
}) {
  return (
    <>
      <div className="p-6 flex-1">
        <div className="mb-10">
          <Logo size="md" />
        </div>
        <nav className="space-y-1" aria-label="Navegación del portal">
          {([
            { id: "checkout" as any, icon: Clock, label: "Autorizaciones (Caja)", onClick: () => router.push("/checkout") },
            { id: "generar-qr" as MerchantView, icon: QrCode, label: "Generar QR", onClick: () => navigate("generar-qr") },
            { id: "liquidaciones" as MerchantView, icon: Wallet, label: "Liquidaciones", onClick: () => navigate("liquidaciones") },
            { id: "suscripciones-ec" as MerchantView, icon: Shield, label: "Elder Care", onClick: () => navigate("suscripciones-ec") },
          ] as Array<{ id: MerchantView; icon: React.ElementType; label: string; onClick: () => void }>).map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                aria-current={active ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" /> {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{merchantUser?.firstName ?? "Comercio"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ID: {merchantUser?.id?.slice(0, 8) ?? "M-992"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
    </>
  );
}

export default function MerchantDashboard() {
  const router = useRouter();

  // ── View & sidebar state ──────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<MerchantView>("generar-qr");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  // ── QR form state ─────────────────────────────────────────────────────────
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [qrPayload, setQrPayload] = useState("");
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrConfirmed, setQrConfirmed] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Daily transactions state ──────────────────────────────────────────────
  const [dailyTxs, setDailyTxs] = useState<DailyTx[]>([
    { id: "TX-9981", amount: "$150.00", mdrFee: "$5.25", time: "10:23 AM", status: "Liquidado" },
    { id: "TX-9982", amount: "$45.00", mdrFee: "$1.58", time: "11:45 AM", status: "Liquidado" },
    { id: "TX-9983", amount: "$210.00", mdrFee: "$7.35", time: "01:12 PM", status: "Liquidado" },
    { id: "TX-9984", amount: "$80.00", mdrFee: "$2.80", time: "02:30 PM", status: "Pendiente" },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Liquidaciones state ───────────────────────────────────────────────────
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  // ── History state ─────────────────────────────────────────────────────────
  const [historyTxs, setHistoryTxs] = useState<HistoryTx[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("");

  // ── Modals ────────────────────────────────────────────────────────────────
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [defaultDesc, setDefaultDesc] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("default_qr_desc") ?? "") : ""
  );

  const merchantUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("merchant_user") ?? "null")
      : null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("merchant_user");
    document.cookie = "jwt_token=; path=/; max-age=0";
    router.push("/login");
  }, [router]);

  const toggleDarkMode = useCallback(() => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [isDarkMode]);

  const navigate = useCallback((view: MerchantView) => {
    setActiveView(view);
    setSidebarOpen(false);
  }, []);

  const handleRefreshCobros = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const txs = await fetchTodayTransactions();
      if (txs.length > 0) setDailyTxs(txs);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setError(null);
    setIsLoading(true);
    setQrConfirmed(false);
    try {
      const token = await fetchQrToken(parseFloat(amount), description || defaultDesc || "Cobro Médico");
      setQrPayload(token);
      setIsQrOpen(true);
      pollingRef.current = setInterval(async () => {
        const status = await fetchQrStatus(token);
        if (status === "ACTIVE" || status === "COMPLETED") {
          setQrConfirmed(true);
          if (pollingRef.current) clearInterval(pollingRef.current);
        } else if (status === "EXPIRED") {
          setIsQrOpen(false);
          setError("El QR expiró sin ser escaneado. Genera uno nuevo.");
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      }, 5000);
    } catch (err) {
      setError("No se pudo conectar al servidor. Verifique su sesión e intente de nuevo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCharge = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setIsQrOpen(false);
    setAmount("");
    setDescription("");
    setQrPayload("");
    setQrConfirmed(false);
    setTimeout(() => amountInputRef.current?.focus(), 100);
  };

  const handleOpenHistorial = useCallback(async () => {
    navigate("historial");
    setHistoryLoading(true);
    try {
      const txs = await fetchAllTransactions();
      setHistoryTxs(txs);
    } finally {
      setHistoryLoading(false);
    }
  }, [navigate]);

  const handleOpenLiquidaciones = useCallback(async () => {
    navigate("liquidaciones");
    setPayoutsLoading(true);
    try {
      const data = await fetchPayouts();
      setPayouts(data);
    } finally {
      setPayoutsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const totalHoy = dailyTxs
    .filter((tx) => tx.status === "Liquidado")
    .reduce((acc, tx) => acc + parseFloat(tx.amount.replace("$", "")), 0);



  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex md:flex-col w-60 border-r border-border bg-card shrink-0">
        <SidebarNav activeView={activeView} navigate={navigate} router={router} merchantUser={merchantUser} handleLogout={handleLogout} />
      </aside>

      {/* Sidebar — mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Menú lateral"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Logo size="sm" />
          <button onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarNav activeView={activeView} navigate={navigate} router={router} merchantUser={merchantUser} handleLogout={handleLogout} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
              <Menu className="w-5 h-5" />
            </button>
            {activeView === "historial" && (
              <button onClick={() => navigate("generar-qr")} aria-label="Volver" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-lg font-semibold font-(family-name:--font-syne)">{VIEW_TITLES[activeView]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Sistema Operativo
            </div>
            <button onClick={toggleDarkMode} aria-label={isDarkMode ? "Modo claro" : "Modo oscuro"} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Menú de usuario" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {(merchantUser?.firstName?.[0] ?? "C").toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-semibold">{merchantUser?.firstName ?? "Comercio"}</p>
                  <p className="text-xs text-muted-foreground">{merchantUser?.email ?? ""}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" /> Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsConfigOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" /> Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <main id="main-content" className="flex-1 overflow-auto p-4 md:p-8">

          {/* ── GENERAR QR VIEW ─────────────────────────────────────────── */}
          {activeView === "generar-qr" && (
            <>
              {/* KPI summary */}
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                {[
                  { label: "Recaudado hoy", value: `$${totalHoy.toFixed(2)}`, icon: DollarSign, color: "text-primary" },
                  { label: "Transacciones", value: `${dailyTxs.length}`, icon: TrendingUp, color: "text-green-600" },
                  { label: "Pendientes", value: `${dailyTxs.filter(t => t.status === "Pendiente").length}`, icon: Clock, color: "text-muted-foreground" },
                ].map((kpi) => (
                  <Card key={kpi.label} className="border-border shadow-sm">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold font-(family-name:--font-syne)">{kpi.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
                {/* Formulario QR */}
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-(family-name:--font-syne)">Nuevo Cobro</CardTitle>
                    <CardDescription>Genera un QR para que el paciente pague desde su app en cuotas sin interés.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleGenerateQR} className="space-y-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="amount">Monto Total (USD)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold pointer-events-none">$</span>
                          <Input ref={amountInputRef} id="amount" type="number" step="0.01" min="1" placeholder="0.00" required aria-required="true" className="pl-8 text-lg font-semibold" value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="desc">Descripción <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                        <Input id="desc" placeholder={defaultDesc || "Ej. Consulta Especialista + Rayos X"} value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} />
                      </div>
                      {amount && parseFloat(amount) > 0 && (
                        <div className="p-4 rounded-lg bg-accent/60 border border-border space-y-1.5 text-sm">
                          <div className="flex justify-between font-semibold">
                            <span>Inicial (40%)</span><span>${(parseFloat(amount) * 0.4).toFixed(2)}</span>
                          </div>
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="flex justify-between text-muted-foreground">
                              <span>Cuota {n} de 3</span><span>${((parseFloat(amount) * 0.6) / 3).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {error && (
                        <div role="alert" className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
                        </div>
                      )}
                      <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                        {isLoading ? "Generando..." : "Generar Código QR"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Cobros del día */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-(family-name:--font-syne)">Cobros de Hoy</CardTitle>
                      <CardDescription>Transacciones del día</CardDescription>
                    </div>
                    <button onClick={handleRefreshCobros} aria-label="Actualizar cobros" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dailyTxs.map((tx, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.status === "Liquidado" ? "bg-primary/10" : "bg-muted"}`}>
                              <CheckCircle2 className={`w-4 h-4 ${tx.status === "Liquidado" ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{tx.id}</p>
                              <p className="text-xs text-muted-foreground">{tx.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{tx.amount}</p>
                            <p className="text-[10px] text-destructive">MDR: -{tx.mdrFee}</p>
                            <Badge variant={tx.status === "Liquidado" ? "default" : "secondary"} className="text-[10px] mt-0.5">{tx.status}</Badge>
                          </div>
                        </div>
                      ))}
                      <button onClick={handleOpenHistorial} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all mt-1">
                        Ver historial completo <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* ── LIQUIDACIONES VIEW ──────────────────────────────────────── */}
          {activeView === "liquidaciones" && (
            <div className="max-w-5xl space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{payouts.length} liquidaciones encontradas</p>
              </div>
              <Card className="border-border shadow-sm">
                <CardContent className="p-0">
                  {payoutsLoading ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" /> Cargando liquidaciones...
                    </div>
                  ) : payouts.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">Sin liquidaciones aún</p>
                      <p className="text-sm mt-1">Las liquidaciones aparecerán aquí una vez procesadas.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="text-left px-4 py-3 font-medium">Período</th>
                            <th className="text-right px-4 py-3 font-medium">Monto Bruto</th>
                            <th className="text-right px-4 py-3 font-medium">Comisión MDR</th>
                            <th className="text-right px-4 py-3 font-medium">Neto</th>
                            <th className="text-center px-4 py-3 font-medium">Estado</th>
                            <th className="text-center px-4 py-3 font-medium">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payouts.map((p) => (
                            <tr key={p.id} className="border-b border-border/60 hover:bg-accent/40 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>{p.periodStart} — {p.periodEnd}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-medium">${p.grossAmount.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right text-destructive">-${p.mdrDeducted.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-semibold text-primary">${p.netAmount.toFixed(2)}</td>
                              <td className="px-4 py-3 text-center">
                                <Badge variant={p.status === "PAID" ? "default" : "secondary"}>
                                  {p.status === "PAID" ? "Liquidado" : "Pendiente"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button onClick={() => setSelectedPayout(p)} className="text-xs text-primary hover:underline font-medium">
                                  Ver detalle
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── HISTORIAL VIEW ──────────────────────────────────────────── */}
          {activeView === "historial" && (
            <div className="max-w-5xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="search"
                    placeholder="Filtrar por descripción o ID..."
                    value={historyFilter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHistoryFilter(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-full"
                    aria-label="Filtrar transacciones"
                  />
                </div>
                <button
                  onClick={() => {
                    const csv = ["ID,Descripción,Monto,Estado,Fecha",
                      ...historyTxs.map(t => `${t.id},"${t.description}",${t.totalAmount},${t.status},${t.createdAt}`)
                    ].join("\n");
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
                    a.download = "historial.csv";
                    a.click();
                  }}
                  aria-label="Exportar CSV"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </div>

              <Card className="border-border shadow-sm">
                <CardContent className="p-0">
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" /> Cargando historial...
                    </div>
                  ) : historyTxs.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">Sin transacciones aún</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="text-left px-4 py-3 font-medium">ID</th>
                            <th className="text-left px-4 py-3 font-medium">Descripción</th>
                            <th className="text-left px-4 py-3 font-medium">Línea</th>
                            <th className="text-right px-4 py-3 font-medium">Monto</th>
                            <th className="text-right px-4 py-3 font-medium">MDR</th>
                            <th className="text-center px-4 py-3 font-medium">Estado</th>
                            <th className="text-left px-4 py-3 font-medium">Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyTxs
                            .filter(t =>
                              historyFilter === "" ||
                              t.id.toLowerCase().includes(historyFilter.toLowerCase()) ||
                              t.description.toLowerCase().includes(historyFilter.toLowerCase())
                            )
                            .map((tx) => (
                              <tr key={tx.id} className="border-b border-border/60 hover:bg-accent/40 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.id}</td>
                                <td className="px-4 py-3">{tx.description}</td>
                                <td className="px-4 py-3">
                                  {(tx as HistoryTx & { creditLineType?: string }).creditLineType && (
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                      (tx as HistoryTx & { creditLineType?: string }).creditLineType === 'MAYOR_CUIDADO'
                                        ? 'bg-violet-100 text-violet-700'
                                        : (tx as HistoryTx & { creditLineType?: string }).creditLineType === 'SALUD_COTIDIANA'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {(tx as HistoryTx & { creditLineType?: string }).creditLineType === 'MAYOR_CUIDADO' ? 'Mayor Cuidado'
                                        : (tx as HistoryTx & { creditLineType?: string }).creditLineType === 'SALUD_COTIDIANA' ? 'Salud Cotidiana'
                                        : 'Especialidad'}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold">${tx.totalAmount.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right text-destructive text-xs">-${tx.mdrFee.toFixed(2)}</td>
                                <td className="px-4 py-3 text-center">
                                  <Badge variant={
                                    tx.status === "ACTIVE" || tx.status === "COMPLETED" ? "default" :
                                    tx.status === "OVERDUE" ? "destructive" : "secondary"
                                  }>
                                    {tx.status === "ACTIVE" || tx.status === "COMPLETED" ? "Liquidado" :
                                     tx.status === "OVERDUE" ? "En mora" : "Pendiente"}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                  {new Date(tx.createdAt).toLocaleDateString("es-VE")}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── ELDER CARE SUBSCRIPTIONS VIEW ───────────────────────── */}
          {activeView === "suscripciones-ec" && <ElderCareSubscriptionsView />}

        </main>
      </div>

      {/* ── Modal QR ──────────────────────────────────────────────────────── */}
      <Dialog open={isQrOpen} onOpenChange={(open) => { if (!open) handleNewCharge(); }}>
        <DialogContent className="sm:max-w-sm flex flex-col items-center text-center p-8">
          <DialogHeader className="w-full">
            <DialogTitle className="text-xl font-(family-name:--font-syne)">Código QR Generado</DialogTitle>
            <DialogDescription>El paciente escaneará este código desde su app SaludTech.</DialogDescription>
          </DialogHeader>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-border my-6">
            <QRCodeSVG value={qrPayload || "preview"} size={200} level="Q" includeMargin={false} />
          </div>

          <div className="space-y-1 mb-4">
            <p className="font-bold text-3xl text-primary font-(family-name:--font-syne)">${amount}</p>
            <p className="text-sm text-muted-foreground">{description || defaultDesc || "Cobro Médico"}</p>
          </div>

          {qrConfirmed ? (
            <div className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 mb-4">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              ¡Pago confirmado! El paciente aprobó el financiamiento.
            </div>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-accent/60 text-sm text-muted-foreground mb-4">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              Esperando confirmación del paciente...
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={handleNewCharge}>
            Hacer otro cobro
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Modal Detalle Liquidación ──────────────────────────────────────── */}
      <Dialog open={!!selectedPayout} onOpenChange={(o) => { if (!o) setSelectedPayout(null); }}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-syne)">Detalle de Liquidación</DialogTitle>
            <DialogDescription>Período: {selectedPayout?.periodStart} — {selectedPayout?.periodEnd}</DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-3 mt-4">
              {[
                { label: "Monto Bruto", value: `$${selectedPayout.grossAmount.toFixed(2)}` },
                { label: "Comisión MDR (3.5%)", value: `-$${selectedPayout.mdrDeducted.toFixed(2)}`, red: true },
                { label: "Monto Neto", value: `$${selectedPayout.netAmount.toFixed(2)}`, bold: true },
                { label: "Estado", value: selectedPayout.status === "PAID" ? "Liquidado" : "Pendiente" },
                { label: "Fecha de pago", value: selectedPayout.paidAt ? new Date(selectedPayout.paidAt).toLocaleDateString("es-VE") : "—" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={row.bold ? "font-bold text-primary" : row.red ? "text-destructive" : "font-medium"}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal Mi Perfil ────────────────────────────────────────────────── */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-sm p-6">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-syne)">Mi Perfil</DialogTitle>
            <DialogDescription>Datos del comercio autenticado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {[
              { label: "Nombre", value: merchantUser?.firstName ?? "—" },
              { label: "Correo", value: merchantUser?.email ?? "—" },
              { label: "ID Comercio", value: merchantUser?.id?.slice(0, 16) ?? "—" },
              { label: "Nivel", value: `Nivel ${merchantUser?.level ?? 1}` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Configuración ────────────────────────────────────────────── */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-sm p-6">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-syne)">Configuración</DialogTitle>
            <DialogDescription>Personaliza el comportamiento del portal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="default-desc">Descripción por defecto del QR</Label>
              <Input
                id="default-desc"
                placeholder="Ej. Consulta Médica General"
                value={defaultDesc}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDefaultDesc(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Se usa cuando no ingresas una descripción al generar el QR.</p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                localStorage.setItem("default_qr_desc", defaultDesc);
                setIsConfigOpen(false);
              }}
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
