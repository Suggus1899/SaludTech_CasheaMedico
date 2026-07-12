-- ============================================================
-- Seed: Comercios, catálogo médico, y usuarios de prueba
-- Ejecutar después de V11
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

-- Clínica Santa María (existente: 7d0eb707-8886-461a-b0d9-48d5d9ebf968)
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min) VALUES
('7d0eb707-8886-461a-b0d9-48d5d9ebf968', 'Consulta Medicina General', 'Consulta con médico general, evaluación y diagnóstico', 'CONSULTATION', 'Medicina General', 25.00, 30),
('7d0eb707-8886-461a-b0d9-48d5d9ebf968', 'Consulta Cardiología', 'Evaluación cardiovascular con especialista', 'CONSULTATION', 'Cardiología', 50.00, 45),
('7d0eb707-8886-461a-b0d9-48d5d9ebf968', 'Consulta Pediatría', 'Atención pediátrica para niños y adolescentes', 'CONSULTATION', 'Pediatría', 35.00, 30),
('7d0eb707-8886-461a-b0d9-48d5d9ebf968', 'Consulta Ginecología', 'Control ginecológico y preventivo', 'CONSULTATION', 'Ginecología', 45.00, 40),
('7d0eb707-8886-461a-b0d9-48d5d9ebf968', 'Electrocardiograma', 'ECG de 12 derivaciones con interpretación', 'IMAGING', 'Cardiología', 30.00, 20),
('7d0eb707-8886-461a-b0d9-48d5d9ebf968', 'Ecografía abdominal', 'Ultrasonido abdominal completo', 'IMAGING', 'Radiología', 60.00, 30),
('7d0eb707-8886-461a-b0d9-48d5d9ebf968', 'Vacuna antitetánica', 'Aplicación de vacuna contra el tétanos', 'VACCINATION', 'Inmunización', 12.00, 15),
('7d0eb707-8886-461a-b0d9-48d5d9ebf968', 'Vacuna influenza', 'Vacuna anual contra la gripe', 'VACCINATION', 'Inmunización', 15.00, 15);

-- Centro Médico La Paz
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min) VALUES
('a1b2c3d4-1111-4111-8111-111111111101', 'Consulta Medicina Interna', 'Evaluación de medicina interna', 'CONSULTATION', 'Medicina Interna', 30.00, 40),
('a1b2c3d4-1111-4111-8111-111111111101', 'Consulta Dermatología', 'Evaluación de piel y anexos', 'CONSULTATION', 'Dermatología', 40.00, 30),
('a1b2c3d4-1111-4111-8111-111111111101', 'Consulta Neurología', 'Evaluación neurológica', 'CONSULTATION', 'Neurología', 55.00, 45),
('a1b2c3d4-1111-4111-8111-111111111101', 'Rayos X tórax', 'Radiografía de tórax PA y lateral', 'IMAGING', 'Radiología', 25.00, 15),
('a1b2c3d4-1111-4111-8111-111111111101', 'Curación y sutura', 'Curación de heridas y sutura si necesario', 'PROCEDURE', 'Urgencias', 20.00, 30);

-- Laboratorio BioSalud (existente: 75271d33-57b5-4c8b-b2a6-97092fa1d403)
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min) VALUES
('75271d33-57b5-4c8b-b2a6-97092fa1d403', 'Hemograma completo', 'Examen de sangre completo: hematíes, leucocitos, plaquetas', 'LAB_TEST', 'Hematología', 15.00, 10),
('75271d33-57b5-4c8b-b2a6-97092fa1d403', 'Perfil lipídico', 'Colesterol total, HDL, LDL, triglicéridos', 'LAB_TEST', 'Bioquímica', 20.00, 10),
('75271d33-57b5-4c8b-b2a6-97092fa1d403', 'Glicemia en ayunas', 'Glucosa en sangre en ayunas', 'LAB_TEST', 'Bioquímica', 10.00, 10),
('75271d33-57b5-4c8b-b2a6-97092fa1d403', 'Examen de orina', 'Análisis completo de orina', 'LAB_TEST', 'Uroanálisis', 12.00, 10),
('75271d33-57b5-4c8b-b2a6-97092fa1d403', 'Función hepática', 'TGO, TGP, bilirrubinas, fosfatasa alcalina', 'LAB_TEST', 'Bioquímica', 25.00, 10),
('75271d33-57b5-4c8b-b2a6-97092fa1d403', 'Prueba de embarazo', 'Beta-hCG cuantitativa', 'LAB_TEST', 'Hormonas', 8.00, 10),
('75271d33-57b5-4c8b-b2a6-97092fa1d403', 'Hemoglobina glicosilada', 'HbA1c para control de diabetes', 'LAB_TEST', 'Bioquímica', 18.00, 10);

