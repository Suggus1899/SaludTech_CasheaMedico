"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@saludtech/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@saludtech/ui";
import { Badge } from "@saludtech/ui";
import { Button } from "@saludtech/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@saludtech/ui";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  Store,
  ArrowUpRight,
  Stethoscope,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Search,
  User,
  HelpCircle,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  TrendingDown,
  AlertTriangle,
  Building2,
  Pill,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  CalendarDays,
  Send,
  HeartPulse,
  ShieldAlert,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@saludtech/ui";
import { Input } from "@saludtech/ui";
import { Label } from "@saludtech/ui";

// ─── Types ────────────────────────────────────────────────────────────────────
type View = "overview" | "pacientes" | "comercios" | "financiamientos" | "triajes" | "elder-care" | "suscripciones";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

function getApiUrl(path: string): string {
  if (process.env.NEXT_PUBLIC_MOCK_API === "true") return `/api/mock/${path}`;
  return `${API_BASE}/${path}`;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface OverdueInstallment {
  id: string;
  dueDate: string;
  amount: number;
  status: string;
  user?: { fullName: string };
}

interface NavItem {
  id: View;
  label: string;
  icon: React.ElementType;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "pacientes", label: "Pacientes", icon: Users },
  { id: "comercios", label: "Comercios", icon: Store },
  { id: "financiamientos", label: "Financiamientos", icon: CreditCard },
  { id: "triajes", label: "Triajes", icon: HeartPulse },
  { id: "elder-care", label: "Elder Care", icon: ShieldAlert },
  { id: "suscripciones", label: "Suscripciones", icon: CalendarDays },
];

const VIEW_TITLES: Record<View, string> = {
  overview: "Dashboard General",
  pacientes: "Gestión de Pacientes",
  comercios: "Gestión de Comercios",
  financiamientos: "Gestión de Financiamientos",
  triajes: "Triajes Médicos",
  "elder-care": "Elder Care — Cuidado Mayor",
  suscripciones: "Suscripciones Activas",
};

// ─── Fetch Hooks / Helpers ──────────────────────────────────────────────────
function useFetchData<T>(url: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}

