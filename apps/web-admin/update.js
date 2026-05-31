const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const useFetchDataHook = // --- Fetch Hooks / Helpers --------------------------------------------------
function useFetchData<T>(url: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(\Error: \\);
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

;

content = content.replace('// --- Sub-views -----------------------------------------------------------------', useFetchDataHook + '// --- Sub-views -----------------------------------------------------------------');

const newOverview = unction OverviewView({ searchTerm }: { searchTerm: string }) {
  const { data: stats, loading: statsLoading } = useFetchData<any>(\\/admin/dashboard/stats\);
  const { data: txData, loading: txLoading } = useFetchData<any>(\\/admin/transactions?size=5\);

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
            value: \$\\,
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
            sub: \$\ vencido\,
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
                <kpi.icon className={\h-4 w-4 \\} />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className={\	ext-3xl font-bold tracking-tight font-(family-name:--font-syne) \\}>
                {kpi.value}
              </div>
              <p className={\	ext-xs mt-1 flex items-center gap-1 \\}>
                {kpi.trend === "up" && <TrendingUp className="w-3 h-3" />}
                {kpi.trend === "down" && <TrendingDown className="w-3 h-3" />}
                {kpi.sub}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={\h-full rounded-full transition-all \\}
                  style={{ width: \\%\ }}
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
                      <TableCell className="text-right font-semibold">$\</TableCell>
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
                    style={{ width: \\%\ }}
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
};

const newPacientes = unction PacientesView({ searchTerm, onAddPatient, refreshTrigger }: { searchTerm: string; onAddPatient: () => void; refreshTrigger: number }) {
  const { data, loading } = useFetchData<any>(\\/admin/users?size=50\, [refreshTrigger]);
  
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
                  <TableHead>Email</TableHead>
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
                    <TableCell className="text-muted-foreground">{p.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const newComercios = unction ComerciosView({ searchTerm, onAddMerchant, refreshTrigger }: { searchTerm: string; onAddMerchant: () => void; refreshTrigger: number }) {
  const { data, loading } = useFetchData<any[]>(\\/admin/merchants\, [refreshTrigger]);
  
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
                  <Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Activo" : "Inactivo"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Pill className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{c.category}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">{c.city}</span>
                  <span className="font-semibold">{c.phone}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const newFinanciamientos = unction FinanciamientosView({ searchTerm }: { searchTerm: string }) {
  const { data, loading } = useFetchData<any>(\\/admin/transactions?size=50\);

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
                    <TableCell className="font-semibold">$\</TableCell>
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
};

content = content.replace(/function OverviewView[\s\S]*?function PacientesView/, newOverview + '\n\nfunction PacientesView');
content = content.replace(/function PacientesView[\s\S]*?function ComerciosView/, newPacientes + '\n\nfunction ComerciosView');
content = content.replace(/function ComerciosView[\s\S]*?function FinanciamientosView/, newComercios + '\n\nfunction FinanciamientosView');
content = content.replace(/function FinanciamientosView[\s\S]*?\/\/ --- Sidebar content/, newFinanciamientos + '\n\n// --- Sidebar content');

content = content.replace(/const \[isAddPatientOpen, setIsAddPatientOpen\] = useState\(false\);/, 'const [refreshTrigger, setRefreshTrigger] = useState(0);\n  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);');

content = content.replace(/setPatientSuccess\(true\);/, 'setPatientSuccess(true);\n      setRefreshTrigger(v => v + 1);');
content = content.replace(/setMerchantSuccess\(true\);/, 'setMerchantSuccess(true);\n      setRefreshTrigger(v => v + 1);');

content = content.replace(/<PacientesView searchTerm=\{searchTerm\} onAddPatient=\{.*?\} \/>/, '<PacientesView searchTerm={searchTerm} onAddPatient={() => setIsAddPatientOpen(true)} refreshTrigger={refreshTrigger} />');
content = content.replace(/<ComerciosView searchTerm=\{searchTerm\} onAddMerchant=\{.*?\} \/>/, '<ComerciosView searchTerm={searchTerm} onAddMerchant={() => setIsAddMerchantOpen(true)} refreshTrigger={refreshTrigger} />');


fs.writeFileSync('src/app/page.tsx', content);
