package email

import "fmt"

// ─── Email templates ────────────────────────────────────────────────────────
//
// All templates share the same SaludTech visual identity:
//   - Blue header with logo
//   - Clean body with the message
//   - CTA button linking to the patient app
//   - Footer with legal note
//
// Each template is a function that returns HTML string.

const patientAppURL = "https://salud-tech-cashea-medico-web-patien.vercel.app"

// sharedWrapper wraps content in the standard SaludTech email layout.
func sharedWrapper(title, bodyContent string) string {
	return fmt.Sprintf(`
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <div style="background: #3b82f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: white; margin: 0; font-size: 22px;">SaludTech</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">%s</p>
  </div>
  %s
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
  <p style="color: #94a3b8; font-size: 12px;">
    SaludTech — Salud financiada a tu alcance.<br>
    Si crees que esto es un error, ignora este correo.
  </p>
</div>
`, title, bodyContent)
}

// ─── 1. Payment Reminder (upcoming due date) ────────────────────────────────

func PaymentReminderEmail(userName string, amount float64, dueDate, installmentNum string) string {
	body := fmt.Sprintf(`
  <h2 style="color: #1e293b; font-size: 18px;">Hola %s,</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6;">
    Te recordamos que tu <strong>cuota #%s</strong> vence el <strong>%s</strong>.
  </p>
  <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #64748b; font-size: 13px;">Monto a pagar</p>
    <p style="margin: 4px 0 0; color: #1e293b; font-size: 28px; font-weight: bold;">$%.2f</p>
  </div>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Puedes realizar tu pago desde la app de SaludTech. Evita la suspension de tu linea de credito pagando a tiempo.
  </p>
  <a href="%s/dashboard/cuotas"
     style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
    Pagar ahora
  </a>
`, userName, installmentNum, dueDate, amount, patientAppURL)
	return sharedWrapper("Recordatorio de pago", body)
}

// ─── 2. Payment Confirmation ────────────────────────────────────────────────

func PaymentConfirmationEmail(userName string, amount float64, installmentNum, paidAt string) string {
	body := fmt.Sprintf(`
  <h2 style="color: #1e293b; font-size: 18px;">Hola %s,</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6;">
    Hemos recibido tu pago correctamente. ¡Gracias por mantener tu cuenta al dia!
  </p>
  <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #065f46; font-size: 13px;">Pago confirmado</p>
    <p style="margin: 4px 0 0; color: #1e293b; font-size: 28px; font-weight: bold;">$%.2f</p>
    <p style="margin: 8px 0 0; color: #64748b; font-size: 13px;">Cuota #%s &middot; Procesado el %s</p>
  </div>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Puedes ver el estado de tus cuotas en cualquier momento desde la app.
  </p>
  <a href="%s/dashboard/cuotas"
     style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
    Ver mis cuotas
  </a>
`, userName, amount, installmentNum, paidAt, patientAppURL)
	return sharedWrapper("Pago confirmado", body)
}

// ─── 3. Overdue Notice (installment overdue + credit paused) ────────────────

func OverdueNoticeEmail(userName string, amount float64, installmentNum, dueDate string, reactivationFee float64) string {
	body := fmt.Sprintf(`
  <h2 style="color: #1e293b; font-size: 18px;">Hola %s,</h2>
  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #991b1b; font-size: 15px; font-weight: 600;">
      Tu cuota #%s ha vencido
    </p>
    <p style="margin: 8px 0 0; color: #475569; font-size: 14px;">
      Vencio el %s. Monto pendiente: <strong>$%.2f</strong>
    </p>
  </div>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Tu linea de credito ha sido <strong>pausada</strong> hasta que regularices el pago.
    Se ha aplicado un cargo de reactivacion de <strong>$%.2f</strong>.
  </p>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Para reactivar tu credito, paga el monto pendiente mas el cargo de reactivacion.
  </p>
  <a href="%s/dashboard/cuotas"
     style="display: inline-block; background: #ef4444; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
    Regularizar pago
  </a>
`, userName, installmentNum, dueDate, amount, reactivationFee, patientAppURL)
	return sharedWrapper("Cuota vencida", body)
}

// ─── 4. Credit Reactivation (lines restored after paying overdue) ───────────

func CreditReactivationEmail(userName string) string {
	body := fmt.Sprintf(`
  <h2 style="color: #1e293b; font-size: 18px;">Hola %s,</h2>
  <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #065f46; font-size: 15px; font-weight: 600;">
      Tu linea de credito ha sido reactivada
    </p>
  </div>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Hemos recibido tu pago y tu linea de credito esta <strong>activa</strong> nuevamente.
    Ya puedes seguir utilizando SaludTech para tus necesidades de salud.
  </p>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Recuerda: pagar a tiempo mantiene tu credito activo y tu cuenta en buen estado.
  </p>
  <a href="%s/dashboard"
     style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
    Ir a mi cuenta
  </a>
`, userName, patientAppURL)
	return sharedWrapper("Credito reactivado", body)
}

// ─── 5. Welcome / Registration ──────────────────────────────────────────────