-- Laboratorio Corposalud
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min) VALUES
('a1b2c3d4-1111-4111-8111-111111111102', 'Urocultivo', 'Cultivo de orina con antibiograma', 'LAB_TEST', 'Microbiología', 22.00, 10),
('a1b2c3d4-1111-4111-8111-111111111102', 'Coprológico', 'Análisis de heces fecales', 'LAB_TEST', 'Parasitología', 10.00, 10),
('a1b2c3d4-1111-4111-8111-111111111102', 'Perfil tiroideo', 'TSH, T3, T4 libre', 'LAB_TEST', 'Hormonas', 28.00, 10),
('a1b2c3d4-1111-4111-8111-111111111102', 'PSA', 'Antígeno prostático específico', 'LAB_TEST', 'Bioquímica', 20.00, 10),
('a1b2c3d4-1111-4111-8111-111111111102', 'Electroforesis de proteínas', 'Separación de proteínas séricas', 'LAB_TEST', 'Bioquímica', 35.00, 10);

-- Centro Dental Sonrisa (existente: 98edcbb5-1727-4c3e-b8b7-2e3cac1e0eb5)
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min) VALUES
('98edcbb5-1727-4c3e-b8b7-2e3cac1e0eb5', 'Consulta + limpieza dental', 'Consulta odontológica y profilaxis', 'DENTAL', 'Odontología General', 40.00, 60),
('98edcbb5-1727-4c3e-b8b7-2e3cac1e0eb5', 'Extracción simple', 'Extracción de pieza dental no quirúrgica', 'DENTAL', 'Cirugía Oral', 30.00, 30),
('98edcbb5-1727-4c3e-b8b7-2e3cac1e0eb5', 'Empaste (obturación)', 'Restauración con material compuesto', 'DENTAL', 'Restauradora', 35.00, 45),
('98edcbb5-1727-4c3e-b8b7-2e3cac1e0eb5', 'Blanqueamiento dental', 'Blanqueamiento profesional', 'DENTAL', 'Estética', 80.00, 90),
('98edcbb5-1727-4c3e-b8b7-2e3cac1e0eb5', 'Endodoncia', 'Tratamiento de conducto', 'DENTAL', 'Endodoncia', 120.00, 90);

-- Óptica Visión Clara (existente: 936e2d34-7616-4d9c-bae4-644594e396de)
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min) VALUES
('936e2d34-7616-4d9c-bae4-644594e396de', 'Examen de la vista', 'Refracción y evaluación visual completa', 'CONSULTATION', 'Oftalmología', 15.00, 20),
('936e2d34-7616-4d9c-bae4-644594e396de', 'Montura + lentes monofocales', 'Montura básica con lentes monofocales', 'PROCEDURE', 'Óptica', 90.00, 30),
('936e2d34-7616-4d9c-bae4-644594e396de', 'Lentes de contacto (par)', 'Lentes de contacto desechables par', 'PROCEDURE', 'Óptica', 60.00, 20),
('936e2d34-7616-4d9c-bae4-644594e396de', 'Montura + lentes bifocales', 'Montura con lentes bifocales progresivos', 'PROCEDURE', 'Óptica', 130.00, 30);

