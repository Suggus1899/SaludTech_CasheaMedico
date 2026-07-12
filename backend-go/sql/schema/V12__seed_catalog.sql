-- ============================================================
-- V12: Seed catálogo médico (servicios, insumos y comercios nuevos)
-- Usa subqueries por trade_name para evitar dependencia de UUIDs
-- ============================================================

-- ─── Comercios nuevos ────────────────────────────────────────

INSERT INTO merchants (id, legal_name, trade_name, rif, category, subcategory, address, city, phone, email, contact_name, mdr_rate, bank_account_bs, bank_account_usd, is_active, is_online, min_transaction)
VALUES
('a1b2c3d4-1111-4111-8111-111111111101', 'Centro Médico La Paz C.A.', 'Centro Médico La Paz', 'J-12345678-2', 'CLINIC', 'GENERAL', 'Av. Bolívar, Maracay', 'Maracay', '+58243-1111111', 'info@centromedicolapaz.com', 'Dr. Pérez', 0.08, '0102-1111-1111-1111-1111', 'USD-1111', true, true, 10.00),
('a1b2c3d4-1111-4111-8111-111111111102', 'Laboratorio Corposalud C.A.', 'Laboratorio Corposalud', 'J-12345679-3', 'LABORATORY', 'CLINICAL', 'Av. Bolívar, Valencia', 'Valencia', '+58241-2222222', 'info@corposalud.com', 'Lic. Gómez', 0.06, '0102-2222-2222-2222-2222', 'USD-2222', true, true, 5.00),
('a1b2c3d4-1111-4111-8111-111111111103', 'Farmatodo El Hatillo C.A.', 'Farmatodo El Hatillo', 'J-12345680-1', 'PHARMACY', 'RETAIL', 'Plaza El Hatillo, Caracas', 'Caracas', '+58212-3333333', 'hatillo@farmatodo.com', 'Lic. Ruiz', 0.05, '0102-3333-3333-3333-3333', 'USD-3333', true, true, 1.00),
('a1b2c3d4-1111-4111-8111-111111111104', 'CardioVital C.A.', 'CardioVital', 'J-12345681-2', 'CLINIC', 'CARDIOLOGY', 'Av. Francisco de Miranda, Caracas', 'Caracas', '+58212-4444444', 'info@cardiovital.com', 'Dr. Rodríguez', 0.09, '0102-4444-4444-4444-4444', 'USD-4444', true, true, 20.00),
('a1b2c3d4-1111-4111-8111-111111111105', 'CuidadoDomicilio C.A.', 'CuidadoDomicilio', 'J-12345682-3', 'ELDER_CARE', 'HOME_CARE', 'Av. Rómulo Gallegos, Caracas', 'Caracas', '+58212-5555555', 'info@cuidadodomicilio.com', 'Enf. Silva', 0.07, '0102-5555-5555-5555-5555', 'USD-5555', true, true, 15.00)
ON CONFLICT (id) DO NOTHING;

-- Activar Centro Dental Sonrisa
UPDATE merchants SET is_active = true WHERE trade_name = 'Centro Dental Sonrisa';

-- ─── Servicios médicos por comercio ──────────────────────────
-- Usa subqueries por trade_name para obtener el merchant_id

-- Clínica Santa María
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.duration_min
FROM merchants m
CROSS JOIN (VALUES
  ('Consulta Medicina General', 'Consulta con médico general, evaluación y diagnóstico', 'CONSULTATION', 'Medicina General', 25.00, 30),
  ('Consulta Cardiología', 'Evaluación cardiovascular con especialista', 'CONSULTATION', 'Cardiología', 50.00, 45),
  ('Consulta Pediatría', 'Atención pediátrica para niños y adolescentes', 'CONSULTATION', 'Pediatría', 35.00, 30),
  ('Consulta Ginecología', 'Control ginecológico y preventivo', 'CONSULTATION', 'Ginecología', 45.00, 40),
  ('Electrocardiograma', 'ECG de 12 derivaciones con interpretación', 'IMAGING', 'Cardiología', 30.00, 20),
  ('Ecografía abdominal', 'Ultrasonido abdominal completo', 'IMAGING', 'Radiología', 60.00, 30),
  ('Vacuna antitetánica', 'Aplicación de vacuna contra el tétanos', 'VACCINATION', 'Inmunización', 12.00, 15),
  ('Vacuna influenza', 'Vacuna anual contra la gripe', 'VACCINATION', 'Inmunización', 15.00, 15)
) AS v(name, description, category, subcategory, price_usd, duration_min)
WHERE m.trade_name = 'Clínica Santa María'
ON CONFLICT DO NOTHING;