// ─── Sub-views ─────────────────────────────────────────────────────────────────
function OverviewView({ searchTerm }: { searchTerm: string }) {
  const { data: stats, loading: statsLoading } = useFetchData<any>(getApiUrl("admin/dashboard/stats"));
  const { data: txData, loading: txLoading } = useFetchData<any>(getApiUrl("admin/transactions?size=5"));

  if (statsLoading || txLoading) return <div className="p-8 text-center text-muted-foreground">Cargando dashboard...</div>;

  const transactions = txData?.content || [];
  const niveles = stats?.levelDistributions || [];

  const filtered = transactions.filter(
    (tx: any) =>
      tx.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.merchant?.tradeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Volumen Financiado",
            value: `$${stats?.totalActiveDebt?.toFixed(2) || "0.00"}`,
            sub: "Total deuda activa",
            icon: DollarSign,
            trend: "up",
            progress: 100,
          },
          {
            title: "Pacientes Activos",
            value: stats?.totalPatients || 0,
            sub: "Registrados",
            icon: Users,
            trend: "up",
            progress: 100,
          },
          {
            title: "Comercios Afiliados",
            value: stats?.activeMerchants || 0,
            sub: "Clínicas y farmacias",
            icon: Store,
            trend: "neutral",
            progress: 100,
          },
          {
            title: "Cuotas en Mora",
            value: stats?.overdueInstallments || 0,
            sub: `$${stats?.overdueAmount?.toFixed(2) || "0.00"} vencido`,
            icon: AlertTriangle,
            trend: stats?.overdueInstallments > 0 ? "down" : "up",
            progress: (stats?.defaultRate || 0),
          },
        ].map((kpi) => (
          <Card
            key={kpi.title}
            className="border-border shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <kpi.icon className={`h-4 w-4 ${kpi.trend === "down" ? "text-destructive" : "text-primary"}`} />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className={`text-3xl font-bold tracking-tight font-(family-name:--font-syne) ${kpi.trend === "down" ? "text-destructive" : "text-foreground"}`}>
                {kpi.value}
              </div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.trend === "up" ? "text-green-600" : kpi.trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
                {kpi.trend === "up" && <TrendingUp className="w-3 h-3" />}
                {kpi.trend === "down" && <TrendingDown className="w-3 h-3" />}
                {kpi.sub}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${kpi.trend === "down" ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla + Niveles */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-(family-name:--font-syne)">Transacciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Sin resultados</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Paciente</TableHead>
                    <TableHead>Comercio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tx: any) => (
                    <TableRow key={tx.id} className="border-border/60 hover:bg-accent/40 transition-colors cursor-pointer">
                      <TableCell className="font-medium">{tx.user?.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{tx.merchant?.tradeName}</TableCell>
                      <TableCell>
                        <Badge variant={tx.status === "COMPLETED" ? "default" : "secondary"}>{tx.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">${tx.amount?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-(family-name:--font-syne)">Niveles de Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {niveles.map((lvl: any, i: number) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{lvl.label}</span>
                  <span className="text-muted-foreground">{lvl.users} · {lvl.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${lvl.pct}%` }}
                  />
                </div>
              </div>
            ))}
            {niveles.length === 0 && <p className="text-sm text-muted-foreground">No hay usuarios registrados</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PacientesView({ searchTerm, onAddPatient, refreshTrigger }: { searchTerm: string; onAddPatient: () => void; refreshTrigger: number }) {
  const { data, loading } = useFetchData<any>(getApiUrl("admin/users?size=50"), [refreshTrigger]);
  
  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando pacientes...</div>;

  const users = data?.content || [];
  const filtered = users.filter(
    (p: any) =>
      p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.identityDocument?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{filtered.length} pacientes encontrados</p>
        <Button className="gap-2" onClick={onAddPatient}>
          <Users className="w-4 h-4" /> Agregar Paciente
        </Button>
      </div>
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Sin resultados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Documento</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado Cuenta</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p: any) => (
                  <TableRow key={p.id} className="border-border/60 hover:bg-accent/40 transition-colors cursor-pointer">
                    <TableCell className="text-muted-foreground font-mono text-xs">{p.identityDocument}</TableCell>
                    <TableCell className="font-medium">{p.fullName}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        Nv. {p.level}
                      </span>
                    </TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>
                      <Badge variant={p.active ? "default" : "secondary"}>
                        {p.active ? "Activo" : "Pausado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {!p.active && (
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            const res = await fetch(getApiUrl(`admin/users/${p.id}/status?activate=true`), {
                              method: 'POST',
                              headers: getAuthHeaders(),
                            });
                            if (res.ok) window.location.reload();
                          } catch (e) { console.error(e); }
                        }}>Activar</Button>
                      )}
                      {p.active && (
                        <Button size="sm" variant="destructive" onClick={async () => {
                          try {
                            const res = await fetch(getApiUrl(`admin/users/${p.id}/status?activate=false`), {
                              method: 'POST',
                              headers: getAuthHeaders(),
                            });
                            if (res.ok) window.location.reload();
                          } catch (e) { console.error(e); }
                        }}>Pausar</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ComerciosView({ searchTerm, onAddMerchant, refreshTrigger }: { searchTerm: string; onAddMerchant: () => void; refreshTrigger: number }) {
  const { data, loading } = useFetchData<any[]>(getApiUrl("admin/merchants"), [refreshTrigger]);
  
  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando comercios...</div>;

  const merchants = data || [];
  const filtered = merchants.filter(
    (c: any) =>
      c.tradeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{filtered.length} comercios encontrados</p>
        <Button className="gap-2" onClick={onAddMerchant}>
          <Store className="w-4 h-4" /> Agregar Comercio
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Sin resultados</p>
          </div>
        ) : (
          filtered.map((c: any) => (
            <Card key={c.id} className="border-border shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{c.tradeName}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.rif}</p>
                  </div>
                  <Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Activo" : "Pendiente"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Pill className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{c.category}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border items-center">
                  <span className="text-muted-foreground">{c.city}</span>
                  {!c.isActive ? (
                    <Button size="sm" onClick={async () => {
                      try {
                        const res = await fetch(getApiUrl(`admin/merchants/${c.id}/approve`), {
                          method: 'POST',
                          headers: getAuthHeaders(),
                        });
                        if (res.ok) window.location.reload();
                      } catch (e) {
                        console.error(e);
                      }
                    }}>Aprobar</Button>
                  ) : (
                    <span className="font-semibold">{c.phone}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function FinanciamientosView({ searchTerm }: { searchTerm: string }) {
  const { data, loading } = useFetchData<any>(getApiUrl("admin/transactions?size=50"));

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando financiamientos...</div>;

  const txs = data?.content || [];
  const filtered = txs.filter(
    (f: any) =>
      f.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.merchant?.tradeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{filtered.length} transacciones encontradas</p>
        <Button className="gap-2">
          <CreditCard className="w-4 h-4" /> Nuevo Financiamiento
        </Button>
      </div>
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Sin resultados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Comercio</TableHead>
                  <TableHead>Monto (Total)</TableHead>
                  <TableHead>Cuotas</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f: any) => (
                  <TableRow key={f.id} className="border-border/60 hover:bg-accent/40 transition-colors cursor-pointer">
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{f.user?.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{f.merchant?.tradeName}</TableCell>
                    <TableCell className="font-semibold">${f.amount?.toFixed(2)}</TableCell>
                    <TableCell>{f.numberOfInstallments}</TableCell>
                    <TableCell>
                      <Badge variant={f.status === "ACTIVE" ? "default" : f.status === "FAILED" ? "destructive" : "secondary"}>
                        {f.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── TriajesView ───────────────────────────────────────────────────────────────
function TriajesView({ searchTerm }: { searchTerm: string }) {
  const { data, loading, refetch } = useFetchData<any[]>(getApiUrl("admin/triage/pending"));
  const [responding, setResponding] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [respondStatus, setRespondStatus] = useState("RESOLVED");

  const triages = data || [];
  const filtered = triages.filter(
    (t: any) =>
      t.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.urgencyLevel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const URGENCY_COLOR: Record<string, string> = {
    EMERGENCY: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    LOW: "bg-green-100 text-green-700 border-green-200",
  };
  const URGENCY_LABEL: Record<string, string> = {
    EMERGENCY: "🚨 EMERGENCIA",
    HIGH: "⚠️ Alta",
    MEDIUM: "🔶 Media",
    LOW: "🟢 Baja",
  };

  const handleRespond = async (id: string) => {
    if (!notes.trim()) return;
    try {
      const res = await fetch(getApiUrl(`admin/triage/${id}/respond`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ doctorNotes: notes, status: respondStatus }),
      });
      if (res.ok) { setResponding(null); setNotes(""); refetch(); }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando triajes pendientes...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{filtered.length} triajes pendientes (ordenados por urgencia)</p>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No hay triajes pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t: any) => (
            <Card key={t.id} className={`border shadow-sm ${t.urgencyLevel === 'EMERGENCY' ? 'border-red-300' : 'border-border'}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${URGENCY_COLOR[t.urgencyLevel] ?? URGENCY_COLOR.LOW}`}>
                        {URGENCY_LABEL[t.urgencyLevel] ?? t.urgencyLevel}
                      </span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        {t.specialtyRecommended?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.createdAt ? new Date(t.createdAt).toLocaleString('es-VE') : ''}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{t.symptoms}</p>
                    {t.aiSummary && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">{t.aiSummary}</p>
                    )}
                  </div>
                  <Button size="sm" onClick={() => setResponding(t.id)} className="gap-1 shrink-0">
                    <Send className="w-3.5 h-3.5" /> Responder
                  </Button>
                </div>

                {responding === t.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div className="flex gap-2">
                      {["RESOLVED", "REFERRED"].map(s => (
                        <button key={s}
                          onClick={() => setRespondStatus(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            respondStatus === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >{s}</button>
                      ))}
                    </div>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Notas del médico..."
                      className="w-full min-h-[80px] text-sm p-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setResponding(null)}>Cancelar</Button>
                      <Button size="sm" onClick={() => handleRespond(t.id)} disabled={!notes.trim()}>Confirmar Respuesta</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ElderCareView ────────────────────────────────────────────────────────────
function ElderCareView({ searchTerm }: { searchTerm: string }) {
  const { data, loading } = useFetchData<any>(getApiUrl("admin/elder-care"));

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando datos Elder Care...</div>;

  const activeSubs: any[] = data?.activeSubscriptions || [];
  const elderMerchants: any[] = data?.elderCareMerchants || [];

  const filtered = activeSubs.filter((s: any) =>
    s.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SERVICE_LABELS: Record<string, string> = {
    NURSE: 'Enfermera', CAREGIVER: 'Cuidador/a',
    PHYSIOTHERAPY: 'Fisioterapia', GERIATRIC_SPECIALIST: 'Geriatría',
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Suscriptores Activos", value: data?.totalActiveSubscribers ?? 0, icon: Shield, color: "text-violet-600" },
          { label: "Proveedores Elder Care", value: elderMerchants.length, icon: Building2, color: "text-blue-600" },
          { label: "Tipos de Servicio", value: new Set(activeSubs.map((s:any) => s.serviceType)).size, icon: Activity, color: "text-pink-600" },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-muted"><kpi.icon className={`w-6 h-6 ${kpi.color}`} /></div>
              <div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscriptions table */}
      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-(family-name:--font-syne)">Suscripciones Elder Care Activas</CardTitle></CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Shield className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Sin suscripciones activas</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Monto/Mes</TableHead>
                  <TableHead>Próximo Cobro</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s: any) => (
                  <TableRow key={s.id} className="border-border/60 hover:bg-accent/40">
                    <TableCell className="font-medium">{s.merchantName}</TableCell>
                    <TableCell><Badge variant="secondary">{SERVICE_LABELS[s.serviceType] ?? s.serviceType}</Badge></TableCell>
                    <TableCell className="font-semibold">${s.monthlyAmount?.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString('es-VE') : '—'}</TableCell>
                    <TableCell><Badge variant="default">Activa</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Elder Care Merchants */}
      {elderMerchants.length > 0 && (
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="font-(family-name:--font-syne)">Proveedores de Cuidado Mayor</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {elderMerchants.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="p-2 rounded-lg bg-violet-100"><Building2 className="w-4 h-4 text-violet-600" /></div>
                  <div>
                    <p className="text-sm font-semibold">{m.tradeName}</p>
                    <p className="text-xs text-muted-foreground">{m.subcategory ?? m.category}</p>
                  </div>
                  <Badge variant={m.isActive ? 'default' : 'secondary'} className="ml-auto">{m.isActive ? 'Activo' : 'Inactivo'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── SuscripcionesView ────────────────────────────────────────────────────────
function SuscripcionesView({ searchTerm }: { searchTerm: string }) {
  const { data, loading } = useFetchData<any[]>(getApiUrl("admin/subscriptions/all"));

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando suscripciones...</div>;

  const subs: any[] = data || [];
  const filtered = subs.filter((s: any) =>
    s.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.merchantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{filtered.length} suscripciones de farmacia activas</p>
      </div>
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Sin suscripciones activas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Producto</TableHead>
                  <TableHead>Farmacia</TableHead>
                  <TableHead>Monto/Mes</TableHead>
                  <TableHead>Próximo Cobro</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s: any) => (
                  <TableRow key={s.id} className="border-border/60 hover:bg-accent/40">
                    <TableCell className="font-medium">{s.productName}</TableCell>
                    <TableCell className="text-muted-foreground">{s.merchantName}</TableCell>
                    <TableCell className="font-semibold">${s.amount?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString('es-VE') : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'ACTIVE' ? 'default' : 'secondary'}>{s.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sidebar content ─────────────────────────────────────────────────────────
function SidebarContent({
  activeView, navigate, onLogout, onSettings,
}: {
  activeView: View;
  navigate: (v: View) => void;
  onLogout: () => void;
  onSettings: () => void;
}) {
  return (
    <>
      <div className="p-6 flex-1">
        <div className="mb-10">
          <Logo size="md" />
        </div>
        <nav className="space-y-1" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const active = activeView === item.id;
            return (
              <button key={item.id} onClick={() => navigate(item.id)} aria-current={active ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${active ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />{item.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-border space-y-1">
        <button onClick={onSettings} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <Settings className="w-4 h-4" /> Ajustes
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
    </>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<View>("overview");
  const [rawSearch, setRawSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Notifications state ───────────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [overdueList, setOverdueList] = useState<OverdueInstallment[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ── Modal: Agregar Paciente ───────────────────────────────────────────────
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [patientForm, setPatientForm] = useState({ firstName: "", lastName: "", email: "", phone: "", identityDocument: "", password: "" });
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [patientSuccess, setPatientSuccess] = useState(false);

  // ── Modal: Agregar Comercio ───────────────────────────────────────────────
  const [isAddMerchantOpen, setIsAddMerchantOpen] = useState(false);
  const [merchantForm, setMerchantForm] = useState({ legalName: "", tradeName: "", rif: "", category: "CLINIC", email: "", phone: "", city: "", contactName: "" });
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [merchantError, setMerchantError] = useState<string | null>(null);
  const [merchantSuccess, setMerchantSuccess] = useState(false);

  // ── Modal: Perfil / Configuración / Ayuda ────────────────────────────────
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const adminUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("admin_user") ?? "null") : null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("admin_user");
    document.cookie = "jwt_token=; path=/; max-age=0";
    router.push("/login");
  }, [router]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchTerm(val), 300);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [isDarkMode]);

  const navigate = useCallback((view: View) => {
    setActiveView(view);
    setSidebarOpen(false);
  }, []);

  const handleOpenNotifications = useCallback(async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen && overdueList.length === 0) {
      setNotifLoading(true);
      try {
        const res = await fetch(getApiUrl("admin/installments/overdue"), { headers: getAuthHeaders() });
        if (res.ok) setOverdueList(await res.json());
      } finally {
        setNotifLoading(false);
      }
    }
  }, [notifOpen, overdueList.length]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientError(null);
    setPatientLoading(true);
    try {
      const res = await fetch(getApiUrl("admin/users"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(patientForm),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? `Error ${res.status}`);
      }
      setPatientSuccess(true);
      setRefreshTrigger(v => v + 1);
      setTimeout(() => {
        setIsAddPatientOpen(false);
        setPatientSuccess(false);
        setPatientForm({ firstName: "", lastName: "", email: "", phone: "", identityDocument: "", password: "" });
      }, 1500);
    } catch (err: unknown) {
      setPatientError(err instanceof Error ? err.message : "Error al crear paciente");
    } finally {
      setPatientLoading(false);
    }
  };

  const handleAddMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantError(null);
    setMerchantLoading(true);
    try {
      const res = await fetch(getApiUrl("admin/merchants"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(merchantForm),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? `Error ${res.status}`);
      }
      setMerchantSuccess(true);
      setRefreshTrigger(v => v + 1);
      setTimeout(() => {
        setIsAddMerchantOpen(false);
        setMerchantSuccess(false);
        setMerchantForm({ legalName: "", tradeName: "", rif: "", category: "CLINIC", email: "", phone: "", city: "", contactName: "" });
      }, 1500);
    } catch (err: unknown) {
      setMerchantError(err instanceof Error ? err.message : "Error al crear comercio");
    } finally {
      setMerchantLoading(false);
    }
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      {/* Notifications overlay */}
      {notifOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-60 border-r border-border bg-card flex-col shrink-0">
        <SidebarContent activeView={activeView} navigate={navigate} onLogout={handleLogout} onSettings={() => setIsSettingsOpen(true)} />
      </aside>

      {/* Sidebar — mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} aria-label="Menú lateral">
        <div className="flex items-center justify-end p-4 border-b border-border">
          <button onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent activeView={activeView} navigate={navigate} onLogout={handleLogout} onSettings={() => setIsSettingsOpen(true)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold font-(family-name:--font-syne)">{VIEW_TITLES[activeView]}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="search" placeholder="Buscar..." value={rawSearch} onChange={handleSearchChange} aria-label="Buscar en el panel" className="pl-9 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-52 transition-all" />
            </div>

            <button onClick={toggleDarkMode} aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications button + panel */}
            <div className="relative">
              <button onClick={handleOpenNotifications} aria-label={"Ver notificaciones" + (overdueList.length > 0 ? ` (${overdueList.length})` : "")} className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Bell className="w-5 h-5" />
                {overdueList.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive rounded-full text-[9px] text-white flex items-center justify-center font-bold" aria-hidden="true">
                    {overdueList.length > 9 ? "9+" : overdueList.length}
                  </span>
                )}
                {overdueList.length === 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" aria-hidden="true" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 z-40 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="font-semibold text-sm font-(family-name:--font-syne)">Cuotas en Mora</span>
                    <button onClick={() => setNotifOpen(false)} aria-label="Cerrar notificaciones" className="p-1 rounded hover:bg-muted">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground gap-2 text-sm">
                        <Clock className="w-4 h-4 animate-spin" /> Cargando...
                      </div>
                    ) : overdueList.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        Sin cuotas en mora
                      </div>
                    ) : (
                      overdueList.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 px-4 py-3 border-b border-border/60 last:border-0 hover:bg-accent/40 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.user?.fullName ?? "Paciente"}</p>
                            <p className="text-xs text-muted-foreground">Cuota vencida · ${item.amount?.toFixed(2) ?? "—"}</p>
                          </div>
                          <span className="text-xs text-destructive font-medium whitespace-nowrap">
                            {item.dueDate ? new Date(item.dueDate).toLocaleDateString("es-VE") : "—"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Menú de usuario" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {(adminUser?.firstName?.[0] ?? "A").toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-semibold">{adminUser?.firstName ?? "Administrador"}</p>
                  <p className="text-xs text-muted-foreground">{adminUser?.email ?? "admin@saludtech.com"}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" /> Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" /> Configuración
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsHelpOpen(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" /> Ayuda
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <main id="main-content" className="flex-1 overflow-auto p-4 md:p-8">
          {activeView === "overview" && <OverviewView searchTerm={searchTerm} />}
          {activeView === "pacientes" && <PacientesView searchTerm={searchTerm} onAddPatient={() => setIsAddPatientOpen(true)} refreshTrigger={refreshTrigger} />}
          {activeView === "comercios" && <ComerciosView searchTerm={searchTerm} onAddMerchant={() => setIsAddMerchantOpen(true)} refreshTrigger={refreshTrigger} />}
          {activeView === "financiamientos" && <FinanciamientosView searchTerm={searchTerm} />}
          {activeView === "triajes" && <TriajesView searchTerm={searchTerm} />}
          {activeView === "elder-care" && <ElderCareView searchTerm={searchTerm} />}
          {activeView === "suscripciones" && <SuscripcionesView searchTerm={searchTerm} />}
        </main>

      </div>

      {/* ── Modal: Agregar Paciente ─────────────────────────────────────────── */}
      <Dialog open={isAddPatientOpen} onOpenChange={(o) => { setIsAddPatientOpen(o); if (!o) { setPatientError(null); setPatientSuccess(false); } }}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-syne)">Agregar Paciente</DialogTitle>
            <DialogDescription>Crea una cuenta de paciente y asigna una línea de crédito inicial.</DialogDescription>
          </DialogHeader>
          {patientSuccess ? (
            <div className="flex flex-col items-center py-8 gap-3 text-green-600">
              <CheckCircle2 className="w-12 h-12" />
              <p className="font-semibold">Paciente creado exitosamente</p>
            </div>
          ) : (
            <form onSubmit={handleAddPatient} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" required value={patientForm.firstName} onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" required value={patientForm.lastName} onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="identityDocument">Cédula</Label>
                <Input id="identityDocument" required value={patientForm.identityDocument} onChange={(e) => setPatientForm({ ...patientForm, identityDocument: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" required value={patientForm.email} onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" required value={patientForm.phone} onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" required value={patientForm.password} onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })} />
                </div>
              </div>
              {patientError && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{patientError}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={patientLoading}>
                  {patientLoading && <Clock className="w-4 h-4 mr-2 animate-spin" />}
                  Crear Paciente
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal: Agregar Comercio ─────────────────────────────────────────── */}
      <Dialog open={isAddMerchantOpen} onOpenChange={(o) => { setIsAddMerchantOpen(o); if (!o) { setMerchantError(null); setMerchantSuccess(false); } }}>
        <DialogContent className="sm:max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-(family-name:--font-syne)">Afiliar Comercio</DialogTitle>
            <DialogDescription>Registra una nueva clínica, farmacia o proveedor.</DialogDescription>
          </DialogHeader>
          {merchantSuccess ? (
            <div className="flex flex-col items-center py-8 gap-3 text-green-600">
              <CheckCircle2 className="w-12 h-12" />
              <p className="font-semibold">Comercio afiliado exitosamente</p>
            </div>
          ) : (
            <form onSubmit={handleAddMerchant} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="legalName">Razón Social</Label>
                <Input id="legalName" required value={merchantForm.legalName} onChange={(e) => setMerchantForm({ ...merchantForm, legalName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradeName">Nombre Comercial</Label>
                <Input id="tradeName" required value={merchantForm.tradeName} onChange={(e) => setMerchantForm({ ...merchantForm, tradeName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rif">RIF</Label>
                  <Input id="rif" required value={merchantForm.rif} onChange={(e) => setMerchantForm({ ...merchantForm, rif: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <select id="category" required value={merchantForm.category} onChange={(e) => setMerchantForm({ ...merchantForm, category: e.target.value })} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="CLINIC">Clínica</option>
                    <option value="PHARMACY">Farmacia</option>
                    <option value="DENTAL">Odontología</option>
                    <option value="OPTICAL">Óptica</option>
                    <option value="LABORATORY">Laboratorio</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailMerch">Email de Contacto</Label>
                <Input id="emailMerch" type="email" required value={merchantForm.email} onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneMerch">Teléfono</Label>
                  <Input id="phoneMerch" type="tel" required value={merchantForm.phone} onChange={(e) => setMerchantForm({ ...merchantForm, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" required value={merchantForm.city} onChange={(e) => setMerchantForm({ ...merchantForm, city: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Nombre de Contacto</Label>
                <Input id="contactName" required value={merchantForm.contactName} onChange={(e) => setMerchantForm({ ...merchantForm, contactName: e.target.value })} />
              </div>
              
              {merchantError && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{merchantError}</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddMerchantOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={merchantLoading}>
                  {merchantLoading && <Clock className="w-4 h-4 mr-2 animate-spin" />}
                  Afiliar Comercio
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