-- CardioVital
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min) VALUES
('a1b2c3d4-1111-4111-8111-111111111104', 'Consulta Cardiología', 'Consulta con cardiólogo especialista', 'CONSULTATION', 'Cardiología', 55.00, 45),
('a1b2c3d4-1111-4111-8111-111111111104', 'Holter 24h', 'Monitoreo ambulatorio de ECG 24 horas', 'PROCEDURE', 'Cardiología', 80.00, 30),
('a1b2c3d4-1111-4111-8111-111111111104', 'Prueba de esfuerzo', 'Test de esfuerzo en banda sin fin', 'PROCEDURE', 'Cardiología', 90.00, 60),
('a1b2c3d4-1111-4111-8111-111111111104', 'Ecocardiograma', 'Ecocardiograma transtorácico con Doppler', 'IMAGING', 'Cardiología', 70.00, 30),
('a1b2c3d4-1111-4111-8111-111111111104', 'Mapa 24h', 'Monitoreo ambulatorio de presión arterial', 'PROCEDURE', 'Cardiología', 65.00, 30);

-- CuidadoDomicilio
INSERT INTO medical_services (merchant_id, name, description, category, subcategory, price_usd, duration_min) VALUES
('a1b2c3d4-1111-4111-8111-111111111105', 'Visita de enfermería (4h)', 'Enfermería domiciliaria por 4 horas', 'PROCEDURE', 'Enfermería', 45.00, 240),
('a1b2c3d4-1111-4111-8111-111111111105', 'Cuidado de adulto mayor (8h)', 'Cuidador domiciliario por 8 horas', 'PROCEDURE', 'Cuidado Mayor', 70.00, 480),
('a1b2c3d4-1111-4111-8111-111111111105', 'Fisioterapia domiciliaria', 'Sesión de fisioterapia en casa', 'PROCEDURE', 'Rehabilitación', 40.00, 60),
('a1b2c3d4-1111-4111-8111-111111111105', 'Administración de medicamentos', 'Aplicación de medicamentos inyectables', 'PROCEDURE', 'Enfermería', 15.00, 30);

-- ─── Insumos médicos por farmacia ────────────────────────────

-- Farmacia Salud Total (existente: 4b050d7d-9b09-4302-bbc4-eec99dba0795)
INSERT INTO medical_supplies (merchant_id, name, description, category, subcategory, price_usd, unit, stock, requires_prescription) VALUES
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Losartán 50mg (caja 30)', 'Antihipertensivo', 'MEDICATION', 'Antihipertensivo', 4.50, 'caja', 200, true),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Metformina 850mg (caja 60)', 'Antidiabético oral', 'MEDICATION', 'Antidiabético', 5.20, 'caja', 150, true),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Atorvastatina 20mg (caja 30)', 'Hipolipemiante', 'MEDICATION', 'Estatina', 6.80, 'caja', 100, true),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Ibuprofeno 400mg (caja 20)', 'Analgésico antiinflamatorio', 'MEDICATION', 'Analgésico', 2.50, 'caja', 300, false),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Acetaminofén 500mg (caja 40)', 'Analgésico antipirético', 'MEDICATION', 'Analgésico', 1.80, 'caja', 500, false),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Amoxicilina 500mg (caja 21)', 'Antibiótico', 'MEDICATION', 'Antibiótico', 3.50, 'caja', 200, true),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Termómetro digital', 'Termómetro digital con pantalla LCD', 'DEVICE', 'Diagnóstico', 8.00, 'unidad', 50, false),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Tensiómetro digital', 'Tensiómetro de brazo digital', 'DEVICE', 'Diagnóstico', 35.00, 'unidad', 30, false),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Glucómetro + tiras', 'Glucómetro con 50 tiras reactivas', 'DEVICE', 'Diagnóstico', 28.00, 'kit', 40, false),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Mascarillas (caja 50)', 'Mascarillas quirúrgicas desechables', 'SUPPLY', 'Protección', 3.00, 'caja', 1000, false),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Guantes de látex (caja 100)', 'Guantes de exploración de látex', 'SUPPLY', 'Protección', 4.50, 'caja', 500, false),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Alcohol 70% (1L)', 'Alcohol etílico al 70%', 'SUPPLY', 'Antiséptico', 2.00, 'botella', 300, false),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Oxígeno portátil (recarga)', 'Recarga de cilindro de oxígeno', 'OXYGEN', 'Terapéutico', 15.00, 'recarga', 20, false),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Sondas nasogástricas', 'Sonda NG para alimentación', 'SUPPLY', 'Enfermería', 5.00, 'unidad', 100, false),
('4b050d7d-9b09-4302-bbc4-eec99dba0795', 'Vendas elásticas (par)', 'Venda elástica de soporte', 'SUPPLY', 'Enfermería', 3.50, 'par', 200, false);