-- Centro Médico La Paz
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.duration_min
FROM merchants m
CROSS JOIN (VALUES
  ('Consulta Medicina Interna', 'Evaluación de medicina interna', 'CONSULTATION', 'Medicina Interna', 30.00, 40),
  ('Consulta Dermatología', 'Evaluación de piel y anexos', 'CONSULTATION', 'Dermatología', 40.00, 30),
  ('Consulta Neurología', 'Evaluación neurológica', 'CONSULTATION', 'Neurología', 55.00, 45),
  ('Rayos X tórax', 'Radiografía de tórax PA y lateral', 'IMAGING', 'Radiología', 25.00, 15),
  ('Curación y sutura', 'Curación de heridas y sutura si necesario', 'PROCEDURE', 'Urgencias', 20.00, 30)
) AS v(name, description, category, subcategory, price_usd, duration_min)
WHERE m.trade_name = 'Centro Médico La Paz'
ON CONFLICT DO NOTHING;

-- Laboratorio BioSalud
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.duration_min
FROM merchants m
CROSS JOIN (VALUES
  ('Hemograma completo', 'Examen de sangre completo: hematíes, leucocitos, plaquetas', 'LAB_TEST', 'Hematología', 15.00, 10),
  ('Perfil lipídico', 'Colesterol total, HDL, LDL, triglicéridos', 'LAB_TEST', 'Bioquímica', 20.00, 10),
  ('Glicemia en ayunas', 'Glucosa en sangre en ayunas', 'LAB_TEST', 'Bioquímica', 10.00, 10),
  ('Examen de orina', 'Análisis completo de orina', 'LAB_TEST', 'Uroanálisis', 12.00, 10),
  ('Función hepática', 'TGO, TGP, bilirrubinas, fosfatasa alcalina', 'LAB_TEST', 'Bioquímica', 25.00, 10),
  ('Prueba de embarazo', 'Beta-hCG cuantitativa', 'LAB_TEST', 'Hormonas', 8.00, 10),
  ('Hemoglobina glicosilada', 'HbA1c para control de diabetes', 'LAB_TEST', 'Bioquímica', 18.00, 10)
) AS v(name, description, category, subcategory, price_usd, duration_min)
WHERE m.trade_name = 'Laboratorio BioSalud'
ON CONFLICT DO NOTHING;

-- Laboratorio Corposalud
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.duration_min
FROM merchants m
CROSS JOIN (VALUES
  ('Urocultivo', 'Cultivo de orina con antibiograma', 'LAB_TEST', 'Microbiología', 22.00, 10),
  ('Coprológico', 'Análisis de heces fecales', 'LAB_TEST', 'Parasitología', 10.00, 10),
  ('Perfil tiroideo', 'TSH, T3, T4 libre', 'LAB_TEST', 'Hormonas', 28.00, 10),
  ('PSA', 'Antígeno prostático específico', 'LAB_TEST', 'Bioquímica', 20.00, 10),
  ('Electroforesis de proteínas', 'Separación de proteínas séricas', 'LAB_TEST', 'Bioquímica', 35.00, 10)
) AS v(name, description, category, subcategory, price_usd, duration_min)
WHERE m.trade_name = 'Laboratorio Corposalud'
ON CONFLICT DO NOTHING;

-- Centro Dental Sonrisa
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.duration_min
FROM merchants m
CROSS JOIN (VALUES
  ('Consulta + limpieza dental', 'Consulta odontológica y profilaxis', 'DENTAL', 'Odontología General', 40.00, 60),
  ('Extracción simple', 'Extracción de pieza dental no quirúrgica', 'DENTAL', 'Cirugía Oral', 30.00, 30),
  ('Empaste (obturación)', 'Restauración con material compuesto', 'DENTAL', 'Restauradora', 35.00, 45),
  ('Blanqueamiento dental', 'Blanqueamiento profesional', 'DENTAL', 'Estética', 80.00, 90),
  ('Endodoncia', 'Tratamiento de conducto', 'DENTAL', 'Endodoncia', 120.00, 90)
) AS v(name, description, category, subcategory, price_usd, duration_min)
WHERE m.trade_name = 'Centro Dental Sonrisa'
ON CONFLICT DO NOTHING;

