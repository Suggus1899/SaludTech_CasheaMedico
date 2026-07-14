# SaludTech CasheaMedico — Manual de Usuario

**Versión:** 1.0  
**Fecha:** Julio 2026  
**Plataforma:** BNPL HealthTech — Salud financiada a tu alcance

---

## Índice

1. [Introducción](#1-introducción)
2. [Roles de usuario](#2-roles-de-usuario)
3. [App Paciente (web-patient)](#3-app-paciente-web-patient)
4. [App Admin (web-admin)](#4-app-admin-web-admin)
5. [App Comerciante (web-merchant)](#5-app-comerciante-web-merchant)
6. [Preguntas frecuentes](#6-preguntas-frecuentes)

---

## 1. Introducción

SaludTech CasheaMedico es una plataforma de salud fintech que permite a los pacientes financiar gastos médicos en cuotas con 0% de interés. La plataforma conecta pacientes con farmacias, clínicas, laboratorios y especialistas, facilitando el acceso a la salud mediante un sistema de crédito flexible.

### Características principales

- **BNPL (Buy Now, Pay Later) en salud:** Paga servicios médicos en cuotas cada 14 días
- **0% de interés:** Sin letras ocultas ni sorpresas
- **Aprobación en 3 minutos:** Registro 100% digital
- **Red de comercios:** +127 farmacias, clínicas, laboratorios y especialistas
- **Triaje médico:** Consultas de triaje respondidas por el equipo médico
- **Cuidado mayor:** Suscripciones para cuidado de adultos mayores
- **Recordatorios de medicación:** Alertas para no olvidar tus medicamentos
- **Perfil de salud:** Historial médico, alergias, tipo de sangre, contactos de emergencia
- **Pagos con QR:** Escanea y paga al instante
- **Gamificación:** Gana puntos y sube de nivel por pagar a tiempo

---

## 2. Roles de usuario

| Rol | App | Descripción |
|------|-----|-------------|
| **PACIENTE** | web-patient | Pacientes que financian gastos médicos |
| **COMERCIANTE** | web-merchant | Farmacias, clínicas, laboratorios que reciben pagos |
| **ADMIN** | web-admin | Administradores de la plataforma |

---

## 3. App Paciente (web-patient)

### 3.1 Registro de cuenta

1. Acceder a la app paciente
2. Hacer clic en **"Crear cuenta gratis"**
3. Completar el formulario:
   - **Nombre** (mínimo 2 caracteres)
   - **Apellido** (mínimo 2 caracteres)
   - **Correo electrónico** (formato válido)
   - **Teléfono** (formato venezolano: `+584XXXXXXXXX` o `04XXXXXXXXX`)
   - **Cédula** (formato: `V12345678` o `12345678`)
   - **Contraseña** (mínimo 8 caracteres, debe incluir: 1 mayúscula, 1 minúscula, 1 número)
   - **Confirmar contraseña**
4. Hacer clic en **"Crear Cuenta"**

> Al registrarse, se crean automáticamente 3 líneas de crédito:
> - Especialidad Principal: $500
> - Salud Cotidiana: $200
> - Mayor Cuidado: $0 (se activa al suscribirse)

### 3.2 Verificación de email

1. Después del registro, recibirás un correo de verificación
2. Hacer clic en el enlace **"Verificar mi correo"**
3. El enlace expira en 24 horas
4. Al verificar, recibirás un correo de bienvenida

### 3.3 Inicio de sesión

1. Acceder a la app paciente
2. Ingresar correo electrónico y contraseña
3. Hacer clic en **"Iniciar Sesión"**

### 3.4 Dashboard

El dashboard muestra:
- **Líneas de crédito disponibles** (Especialidad Principal, Salud Cotidiana, Mayor Cuidado)
- **Cuotas pendientes** y próximas a vencer
- **Saldo total** y montos pagados
- **Nivel y puntos** (gamificación)
- **Accesos rápidos** a las principales funciones

### 3.5 Cuotas y pagos

#### Ver cuotas

1. Ir a **"Cuotas"** desde el menú
2. Se muestran todas las cuotas con su estado:
   - **PENDIENTE** — Cuota por vencer
   - **PAGADA** — Cuota pagada a tiempo
   - **VENCIDA** — Cuota vencida (crédito pausado)

#### Pagar una cuota

1. Ir a **"Cuotas"**
2. Seleccionar la cuota pendiente
3. Hacer clic en **"Pagar ahora"**
4. Confirmar el pago
5. Recibirás un correo de confirmación

#### Cuotas vencidas

- Si una cuota vence sin pago, se aplica un **cargo de reactivación de $4**
- Tu línea de crédito se **pausa** automáticamente
- Recibirás un correo de notificación de mora
- Para reactivar: paga el monto pendiente + cargo de reactivación
- Al reactivar, recibirás un correo de confirmación

### 3.6 Directorio de comercios

1. Ir a **"Comercios"** desde el menú
2. Explorar farmacias, clínicas, laboratorios y especialistas
3. Filtrar por categoría:
   - CLINIC — Clínicas
   - PHARMACY — Farmacias
   - OPTICS — Ópticas
   - DENTAL — Odontología
   - LABORATORY — Laboratorios
   - AESTHETIC — Estética
   - MEDICAL_SUPPLIES — Insumos médicos
   - WELLNESS — Bienestar
4. Hacer clic en un comercio para ver detalles y servicios

### 3.7 Catálogo médico

1. Ir a **"Catálogo"** desde el menú
2. Explorar servicios médicos disponibles
3. Ver precios, duración estimada y descripción
4. Filtrar por categoría o subcategoría

### 3.8 Triaje médico

#### Enviar consulta

1. Ir a **"Triaje"** desde el menú
2. Describir tus síntomas o consulta médica
3. Enviar la consulta
4. El equipo médico revisará y responderá

#### Ver respuesta

1. Ir a **"Triaje"**
2. Ver el estado de tus consultas:
   - **PENDING** — En revisión
   - **RESOLVED** — Resuelto
   - **REFERRED** — Referido a especialista
   - **COMPLETED** — Completado
3. Recibirás un correo con la respuesta del equipo médico

### 3.9 Perfil de salud

1. Ir a **"Salud"** desde el menú
2. Completar tu perfil médico:
   - Tipo de sangre
   - Alergias
   - Medicamentos actuales
   - Condiciones médicas
   - Contacto de emergencia (nombre y teléfono)
3. Esta información personaliza tu experiencia y recomendaciones

### 3.10 Citas médicas

1. Ir a **"Citas"** desde el menú
2. Ver citas próximas y pasadas
3. Agendar nueva cita seleccionando servicio y fecha

### 3.11 Suscripciones

1. Ir a **"Suscripciones"** desde el menú
2. Ver suscripciones activas
3. Crear nueva suscripción a servicios de salud

### 3.12 Cuidado mayor

1. Ir a **"Cuidado Mayor"** desde el menú
2. Gestionar suscripciones para cuidado de adultos mayores
3. Agregar miembros familiares que requieren cuidado

### 3.13 Familiares

1. Ir a **"Familia"** desde el menú
2. Agregar familiares con su relación (padre, madre, hijo, etc.)
3. Gestionar el cuidado de salud familiar

### 3.14 Recordatorios de medicación

1. Ir a **"Recordatorios"** desde el menú
2. Crear recordatorios de medicación:
   - Nombre del medicamento
   - Dosis
   - Frecuencia
3. Recibir alertas para no olvidar tus medicamentos

### 3.15 Historial médico

1. Ir a **"Historial"** desde el menú
2. Ver registros médicos:
   - Diagnósticos
   - Prescripciones
   - Médico tratante
   - Fecha

### 3.16 Perfil y configuración

1. Ir a **"Perfil"** desde el menú
2. Ver y editar datos personales
3. Ir a **"Configuración"** para:
   - Cambiar contraseña
   - Cerrar sesión

### 3.17 Pagos con QR

1. Ir a **"Pagar"** desde el menú
2. Escanear el código QR del comercio
3. Confirmar el monto y el servicio
4. El pago se procesa y se divide en cuotas automáticamente

---

## 4. App Admin (web-admin)

### 4.1 Inicio de sesión

1. Acceder a la app admin
2. Ingresar correo y contraseña de administrador
3. Solo usuarios con rol **ADMIN** pueden acceder

### 4.2 Dashboard global

Muestra métricas de toda la plataforma:
- Total de pacientes activos
- Total de comercios activos
- Monto financiado total
- Cuotas pendientes vs pagadas
- Triajes pendientes
- Suscripciones activas

### 4.3 Gestión de pacientes

1. Ir a **"Pacientes"** desde el sidebar
2. Ver lista de todos los pacientes
3. Acciones disponibles:
   - **Activar/Desactivar** cuenta de paciente
   - Ver detalles del paciente
   - El paciente recibe un correo al activar/desactivar su cuenta

### 4.4 Gestión de comercios

1. Ir a **"Comercios"** desde el sidebar
2. Ver lista de todos los comercios
3. Acciones disponibles:
   - **Activar/Desactivar** comercio
   - Ver detalles del comercio
   - El comercio recibe un correo al activar/desactivar

### 4.5 Gestión de financiamientos

1. Ir a **"Financiamientos"** desde el sidebar
2. Ver todos los financiamientos activos
3. Monitorear:
   - Montos financiados
   - Cuotas pendientes
   - Cuotas vencidas
   - Estado de cada financiamiento

### 4.6 Gestión de triajes

1. Ir a **"Triajes"** desde el sidebar
2. Ver triajes pendientes de revisión
3. Responder triajes:
   - Marcar como **RESOLVED** (resuelto)
   - Marcar como **REFERRED** (referido a especialista)
   - Marcar como **COMPLETED** (completado)
   - Agregar recomendación médica
4. El paciente recibe un correo con la respuesta

### 4.7 Gestión de suscripciones

1. Ir a **"Suscripciones"** desde el sidebar
2. Ver todas las suscripciones de la plataforma
3. Monitorear estado y fechas de facturación

### 4.8 Cuidado mayor (admin)

1. Ir a **"Elder Care"** desde el sidebar
2. Ver suscripciones de cuidado mayor
3. Monitorear pacientes con cuidado de adultos mayores

### 4.9 Exportar datos

1. En las listas de pacientes, comercios, etc.
2. Hacer clic en **"Exportar"**
3. Se descarga un archivo CSV con los datos

---

## 5. App Comerciante (web-merchant)

### 5.1 Inicio de sesión

1. Acceder a la app comerciante
2. Ingresar correo y contraseña
3. Solo usuarios con rol **MERCHANT** o **ADMIN** pueden acceder

### 5.2 Dashboard del comerciante

Muestra:
- Transacciones recientes
- Monto total procesado
- Servicios activos
- Insumos disponibles

### 5.3 Gestión de servicios

1. Ir a **"Servicios"** desde el sidebar
2. Ver, crear y editar servicios médicos ofrecidos
3. Cada servicio incluye:
   - Nombre
   - Descripción
   - Precio
   - Duración estimada
   - Categoría

### 5.4 Gestión de insumos

1. Ir a **"Insumos"** desde el sidebar
2. Ver, crear y editar insumos médicos
3. Gestionar inventario

### 5.5 Historial de transacciones

1. Ir a **"Historial"** desde el sidebar
2. Ver todas las transacciones recibidas
3. Filtrar por fecha, paciente o servicio

### 5.6 Liquidaciones

1. Ir a **"Liquidaciones"** desde el sidebar
2. Ver liquidaciones de pagos recibidos
3. Monitorear montos a liquidar

### 5.7 Suscripciones de cuidado mayor

1. Ir a **"Suscripciones EC"** desde el sidebar
2. Gestionar suscripciones de cuidado mayor de tus pacientes

### 5.8 Perfil del comercio

1. Ir a **"Perfil"** desde el sidebar
2. Ver y editar datos del comercio:
   - Nombre legal
   - Dirección
   - Ciudad
   - Teléfono
   - Contacto

### 5.9 Checkout (pago con QR)

1. Ir a **"Checkout"**
2. Generar código QR para el paciente
3. El paciente escanea y paga
4. La transacción se registra automáticamente

---

## 6. Preguntas frecuentes

### ¿Cuánto cuesta usar SaludTech?

SaludTech es **0% de interés** para el paciente. Solo se aplica un cargo de reactivación de $4 si una cuota vence sin pago.

### ¿Cada cuánto pago las cuotas?

Las cuotas son cada **14 días** (configurable).

### ¿Qué pasa si no pago a tiempo?

1. Tu cuota pasa a estado **VENCIDA**
2. Se aplica un **cargo de reactivación de $4**
3. Tu línea de crédito se **pausa**
4. No puedes realizar nuevas transacciones hasta regularizar
5. Para reactivar: paga el monto pendiente + cargo de reactivación

### ¿Cuánto crédito tengo disponible?

Al registrarte, recibes:
- **Especialidad Principal:** $500
- **Salud Cotidiana:** $200
- **Mayor Cuidado:** $0 (se activa al suscribirse)

Puedes ver tu crédito disponible en el dashboard.

### ¿Cómo verifico mi correo?

Después del registro, recibes un correo con un enlace de verificación. Haz clic en el enlace para verificar. El enlace expira en 24 horas.

### ¿Puedo agregar a mi familia?

Sí. Ve a **"Familia"** y agrega familiares con su relación. Para cuidado de adultos mayores, ve a **"Cuidado Mayor"** y crea una suscripción.

### ¿Cómo contacto al equipo médico?

Ve a **"Triaje"** y envía una consulta. El equipo médico la revisará y responderá. Recibirás la respuesta por correo electrónico.

### ¿Mis datos están seguros?

Sí. Tus datos están protegidos y se usan únicamente para verificar tu identidad. La plataforma utiliza:
- Encriptación JWT para autenticación
- Cookies httpOnly para sesiones
- Headers de seguridad (CSP, X-Frame-Options, etc.)
- Validación de inputs en frontend y backend
- Rate limiting para prevenir ataques
