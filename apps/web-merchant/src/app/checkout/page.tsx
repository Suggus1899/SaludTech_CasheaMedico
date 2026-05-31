"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from "@saludtech/ui";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Activity, DollarSign, Clock } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

interface PendingAuthorization {
  id: string;
  amount: number;
  time: string;
  patientName: string;
}

export default function CheckoutAuthorizationPage() {
  const router = useRouter();
  const [pendingAuths, setPendingAuths] = useState<PendingAuthorization[]>([]);
  const [isPolling, setIsPolling] = useState(true);

  // Poll for incoming transactions (simulated by fetching today's transactions and taking the latest ones)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchPending = async () => {
      try {
        const token = localStorage.getItem("jwt_token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/merchant/reconciliation/transactions/today`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          // Map to pending authorizations. In a real app we would check a status like "PENDING_MERCHANT_APPROVAL"
          // Here we just mock the first one or two for demonstration of the flow if they are new.
          // For the sake of the demonstration, we will show dummy data if real data is empty.
          const mapped = (data as any[]).slice(0, 2).map((tx) => ({
            id: String(tx.id).slice(0, 8).toUpperCase(),
            amount: Number(tx.totalAmount),
            time: new Date(String(tx.createdAt)).toLocaleTimeString("es-VE", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            patientName: "Paciente Anonimo",
          }));
          
          if (mapped.length > 0) {
            // Only update if there's a difference to avoid flicker
            setPendingAuths(prev => {
              if (prev.length !== mapped.length) return mapped;
              return prev;
            });
          }
        }
      } catch (e) {
        console.error("Error polling transactions", e);
      }
    };

    if (isPolling) {
      // Fetch immediately, then every 5 seconds
      fetchPending();
      interval = setInterval(fetchPending, 5000);
    }

    return () => clearInterval(interval);
  }, [isPolling]);

  const handleApprove = (id: string) => {
    // In a real app, call API to update status to ACTIVE/COMPLETED
    setPendingAuths((prev) => prev.filter((auth) => auth.id !== id));
  };

  const handleReject = (id: string) => {
    // In a real app, call API to update status to CANCELLED
    setPendingAuths((prev) => prev.filter((auth) => auth.id !== id));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold font-(family-name:--font-syne)">Autorizaciones en Tiempo Real</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isPolling ? "default" : "secondary"} className="gap-1.5 px-3 py-1 text-xs">
            {isPolling ? <Activity className="w-3.5 h-3.5 animate-pulse" /> : <Clock className="w-3.5 h-3.5" />}
            {isPolling ? "Escuchando solicitudes..." : "Pausado"}
          </Badge>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold font-(family-name:--font-syne) mb-2">Caja / Recepción</h2>
          <p className="text-muted-foreground">
            Cuando un paciente escanee el QR de la clínica e ingrese el monto, la solicitud aparecerá aquí para tu aprobación.
          </p>
        </div>

        {pendingAuths.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-bold mb-1">Esperando pacientes</h3>
              <p className="text-muted-foreground max-w-sm">
                Las solicitudes de financiamiento aparecerán en esta pantalla automáticamente.
              </p>
              
              {/* Development helper to inject a mock auth */}
              <Button 
                variant="outline" 
                className="mt-8 opacity-50 hover:opacity-100 transition-opacity"
                onClick={() => setPendingAuths([{
                  id: "MOCK-" + Math.floor(Math.random() * 10000),
                  amount: 150.00,
                  time: new Date().toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }),
                  patientName: "Juan Pérez",
                }])}
              >
                Simular Solicitud (Dev)
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingAuths.map((auth) => (
              <Card key={auth.id} className="border-primary/50 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold mb-1">Nueva Solicitud</CardTitle>
                      <CardDescription className="text-base flex items-center gap-2">
                        <span>ID: {auth.id}</span>
                        <span>•</span>
                        <span>{auth.time}</span>
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 px-3 py-1 text-sm font-semibold">
                      Pendiente
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-xl p-5 mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Monto Solicitado</p>
                      <p className="text-4xl font-bold font-(family-name:--font-syne) text-primary flex items-center">
                        <DollarSign className="w-8 h-8" />
                        {auth.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground font-medium mb-1">Paciente</p>
                      <p className="text-lg font-semibold">{auth.patientName}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => handleReject(auth.id)}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Rechazar
                    </Button>
                    <Button 
                      size="lg" 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(auth.id)}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Autorizar Transacción
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