-- Farmatodo El Hatillo
INSERT INTO medical_supplies (merchant_id, name, description, category, subcategory, price_usd, unit, stock, requires_prescription) VALUES
('a1b2c3d4-1111-4111-8111-111111111103', 'Insulina glargina (caja 5)', 'Insulina basal de acción prolongada', 'MEDICATION', 'Antidiabético', 22.00, 'caja', 80, true),
('a1b2c3d4-1111-4111-8111-111111111103', 'Salbutamol inhalador', 'Broncodilatador para asma', 'MEDICATION', 'Broncodilatador', 9.50, 'inhalador', 120, true),
('a1b2c3d4-1111-4111-8111-111111111103', 'Omeprazol 20mg (caja 28)', 'Inhibidor de bomba de protones', 'MEDICATION', 'Gastroprotector', 4.00, 'caja', 400, false),
('a1b2c3d4-1111-4111-8111-111111111103', 'Loratadina 10mg (caja 10)', 'Antihistamínico', 'MEDICATION', 'Antialérgico', 2.20, 'caja', 600, false),
('a1b2c3d4-1111-4111-8111-111111111103', 'Vitamina C 1g (caja 30)', 'Suplemento vitamínico', 'NUTRITION', 'Vitaminas', 3.50, 'caja', 500, false),
('a1b2c3d4-1111-4111-8111-111111111103', 'Complejo B (caja 30)', 'Complejo vitamínico B', 'NUTRITION', 'Vitaminas', 4.50, 'caja', 400, false),
('a1b2c3d4-1111-4111-8111-111111111103', 'Suero oral (1L)', 'Solución de rehidratación oral', 'SUPPLY', 'Hidratación', 2.50, 'botella', 300, false),
('a1b2c3d4-1111-4111-8111-111111111103', 'Algodón (200g)', 'Algodón hidrófilo', 'SUPPLY', 'Curación', 1.50, 'paquete', 800, false),
('a1b2c3d4-1111-4111-8111-111111111103', 'Nebulizador portátil', 'Nebulizador eléctrico portátil', 'DEVICE', 'Terapéutico', 42.00, 'unidad', 25, false),
('a1b2c3d4-1111-4111-8111-111111111103', 'Pulse oxímetro', 'Oxímetro de pulso digital', 'DEVICE', 'Diagnóstico', 18.00, 'unidad', 60, false);

-- Óptica Visión Clara — algunos insumos
INSERT INTO medical_supplies (merchant_id, name, description, category, subcategory, price_usd, unit, stock, requires_prescription) VALUES
('936e2d34-7616-4d9c-bae4-644594e396de', 'Solución para lentes de contacto (120ml)', 'Solución multipropósito', 'PERSONAL_CARE', 'Lentes', 5.50, 'botella', 150, false),
('936e2d34-7616-4d9c-bae4-644594e396de', 'Estuche para lentes', 'Estuche protector para lentes de contacto', 'PERSONAL_CARE', 'Lentes', 2.00, 'unidad', 300, false),
('936e2d34-7616-4d9c-bae4-644594e396de', 'Paños de microfibra (pack 3)', 'Para limpieza de lentes y monturas', 'PERSONAL_CARE', 'Lentes', 3.00, 'pack', 200, false);

-- ─── Usuarios de prueba (15 pacientes) ───────────────────────
-- Password para todos: 12345678 (hash pre-calculado con bcrypt)
-- El hash se generará dinámicamente en el script de Go

-- Nota: Los usuarios se crean via API register para que se generen
-- las credit lines automáticamente. Ver seed_users.go