-- Óptica Visión Clara
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.duration_min
FROM merchants m
CROSS JOIN (VALUES
  ('Examen de la vista', 'Refracción y evaluación visual completa', 'CONSULTATION', 'Oftalmología', 15.00, 20),
  ('Montura + lentes monofocales', 'Montura básica con lentes monofocales', 'PROCEDURE', 'Óptica', 90.00, 30),
  ('Lentes de contacto (par)', 'Lentes de contacto desechables par', 'PROCEDURE', 'Óptica', 60.00, 20),
  ('Montura + lentes bifocales', 'Montura con lentes bifocales progresivos', 'PROCEDURE', 'Óptica', 130.00, 30)
) AS v(name, description, category, subcategory, price_usd, duration_min)
WHERE m.trade_name = 'Óptica Visión Clara'
ON CONFLICT DO NOTHING;

-- CardioVital
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.duration_min
FROM merchants m
CROSS JOIN (VALUES
  ('Consulta Cardiología', 'Consulta con cardiólogo especialista', 'CONSULTATION', 'Cardiología', 55.00, 45),
  ('Holter 24h', 'Monitoreo ambulatorio de ECG 24 horas', 'PROCEDURE', 'Cardiología', 80.00, 30),
  ('Prueba de esfuerzo', 'Test de esfuerzo en banda sin fin', 'PROCEDURE', 'Cardiología', 90.00, 60),
  ('Ecocardiograma', 'Ecocardiograma transtorácico con Doppler', 'IMAGING', 'Cardiología', 70.00, 30),
  ('Mapa 24h', 'Monitoreo ambulatorio de presión arterial', 'PROCEDURE', 'Cardiología', 65.00, 30)
) AS v(name, description, category, subcategory, price_usd, duration_min)
WHERE m.trade_name = 'CardioVital'
ON CONFLICT DO NOTHING;

-- CuidadoDomicilio
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.duration_min
FROM merchants m
CROSS JOIN (VALUES
  ('Visita de enfermería (4h)', 'Enfermería domiciliaria por 4 horas', 'PROCEDURE', 'Enfermería', 45.00, 240),
  ('Cuidado de adulto mayor (8h)', 'Cuidador domiciliario por 8 horas', 'PROCEDURE', 'Cuidado Mayor', 70.00, 480),
  ('Fisioterapia domiciliaria', 'Sesión de fisioterapia en casa', 'PROCEDURE', 'Rehabilitación', 40.00, 60),
  ('Administración de medicamentos', 'Aplicación de medicamentos inyectables', 'PROCEDURE', 'Enfermería', 15.00, 30)
) AS v(name, description, category, subcategory, price_usd, duration_min)
WHERE m.trade_name = 'CuidadoDomicilio'
ON CONFLICT DO NOTHING;

-- ─── Insumos médicos por farmacia ────────────────────────────

-- Farmacia Salud Total
INSERT INTO medical_supplies (merchant_id, name, description, category, subcategory, price_usd, unit, stock, requires_prescription)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.unit, v.stock, v.requires_prescription
FROM merchants m
CROSS JOIN (VALUES
  ('Losartán 50mg (caja 30)', 'Antihipertensivo', 'MEDICATION', 'Antihipertensivo', 4.50, 'caja', 200, true),
  ('Metformina 850mg (caja 60)', 'Antidiabético oral', 'MEDICATION', 'Antidiabético', 5.20, 'caja', 150, true),
  ('Atorvastatina 20mg (caja 30)', 'Hipolipemiante', 'MEDICATION', 'Estatina', 6.80, 'caja', 100, true),
  ('Ibuprofeno 400mg (caja 20)', 'Analgésico antiinflamatorio', 'MEDICATION', 'Analgésico', 2.50, 'caja', 300, false),
  ('Acetaminofén 500mg (caja 40)', 'Analgésico antipirético', 'MEDICATION', 'Analgésico', 1.80, 'caja', 500, false),
  ('Amoxicilina 500mg (caja 21)', 'Antibiótico', 'MEDICATION', 'Antibiótico', 3.50, 'caja', 200, true),
  ('Termómetro digital', 'Termómetro digital con pantalla LCD', 'DEVICE', 'Diagnóstico', 8.00, 'unidad', 50, false),
  ('Tensiómetro digital', 'Tensiómetro de brazo digital', 'DEVICE', 'Diagnóstico', 35.00, 'unidad', 30, false),
  ('Glucómetro + tiras', 'Glucómetro con 50 tiras reactivas', 'DEVICE', 'Diagnóstico', 28.00, 'kit', 40, false),
  ('Mascarillas (caja 50)', 'Mascarillas quirúrgicas desechables', 'SUPPLY', 'Protección', 3.00, 'caja', 1000, false),
  ('Guantes de látex (caja 100)', 'Guantes de exploración de látex', 'SUPPLY', 'Protección', 4.50, 'caja', 500, false),
  ('Alcohol 70% (1L)', 'Alcohol etílico al 70%', 'SUPPLY', 'Antiséptico', 2.00, 'botella', 300, false),
  ('Oxígeno portátil (recarga)', 'Recarga de cilindro de oxígeno', 'OXYGEN', 'Terapéutico', 15.00, 'recarga', 20, false),
  ('Sondas nasogástricas', 'Sonda NG para alimentación', 'SUPPLY', 'Enfermería', 5.00, 'unidad', 100, false),
  ('Vendas elásticas (par)', 'Venda elástica de soporte', 'SUPPLY', 'Enfermería', 3.50, 'par', 200, false)
) AS v(name, description, category, subcategory, price_usd, unit, stock, requires_prescription)
WHERE m.trade_name = 'Farmacia Salud Total'
ON CONFLICT DO NOTHING;

