package patient

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/saludtech/backend-go/internal/auth"
	"github.com/saludtech/backend-go/internal/database"
)

func parsePagination(r *http.Request, defaultLimit int) (int, int) {
	limit := defaultLimit
	offset := 0
	if l := r.URL.Query().Get("limit"); l != "" {
		if v, err := strconv.Atoi(l); err == nil && v > 0 && v <= 200 {
			limit = v
		}
	}
	if o := r.URL.Query().Get("offset"); o != "" {
		if v, err := strconv.Atoi(o); err == nil && v >= 0 {
			offset = v
		}
	}
	return limit, offset
}

// ─── Health Profile ─────────────────────────────────────────────────────────

func (h *PatientHandler) GetHealthProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	profile, err := h.DB.GetHealthProfile(ctx, uid)
	if err != nil {
		// No profile yet — return empty object
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"exists": false})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"exists":  true,
		"profile": profile,
	})
}

type HealthProfileRequest struct {
	BloodType               string   `json:"bloodType"`
	HeightCm                int      `json:"heightCm"`
	WeightKg                float64  `json:"weightKg"`
	Allergies               []string `json:"allergies"`
	ChronicConditions       []string `json:"chronicConditions"`
	CurrentMedications      []string `json:"currentMedications"`
	EmergencyContactName    string   `json:"emergencyContactName"`
	EmergencyContactPhone   string   `json:"emergencyContactPhone"`
	EmergencyContactRelation string  `json:"emergencyContactRelation"`
	Notes                   string   `json:"notes"`
}

