-- ════════════════════════════════════════════════════════════
-- Health Profile
-- ════════════════════════════════════════════════════════════

-- name: GetHealthProfile :one
SELECT * FROM health_profiles WHERE user_id = $1;

-- name: CreateHealthProfile :one
INSERT INTO health_profiles (
    user_id, blood_type, height_cm, weight_kg,
    allergies, chronic_conditions, current_medications,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation, notes
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;

-- name: UpsertHealthProfile :one
INSERT INTO health_profiles (
    user_id, blood_type, height_cm, weight_kg,
    allergies, chronic_conditions, current_medications,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation, notes
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
ON CONFLICT (user_id) DO UPDATE SET
    blood_type = EXCLUDED.blood_type,
    height_cm = EXCLUDED.height_cm,
    weight_kg = EXCLUDED.weight_kg,
    allergies = EXCLUDED.allergies,
    chronic_conditions = EXCLUDED.chronic_conditions,
    current_medications = EXCLUDED.current_medications,
    emergency_contact_name = EXCLUDED.emergency_contact_name,
    emergency_contact_phone = EXCLUDED.emergency_contact_phone,
    emergency_contact_relation = EXCLUDED.emergency_contact_relation,
    notes = EXCLUDED.notes,
    updated_at = NOW()
RETURNING *;

-- ════════════════════════════════════════════════════════════
-- Medical Records
-- ════════════════════════════════════════════════════════════

-- name: ListMedicalRecords :many
SELECT * FROM medical_records
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY record_date DESC, created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountMedicalRecords :one
SELECT COUNT(*) FROM medical_records WHERE user_id = $1 AND deleted_at IS NULL;

-- name: GetMedicalRecord :one
SELECT * FROM medical_records WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL;

-- name: CreateMedicalRecord :one
INSERT INTO medical_records (
    user_id, transaction_id, merchant_id, service_id,
    record_type, diagnosis, prescription, doctor_name, notes, record_date
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING *;

-- name: UpdateMedicalRecord :exec
UPDATE medical_records
SET record_type = $3, diagnosis = $4, prescription = $5,
    doctor_name = $6, notes = $7, record_date = $8
WHERE id = $1 AND user_id = $2;

-- name: DeleteMedicalRecord :exec
UPDATE medical_records SET deleted_at = NOW()
WHERE id = $1 AND user_id = $2;

-- ════════════════════════════════════════════════════════════
-- Appointments
-- ════════════════════════════════════════════════════════════

-- name: ListAppointments :many
SELECT a.*, m.trade_name AS merchant_name, ms.name AS service_name
FROM appointments a
LEFT JOIN merchants m ON a.merchant_id = m.id
LEFT JOIN medical_services ms ON a.service_id = ms.id
WHERE a.user_id = $1
ORDER BY a.appointment_date DESC, a.appointment_time DESC
LIMIT $2 OFFSET $3;

-- name: CountAppointments :one
SELECT COUNT(*) FROM appointments WHERE user_id = $1;

-- name: GetAppointment :one
SELECT a.*, m.trade_name AS merchant_name, ms.name AS service_name
FROM appointments a
LEFT JOIN merchants m ON a.merchant_id = m.id
LEFT JOIN medical_services ms ON a.service_id = ms.id
WHERE a.id = $1 AND a.user_id = $2;

-- name: CreateAppointment :one
INSERT INTO appointments (
    user_id, merchant_id, service_id,
    appointment_date, appointment_time, duration_min, notes
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: UpdateAppointmentStatus :exec
UPDATE appointments SET status = $3
WHERE id = $1 AND (user_id = $2 OR $2 = '')
RETURNING id;

-- name: CancelAppointment :exec
UPDATE appointments SET status = 'CANCELLED'
WHERE id = $1 AND user_id = $2;

-- name: CheckAppointmentConflict :one
SELECT id FROM appointments
WHERE merchant_id = $1
  AND appointment_date = $2
  AND appointment_time = $3
  AND status NOT IN ('CANCELLED', 'COMPLETED')
LIMIT 1;

-- ════════════════════════════════════════════════════════════
-- Medication Reminders
-- ════════════════════════════════════════════════════════════

-- name: ListMedicationReminders :many
SELECT * FROM medication_reminders
WHERE user_id = $1 AND is_active = true
ORDER BY created_at DESC;

-- name: GetMedicationReminder :one
SELECT * FROM medication_reminders WHERE id = $1 AND user_id = $2;

-- name: CreateMedicationReminder :one
INSERT INTO medication_reminders (
    user_id, medication_name, dosage, frequency, times, start_date, end_date, notes
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: UpdateMedicationReminder :exec
UPDATE medication_reminders
SET medication_name = $3, dosage = $4, frequency = $5, times = $6,
    end_date = $7, is_active = $8, notes = $9
WHERE id = $1 AND user_id = $2;

-- name: DeleteMedicationReminder :exec
DELETE FROM medication_reminders WHERE id = $1 AND user_id = $2;

-- ════════════════════════════════════════════════════════════
-- Family / Caregiver
-- ════════════════════════════════════════════════════════════

-- name: ListFamilyMembers :many
SELECT fm.*, u.full_name AS patient_name, u.phone AS patient_phone, u.email AS patient_email
FROM family_members fm
JOIN users u ON fm.patient_id = u.id
WHERE fm.caregiver_id = $1
ORDER BY fm.created_at DESC;

-- name: ListCaregivers :many
SELECT fm.*, u.full_name AS caregiver_name, u.phone AS caregiver_phone, u.email AS caregiver_email
FROM family_members fm
JOIN users u ON fm.caregiver_id = u.id
WHERE fm.patient_id = $1
ORDER BY fm.created_at DESC;

-- name: GetFamilyMember :one
SELECT * FROM family_members WHERE id = $1;

-- name: CreateFamilyMember :one
INSERT INTO family_members (caregiver_id, patient_id, relation, permissions)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateFamilyMemberStatus :exec
UPDATE family_members SET status = $3 WHERE id = $1 AND (caregiver_id = $2 OR patient_id = $2);

-- name: UpdateFamilyMemberPermissions :exec
UPDATE family_members SET permissions = $3 WHERE id = $1 AND caregiver_id = $2;

-- name: DeleteFamilyMember :exec
DELETE FROM family_members WHERE id = $1 AND (caregiver_id = $2 OR patient_id = $2);

-- name: FindUserByPhoneOrEmail :one
SELECT id, full_name, phone, email FROM users
WHERE phone = $1 OR email = $1 LIMIT 1;