func WelcomeEmail(userName string, creditLimit float64) string {
	body := fmt.Sprintf(`
  <h2 style="color: #1e293b; font-size: 18px;">Bienvenido a SaludTech, %s</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6;">
    Tu cuenta ha sido creada exitosamente. Ya puedes acceder a farmacias, clinicas y especialistas
    y pagar en cuotas cada 14 dias con <strong>0%% de interes</strong>.
  </p>
  <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #64748b; font-size: 13px;">Linea de credito inicial</p>
    <p style="margin: 4px 0 0; color: #1e293b; font-size: 28px; font-weight: bold;">$%.2f</p>
  </div>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Completa tu perfil y verifica tu identidad para aumentar tu linea de credito.
  </p>
  <a href="%s/dashboard"
     style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
    Comenzar a usar SaludTech
  </a>
`, userName, creditLimit, patientAppURL)
	return sharedWrapper("Bienvenido", body)
}

// ─── 6. Triage Response (admin responded to triage) ─────────────────────────

func TriageResponseEmail(userName, status, recommendation string) string {
	statusColor := "#3b82f6"
	statusLabel := status
	switch status {
	case "RESOLVED":
		statusColor = "#22c55e"
		statusLabel = "Resuelto"
	case "REFERRED":
		statusColor = "#a855f7"
		statusLabel = "Referido a especialista"
	case "COMPLETED":
		statusColor = "#06b6d4"
		statusLabel = "Completado"
	}

	recommendationBlock := ""
	if recommendation != "" {
		recommendationBlock = fmt.Sprintf(`
  <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #64748b; font-size: 13px;">Recomendacion del equipo medico</p>
    <p style="margin: 8px 0 0; color: #1e293b; font-size: 15px; line-height: 1.6;">%s</p>
  </div>
`, recommendation)
	}

	body := fmt.Sprintf(`
  <h2 style="color: #1e293b; font-size: 18px;">Hola %s,</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6;">
    Tu consulta de triaje ha sido revisada por nuestro equipo.
  </p>
  <div style="background: %s15; border: 1px solid %s40; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: %s; font-size: 15px; font-weight: 600;">%s</p>
  </div>
  %s
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Si tienes preguntas, puedes iniciar una nueva consulta desde la app.
  </p>
  <a href="%s/dashboard"
     style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
    Ver detalles
  </a>
`, userName, statusColor, statusColor, statusColor, statusLabel, recommendationBlock, patientAppURL)
	return sharedWrapper("Respuesta de triaje", body)
}

// ─── 7. Account Status Change (admin activated/deactivated) ─────────────────

func AccountStatusEmail(userName string, isActive bool) string {
	if isActive {
		body := fmt.Sprintf(`
  <h2 style="color: #1e293b; font-size: 18px;">Hola %s,</h2>
  <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #065f46; font-size: 15px; font-weight: 600;">
      Tu cuenta ha sido activada
    </p>
  </div>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Ya puedes acceder a tu cuenta y utilizar todos los servicios de SaludTech.
  </p>
  <a href="%s/dashboard"
     style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
    Ir a mi cuenta
  </a>
`, userName, patientAppURL)
		return sharedWrapper("Cuenta activada", body)
	}

	body := fmt.Sprintf(`
  <h2 style="color: #1e293b; font-size: 18px;">Hola %s,</h2>
  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #991b1b; font-size: 15px; font-weight: 600;">
      Tu cuenta ha sido desactivada
    </p>
  </div>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Tu cuenta ha sido desactivada temporalmente. Si crees que esto es un error,
    contacta a nuestro equipo de soporte.
  </p>
  <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
    Soporte: soporte@saludtech.com
  </p>
`, userName)
	return sharedWrapper("Cuenta desactivada", body)
}

// ─── 8. Merchant Status Change (admin activated/deactivated merchant) ───────

func MerchantStatusEmail(merchantName string, isActive bool) string {
	if isActive {
		body := fmt.Sprintf(`
  <h2 style="color: #1e293b; font-size: 18px;">Estimado equipo de %s,</h2>
  <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #065f46; font-size: 15px; font-weight: 600;">
      Su comercio ha sido activado
    </p>
  </div>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Su comercio ya aparece en el directorio de SaludTech y puede recibir transacciones
    de pacientes con financiamiento.
  </p>
`, merchantName)
		return sharedWrapper("Comercio activado", body)
	}

	body := fmt.Sprintf(`
  <h2 style="color: #1e293b; font-size: 18px;">Estimado equipo de %s,</h2>
  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #991b1b; font-size: 15px; font-weight: 600;">
      Su comercio ha sido desactivado
    </p>
  </div>
  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Su comercio ha sido desactivado temporalmente y no aparecera en el directorio.
    Si tiene preguntas, contacte a nuestro equipo de soporte.
  </p>
  <p style="color: #64748b; font-size: 13px; margin-top: 16px;">
    Soporte: soporte@saludtech.com
  </p>
`, merchantName)
	return sharedWrapper("Comercio desactivado", body)
}