-- Farmatodo El Hatillo
INSERT INTO medical_supplies (merchant_id, name, description, category, subcategory, price_usd, unit, stock, requires_prescription)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.unit, v.stock, v.requires_prescription
FROM merchants m
CROSS JOIN (VALUES
  ('Insulina glargina (caja 5)', 'Insulina basal de acción prolongada', 'MEDICATION', 'Antidiabético', 22.00, 'caja', 80, true),
  ('Salbutamol inhalador', 'Broncodilatador para asma', 'MEDICATION', 'Broncodilatador', 9.50, 'inhalador', 120, true),
  ('Omeprazol 20mg (caja 28)', 'Inhibidor de bomba de protones', 'MEDICATION', 'Gastroprotector', 4.00, 'caja', 400, false),
  ('Loratadina 10mg (caja 10)', 'Antihistamínico', 'MEDICATION', 'Antialérgico', 2.20, 'caja', 600, false),
  ('Vitamina C 1g (caja 30)', 'Suplemento vitamínico', 'NUTRITION', 'Vitaminas', 3.50, 'caja', 500, false),
  ('Complejo B (caja 30)', 'Complejo vitamínico B', 'NUTRITION', 'Vitaminas', 4.50, 'caja', 400, false),
  ('Suero oral (1L)', 'Solución de rehidratación oral', 'SUPPLY', 'Hidratación', 2.50, 'botella', 300, false),
  ('Algodón (200g)', 'Algodón hidrófilo', 'SUPPLY', 'Curación', 1.50, 'paquete', 800, false),
  ('Nebulizador portátil', 'Nebulizador eléctrico portátil', 'DEVICE', 'Terapéutico', 42.00, 'unidad', 25, false),
  ('Pulse oxímetro', 'Oxímetro de pulso digital', 'DEVICE', 'Diagnóstico', 18.00, 'unidad', 60, false)
) AS v(name, description, category, subcategory, price_usd, unit, stock, requires_prescription)
WHERE m.trade_name = 'Farmatodo El Hatillo'
ON CONFLICT DO NOTHING;

-- Óptica Visión Clara — insumos
INSERT INTO medical_supplies (merchant_id, name, description, category, subcategory, price_usd, unit, stock, requires_prescription)
SELECT m.id, v.name, v.description, v.category, v.subcategory, v.price_usd, v.unit, v.stock, v.requires_prescription
FROM merchants m
CROSS JOIN (VALUES
  ('Solución para lentes de contacto (120ml)', 'Solución multipropósito', 'PERSONAL_CARE', 'Lentes', 5.50, 'botella', 150, false),
  ('Estuche para lentes', 'Estuche protector para lentes de contacto', 'PERSONAL_CARE', 'Lentes', 2.00, 'unidad', 300, false),
  ('Paños de microfibra (pack 3)', 'Para limpieza de lentes y monturas', 'PERSONAL_CARE', 'Lentes', 3.00, 'pack', 200, false)
) AS v(name, description, category, subcategory, price_usd, unit, stock, requires_prescription)
WHERE m.trade_name = 'Óptica Visión Clara'
ON CONFLICT DO NOTHING;

-- ─── Usuario comerciante de prueba ───────────────────────────
-- Password: admin123 (mismo hash que el admin)
INSERT INTO users (phone, email, password_hash, full_name, national_id, role, level, is_active)
VALUES (
    '+584149998877',
    'merchant@saludtech.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjqdkePBu2Vh05NntMO6tBODZlR0S.',
    'Carlos Mendoza',
    'V-12345678',
    'MERCHANT',
    1,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Vincular usuario comerciante a Clínica Santa María
INSERT INTO merchant_users (merchant_id, user_id, is_owner)
SELECT m.id, u.id, TRUE
FROM merchants m, users u
WHERE m.trade_name = 'Clínica Santa María'
  AND u.email = 'merchant@saludtech.com'
ON CONFLICT (merchant_id, user_id) DO NOTHING;
