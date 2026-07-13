"use client";

import { useState } from "react";
import { Activity, Send } from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl, apiFetch } from "../../../lib/api";

export default function TriajesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading, refetch } = useFetchData<any>(getApiUrl("admin/triage/pending?limit=50&offset=0"));
  const [responding, setResponding] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [respondStatus, setRespondStatus] = useState("RESOLVED");

  const triages = data?.triage || [];
  const filtered = triages.filter(
    (t: any) =>
      t.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.priority?.toLowerCase().includes(searchTerm.toLowerCase())
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
      const res = await apiFetch(getApiUrl(`admin/triage/${id}/respond`), {
        method: 'PUT',
        body: JSON.stringify({ recommendation: notes, status: respondStatus }),
      });
      if (res.ok) { setResponding(null); setNotes(""); refetch(); }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando triajes pendientes...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{filtered.length} triajes pendientes (ordenados por urgencia)</p>
        <div className="relative hidden sm:block mr-2">
          <input type="search" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-52 transition-all" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No hay triajes pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t: any) => (
            <div key={t.id} className={`card bg-base-100 shadow-sm ${t.priority === 'EMERGENCY' ? 'border border-red-300' : 'border border-base-300'}`}>
              <div className="card-body p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${URGENCY_COLOR[t.priority] ?? URGENCY_COLOR.LOW}`}>
                        {URGENCY_LABEL[t.priority] ?? t.priority}
                      </span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        Severidad: {t.perceived_severity}/10
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.user_name && `👤 ${t.user_name} · `}
                        {t.created_at ? new Date(t.created_at).toLocaleString('es-VE') : ''}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{t.symptoms}</p>
                    {t.recommendation && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">{t.recommendation}</p>
                    )}
                  </div>
                  <button className="btn btn-primary btn-sm gap-1 shrink-0" onClick={() => setResponding(t.id)}>
                    <Send className="w-3.5 h-3.5" /> Responder
                  </button>
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
                      <button className="btn btn-ghost btn-sm" onClick={() => setResponding(null)}>Cancelar</button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleRespond(t.id)} disabled={!notes.trim()}>Confirmar Respuesta</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
