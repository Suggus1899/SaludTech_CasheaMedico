-- ============================================================
-- SaludTech BNPL HealthTech Platform - Seed Data
-- V2: Initial admin user and sample data
-- ============================================================

-- Admin user
-- Password: admin123 (BCrypt hash)
INSERT INTO users (id, phone, email, password_hash, full_name, national_id, role, kyc_status, level, is_active)
VALUES (
    gen_random_uuid(),
    '+584121234567',
    'admin@saludtech.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjqdkePBu2Vh05NntMO6tBODZlR0S.',
    'SaludTech Admin',
    'V-00000001',
    'ADMIN',
    'APPROVED',
    1,
    TRUE
);

-- Sample merchants with different categories
INSERT INTO merchants (id, legal_name, trade_name, rif, category, address, city, phone, email, contact_name, is_active)
VALUES
    (gen_random_uuid(), 'Clínica Santa María C.A.', 'Clínica Santa María', 'J-12345678-0', 'CLINIC',
     'Av. Principal, Edificio Médico, Piso 3', 'Caracas', '+582121234567', 'clinica.santamaria@example.com',
     'Dr. Carlos Mendoza', TRUE),

    (gen_random_uuid(), 'Farmacia Salud Total C.A.', 'Farmacia Salud Total', 'J-23456789-0', 'PHARMACY',
     'Centro Comercial Plaza, Local 15', 'Valencia', '+582414567890', 'farmacia.saludtotal@example.com',
     'María González', TRUE),

    (gen_random_uuid(), 'Óptica Visión Clara C.A.', 'Óptica Visión Clara', 'J-34567890-0', 'OPTICS',
     'Av. Bolívar, Centro Comercial Los Andes', 'Maracaibo', '+582617890123', 'optica.visionclara@example.com',
     'Ana Rodríguez', TRUE),

    (gen_random_uuid(), 'Centro Dental Sonrisa C.A.', 'Centro Dental Sonrisa', 'J-45678901-0', 'DENTAL',
     'Calle 50, Edificio Dental Plus', 'Barquisimeto', '+582512345678', 'dental.sonrisa@example.com',
     'Dr. Pedro Martínez', FALSE),

    (gen_random_uuid(), 'Laboratorio BioSalud C.A.', 'Laboratorio BioSalud', 'J-56789012-0', 'LABORATORY',
     'Av. Las Ciencias, Torre Médica', 'Caracas', '+582129876543', 'lab.biosalud@example.com',
     'Lic. Laura Pérez', TRUE);