func (h *PatientHandler) UpsertHealthProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req HealthProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	var bloodType pgtype.Text
	if req.BloodType != "" {
		bloodType = pgtype.Text{String: req.BloodType, Valid: true}
	}

	var heightCm pgtype.Int2
	if req.HeightCm > 0 {
		heightCm = pgtype.Int2{Int16: int16(req.HeightCm), Valid: true}
	}

	var weightKg pgtype.Numeric
	if req.WeightKg > 0 {
		weightKg.Scan(strconv.FormatFloat(req.WeightKg, 'f', 2, 64))
	}

	var emergName, emergPhone, emergRel pgtype.Text
	if req.EmergencyContactName != "" {
		emergName = pgtype.Text{String: req.EmergencyContactName, Valid: true}
	}
	if req.EmergencyContactPhone != "" {
		emergPhone = pgtype.Text{String: req.EmergencyContactPhone, Valid: true}
	}
	if req.EmergencyContactRelation != "" {
		emergRel = pgtype.Text{String: req.EmergencyContactRelation, Valid: true}
	}

	var notes pgtype.Text
	if req.Notes != "" {
		notes = pgtype.Text{String: req.Notes, Valid: true}
	}

	profile, err := h.DB.UpsertHealthProfile(ctx, database.UpsertHealthProfileParams{
		UserID:                  uid,
		BloodType:               bloodType,
		HeightCm:                heightCm,
		WeightKg:                weightKg,
		Allergies:                req.Allergies,
		ChronicConditions:       req.ChronicConditions,
		CurrentMedications:      req.CurrentMedications,
		EmergencyContactName:    emergName,
		EmergencyContactPhone:   emergPhone,
		EmergencyContactRelation: emergRel,
		Notes:                   notes,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to save health profile"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

// ─── Medical Records ────────────────────────────────────────────────────────

func (h *PatientHandler) ListMedicalRecords(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	limit, offset := parsePagination(r, 50)

	records, err := h.DB.ListMedicalRecords(ctx, database.ListMedicalRecordsParams{
		UserID: uid,
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch medical records"}`, http.StatusInternalServerError)
		return
	}

	total, _ := h.DB.CountMedicalRecords(ctx, uid)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"records": records,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
	})
}

type MedicalRecordRequest struct {
	TransactionID string `json:"transactionId"`
	MerchantID    string `json:"merchantId"`
	ServiceID     string `json:"serviceId"`
	RecordType    string `json:"recordType"`
	Diagnosis     string `json:"diagnosis"`
	Prescription  string `json:"prescription"`
	DoctorName    string `json:"doctorName"`
	Notes         string `json:"notes"`
	RecordDate    string `json:"recordDate"` // YYYY-MM-DD
}

func (h *PatientHandler) CreateMedicalRecord(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req MedicalRecordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.RecordType == "" {
		req.RecordType = "CONSULTATION"
	}

	var txID, merchID, svcID pgtype.UUID
	if req.TransactionID != "" {
		if err := txID.Scan(req.TransactionID); err != nil {
			http.Error(w, `{"error":"Invalid transaction ID"}`, http.StatusBadRequest)
			return
		}
	}
	if req.MerchantID != "" {
		if err := merchID.Scan(req.MerchantID); err != nil {
			http.Error(w, `{"error":"Invalid merchant ID"}`, http.StatusBadRequest)
			return
		}
	}
	if req.ServiceID != "" {
		if err := svcID.Scan(req.ServiceID); err != nil {
			http.Error(w, `{"error":"Invalid service ID"}`, http.StatusBadRequest)
			return
		}
	}

	var recordDate pgtype.Date
	if req.RecordDate != "" {
		if err := recordDate.Scan(req.RecordDate); err != nil {
			// default to today
			recordDate.Scan(time.Now().Format("2006-01-02"))
		}
	} else {
		recordDate.Scan(time.Now().Format("2006-01-02"))
	}

	var diagnosis, prescription, doctorName, notes pgtype.Text
	if req.Diagnosis != "" {
		diagnosis = pgtype.Text{String: req.Diagnosis, Valid: true}
	}
	if req.Prescription != "" {
		prescription = pgtype.Text{String: req.Prescription, Valid: true}
	}
	if req.DoctorName != "" {
		doctorName = pgtype.Text{String: req.DoctorName, Valid: true}
	}
	if req.Notes != "" {
		notes = pgtype.Text{String: req.Notes, Valid: true}
	}

	record, err := h.DB.CreateMedicalRecord(ctx, database.CreateMedicalRecordParams{
		UserID:       uid,
		TransactionID: txID,
		MerchantID:   merchID,
		ServiceID:    svcID,
		RecordType:   req.RecordType,
		Diagnosis:    diagnosis,
		Prescription: prescription,
		DoctorName:   doctorName,
		Notes:        notes,
		RecordDate:   recordDate,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to create medical record"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(record)
}

func (h *PatientHandler) DeleteMedicalRecord(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	id := r.PathValue("id")
	var recID pgtype.UUID
	if err := recID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid record ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.DB.DeleteMedicalRecord(ctx, database.DeleteMedicalRecordParams{
		ID:     recID,
		UserID: uid,
	}); err != nil {
		http.Error(w, `{"error":"Failed to delete medical record"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Medical record deleted"})
}

// ─── Appointments ───────────────────────────────────────────────────────────

func (h *PatientHandler) ListAppointments(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	limit, offset := parsePagination(r, 50)

	appointments, err := h.DB.ListAppointments(ctx, database.ListAppointmentsParams{
		UserID: uid,
		Limit:  int32(limit),
		Offset: int32(offset),
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch appointments"}`, http.StatusInternalServerError)
		return
	}

	total, _ := h.DB.CountAppointments(ctx, uid)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"appointments": appointments,
		"total":        total,
		"limit":        limit,
		"offset":       offset,
	})
}

type AppointmentRequest struct {
	MerchantID       string `json:"merchantId"`
	ServiceID        string `json:"serviceId"`
	AppointmentDate  string `json:"appointmentDate"`  // YYYY-MM-DD
	AppointmentTime  string `json:"appointmentTime"`  // HH:MM
	DurationMin      int    `json:"durationMin"`
	Notes            string `json:"notes"`
}

func (h *PatientHandler) CreateAppointment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req AppointmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.MerchantID == "" || req.AppointmentDate == "" || req.AppointmentTime == "" {
		http.Error(w, `{"error":"merchantId, appointmentDate and appointmentTime are required"}`, http.StatusBadRequest)
		return
	}

	merchID, err := parseUUID(req.MerchantID)
	if err != nil {
		http.Error(w, `{"error":"Invalid merchant ID"}`, http.StatusBadRequest)
		return
	}

	var svcID pgtype.UUID
	if req.ServiceID != "" {
		if err := svcID.Scan(req.ServiceID); err != nil {
			http.Error(w, `{"error":"Invalid service ID"}`, http.StatusBadRequest)
			return
		}
	}

	var apptDate pgtype.Date
	if err := apptDate.Scan(req.AppointmentDate); err != nil {
		http.Error(w, `{"error":"Invalid appointment date (use YYYY-MM-DD)"}`, http.StatusBadRequest)
		return
	}

	var apptTime pgtype.Time
	if err := apptTime.Scan(req.AppointmentTime); err != nil {
		http.Error(w, `{"error":"Invalid appointment time (use HH:MM)"}`, http.StatusBadRequest)
		return
	}

	duration := int16(30)
	if req.DurationMin > 0 {
		duration = int16(req.DurationMin)
	}

	var notes pgtype.Text
	if req.Notes != "" {
		notes = pgtype.Text{String: req.Notes, Valid: true}
	}

	// Check for conflicts
	conflict, _ := h.DB.CheckAppointmentConflict(ctx, database.CheckAppointmentConflictParams{
		MerchantID:       merchID,
		AppointmentDate:  apptDate,
		AppointmentTime:  apptTime,
	})
	if conflict.Valid {
		http.Error(w, `{"error":"Time slot already booked for this merchant"}`, http.StatusConflict)
		return
	}

	appointment, err := h.DB.CreateAppointment(ctx, database.CreateAppointmentParams{
		UserID:          uid,
		MerchantID:      merchID,
		ServiceID:       svcID,
		AppointmentDate: apptDate,
		AppointmentTime: apptTime,
		DurationMin:     duration,
		Notes:           notes,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to create appointment"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(appointment)
}

func (h *PatientHandler) CancelAppointment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	id := r.PathValue("id")
	var apptID pgtype.UUID
	if err := apptID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid appointment ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.DB.CancelAppointment(ctx, database.CancelAppointmentParams{
		ID:     apptID,
		UserID: uid,
	}); err != nil {
		http.Error(w, `{"error":"Failed to cancel appointment"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Appointment cancelled"})
}

// ─── Medication Reminders ───────────────────────────────────────────────────

func (h *PatientHandler) ListMedicationReminders(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	reminders, err := h.DB.ListMedicationReminders(ctx, uid)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch medication reminders"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"reminders": reminders,
	})
}

type MedicationReminderRequest struct {
	MedicationName string   `json:"medicationName"`
	Dosage         string   `json:"dosage"`
	Frequency      string   `json:"frequency"`
	Times          []string `json:"times"`
	StartDate      string   `json:"startDate"`
	EndDate        string   `json:"endDate"`
	Notes          string   `json:"notes"`
}

func (h *PatientHandler) CreateMedicationReminder(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req MedicationReminderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.MedicationName == "" {
		http.Error(w, `{"error":"medicationName is required"}`, http.StatusBadRequest)
		return
	}

	if req.Frequency == "" {
		req.Frequency = "DAILY"
	}

	if len(req.Times) == 0 {
		req.Times = []string{"08:00"}
	}

	var startDate pgtype.Date
	if req.StartDate != "" {
		startDate.Scan(req.StartDate)
	} else {
		startDate.Scan(time.Now().Format("2006-01-02"))
	}

	var endDate pgtype.Date
	if req.EndDate != "" {
		endDate.Scan(req.EndDate)
	}

	var notes pgtype.Text
	if req.Notes != "" {
		notes = pgtype.Text{String: req.Notes, Valid: true}
	}

	reminder, err := h.DB.CreateMedicationReminder(ctx, database.CreateMedicationReminderParams{
		UserID:         uid,
		MedicationName:  req.MedicationName,
		Dosage:          pgtype.Text{String: req.Dosage, Valid: req.Dosage != ""},
		Frequency:       req.Frequency,
		Times:           req.Times,
		StartDate:       startDate,
		EndDate:         endDate,
		Notes:           notes,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to create medication reminder"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(reminder)
}

func (h *PatientHandler) DeleteMedicationReminder(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	id := r.PathValue("id")
	var remID pgtype.UUID
	if err := remID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid reminder ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.DB.DeleteMedicationReminder(ctx, database.DeleteMedicationReminderParams{
		ID:     remID,
		UserID: uid,
	}); err != nil {
		http.Error(w, `{"error":"Failed to delete medication reminder"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Medication reminder deleted"})
}

// ─── Family / Caregiver ──────────────────────────────────────────────────────

func (h *PatientHandler) ListFamilyMembers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	members, err := h.DB.ListFamilyMembers(ctx, uid)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch family members"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"familyMembers": members,
	})
}

func (h *PatientHandler) ListCaregivers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	caregivers, err := h.DB.ListCaregivers(ctx, uid)
	if err != nil {
		http.Error(w, `{"error":"Failed to fetch caregivers"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"caregivers": caregivers,
	})
}

type FamilyMemberRequest struct {
	PhoneOrEmail string   `json:"phoneOrEmail"`
	Relation     string   `json:"relation"`
	Permissions  []string `json:"permissions"`
}

func (h *PatientHandler) InviteFamilyMember(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	caregiverID, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req FamilyMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.PhoneOrEmail == "" {
		http.Error(w, `{"error":"phoneOrEmail is required"}`, http.StatusBadRequest)
		return
	}

	// Find the patient by phone or email
	patient, err := h.DB.FindUserByPhoneOrEmail(ctx, req.PhoneOrEmail)
	if err != nil {
		http.Error(w, `{"error":"Patient not found with that phone or email"}`, http.StatusNotFound)
		return
	}

	if patient.ID == caregiverID {
		http.Error(w, `{"error":"Cannot add yourself as family member"}`, http.StatusBadRequest)
		return
	}

	var relation pgtype.Text
	if req.Relation != "" {
		relation = pgtype.Text{String: req.Relation, Valid: true}
	}

	perms := req.Permissions
	if perms == nil {
		perms = []string{}
	}

	member, err := h.DB.CreateFamilyMember(ctx, database.CreateFamilyMemberParams{
		CaregiverID: caregiverID,
		PatientID:   patient.ID,
		Relation:    relation,
		Permissions: perms,
	})
	if err != nil {
		http.Error(w, `{"error":"Failed to create family member link (maybe already exists)"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(member)
}

func (h *PatientHandler) RespondFamilyMember(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	id := r.PathValue("id")
	var memberID pgtype.UUID
	if err := memberID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid family member ID"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		Status string `json:"status"` // ACTIVE or REVOKED
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Status != "ACTIVE" && req.Status != "REVOKED" {
		http.Error(w, `{"error":"Status must be ACTIVE or REVOKED"}`, http.StatusBadRequest)
		return
	}

	if err := h.DB.UpdateFamilyMemberStatus(ctx, database.UpdateFamilyMemberStatusParams{
		ID:         memberID,
		CaregiverID: uid,
		Status:     req.Status,
	}); err != nil {
		http.Error(w, `{"error":"Failed to update family member status"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Family member status updated"})
}

func (h *PatientHandler) RemoveFamilyMember(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := auth.GetUserID(ctx)

	uid, err := parseUUID(userID)
	if err != nil {
		http.Error(w, `{"error":"Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	id := r.PathValue("id")
	var memberID pgtype.UUID
	if err := memberID.Scan(id); err != nil {
		http.Error(w, `{"error":"Invalid family member ID"}`, http.StatusBadRequest)
		return
	}

	if err := h.DB.DeleteFamilyMember(ctx, database.DeleteFamilyMemberParams{
		ID:         memberID,
		CaregiverID: uid,
	}); err != nil {
		http.Error(w, `{"error":"Failed to remove family member"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Family member removed"})
}
