"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Droplet, Ruler, Weight, Phone, AlertCircle, Pill, Save, CheckCircle2 } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"];

export default function HealthProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bloodType, setBloodType] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState("");
  const [emergName, setEmergName] = useState("");
  const [emergPhone, setEmergPhone] = useState("");
  const [emergRelation, setEmergRelation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(getApiUrl("patient/health-profile"));
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.profile) {
            const p = data.profile;
            setBloodType(p.blood_type || "");
            setHeightCm(p.height_cm ? String(p.height_cm) : "");
            setWeightKg(p.weight_kg ? String(p.weight_kg) : "");
            setAllergies(p.allergies || []);
            setChronicConditions(p.chronic_conditions || []);
            setCurrentMedications(p.current_medications || []);
            setEmergName(p.emergency_contact_name || "");
            setEmergPhone(p.emergency_contact_phone || "");
            setEmergRelation(p.emergency_contact_relation || "");
            setNotes(p.notes || "");
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addTag = (value: string, list: string[], setter: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
    const v = value.trim();
    if (v && !list.includes(v)) {
      setter([...list, v]);
    }
    setInput("");
  };

  const removeTag = (tag: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(getApiUrl("patient/health-profile"), {
        method: "PUT",
        body: JSON.stringify({
          bloodType,
          heightCm: heightCm ? parseInt(heightCm) : 0,
          weightKg: weightKg ? parseFloat(weightKg) : 0,
          allergies,
          chronicConditions,
          currentMedications,
          emergencyContactName: emergName,
          emergencyContactPhone: emergPhone,
          emergencyContactRelation: emergRelation,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner text-primary" />
      </div>
    );
  }

  const TagList = ({ items, onRemove, color }: { items: string[]; onRemove: (t: string) => void; color: string }) => (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {items.map((tag) => (
        <span key={tag} className={`badge badge-sm ${color} gap-1`}>
          {tag}
          <button onClick={() => onRemove(tag)} className="ml-0.5 hover:text-error">✕</button>
        </span>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground font-display flex items-center gap-2">
          <Heart className="w-5 h-5 text-error" /> Perfil de Salud
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Información médica que nos ayuda a atenderte mejor
        </p>
      </div>

      {/* Blood type + measurements */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-4">
          <h2 className="card-title text-base font-display">Datos Básicos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium flex items-center gap-1"><Droplet className="w-3.5 h-3.5" /> Tipo de Sangre</span></label>
              <select value={bloodType} onChange={(e) => setBloodType(e.target.value)} className="select select-bordered w-full text-sm">
                <option value="">Desconocido</option>
                {bloodTypes.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> Altura (cm)</span></label>
              <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="170" className="input input-bordered w-full text-sm" />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium flex items-center gap-1"><Weight className="w-3.5 h-3.5" /> Peso (kg)</span></label>
              <input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="70.5" className="input input-bordered w-full text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Allergies */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-2">
          <h2 className="card-title text-base font-display flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" /> Alergias
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag(allergyInput, allergies, setAllergies, allergyInput, setAllergyInput)}
              placeholder="Ej: Penicilina, mariscos..."
              className="input input-bordered flex-1 text-sm"
            />
            <button onClick={() => addTag(allergyInput, allergies, setAllergies, allergyInput, setAllergyInput)} className="btn btn-outline btn-sm">Agregar</button>
          </div>
          <TagList items={allergies} onRemove={(t) => removeTag(t, allergies, setAllergies)} color="badge-warning" />
        </div>
      </div>

      {/* Chronic conditions */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-2">
          <h2 className="card-title text-base font-display">Condiciones Crónicas</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={conditionInput}
              onChange={(e) => setConditionInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag(conditionInput, chronicConditions, setChronicConditions, conditionInput, setConditionInput)}
              placeholder="Ej: Diabetes, hipertensión..."
              className="input input-bordered flex-1 text-sm"
            />
            <button onClick={() => addTag(conditionInput, chronicConditions, setChronicConditions, conditionInput, setConditionInput)} className="btn btn-outline btn-sm">Agregar</button>
          </div>
          <TagList items={chronicConditions} onRemove={(t) => removeTag(t, chronicConditions, setChronicConditions)} color="badge-error" />
        </div>
      </div>

      {/* Current medications */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-2">
          <h2 className="card-title text-base font-display flex items-center gap-2">
            <Pill className="w-4 h-4 text-primary" /> Medicamentos Actuales
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={medicationInput}
              onChange={(e) => setMedicationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag(medicationInput, currentMedications, setCurrentMedications, medicationInput, setMedicationInput)}
              placeholder="Ej: Metformina 500mg..."
              className="input input-bordered flex-1 text-sm"
            />
            <button onClick={() => addTag(medicationInput, currentMedications, setCurrentMedications, medicationInput, setMedicationInput)} className="btn btn-outline btn-sm">Agregar</button>
          </div>
          <TagList items={currentMedications} onRemove={(t) => removeTag(t, currentMedications, setCurrentMedications)} color="badge-primary" />
        </div>
      </div>

      {/* Emergency contact */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-4">
          <h2 className="card-title text-base font-display flex items-center gap-2">
            <Phone className="w-4 h-4 text-success" /> Contacto de Emergencia
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">Nombre</span></label>
              <input value={emergName} onChange={(e) => setEmergName(e.target.value)} placeholder="Nombre completo" className="input input-bordered w-full text-sm" />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">Teléfono</span></label>
              <input type="tel" value={emergPhone} onChange={(e) => setEmergPhone(e.target.value)} placeholder="+58 412..." className="input input-bordered w-full text-sm" />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">Relación</span></label>
              <select value={emergRelation} onChange={(e) => setEmergRelation(e.target.value)} className="select select-bordered w-full text-sm">
                <option value="">Seleccionar...</option>
                <option value="parent">Padre/Madre</option>
                <option value="spouse">Cónyuge</option>
                <option value="sibling">Hermano/a</option>
                <option value="child">Hijo/a</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-2">
          <h2 className="card-title text-base font-display">Notas</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Información adicional relevante para tu atención médica..."
            className="textarea textarea-bordered w-full text-sm"
            rows={3}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end gap-2">
        {saved && (
          <span className="text-success text-sm flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Guardado
          </span>
        )}
        <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm gap-2">
          {saving ? <span className="loading loading-spinner loading-xs" /> : <Save className="w-4 h-4" />}
          Guardar Perfil
        </button>
      </div>
    </div>
  );
}
