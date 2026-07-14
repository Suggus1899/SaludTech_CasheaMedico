package email

import "fmt"

// ─── Shared layout ──────────────────────────────────────────────────────────
//
// All SaludTech emails share a professional HTML structure:
//   - Logo image (hosted on Vercel) with text fallback
//   - Gradient header bar with the email title
//   - Clean white body with the message
//   - Color-coded info boxes (blue=info, green=success, red=alert, purple=referral)
//   - CTA button linking to the patient app
//   - Footer with branding and unsubscribe-style note

const logoURL = "https://salud-tech-cashea-medico-web-patien.vercel.app/logostc.png"
const patientAppURL = "https://salud-tech-cashea-medico-web-patien.vercel.app"

const baseStyles = `
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 24px 16px; }
    .logo { display: block; width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 14px; }
    .header { background: linear-gradient(135deg, #2563eb 0%%, #3b82f6 100%%); border-radius: 16px 16px 0 0; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
    .body { background: #ffffff; border-radius: 0 0 16px 16px; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; }
    .body h2 { color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 16px; }
    .body p { color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .body strong { color: #1e293b; }
    .info-box { border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-blue { background: #eff6ff; border: 1px solid #bfdbfe; }
    .info-green { background: #ecfdf5; border: 1px solid #a7f3d0; }
    .info-red { background: #fef2f2; border: 1px solid #fecaca; }
    .info-purple { background: #faf5ff; border: 1px solid #e9d5ff; }
    .info-label { margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { margin: 6px 0 0; font-size: 32px; font-weight: 800; color: #0f172a; }
    .info-sub { margin: 8px 0 0; font-size: 13px; color: #64748b; }
    .cta { display: inline-block; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; margin: 20px 0 8px; }
    .cta-blue { background: #2563eb; color: #ffffff; }
    .cta-green { background: #16a34a; color: #ffffff; }
    .cta-red { background: #dc2626; color: #ffffff; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; margin: 0 0 16px; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-purple { background: #f3e8ff; color: #7e22ce; }
    .footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 12px; line-height: 1.6; }
    .footer a { color: #64748b; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .features { display: flex; justify-content: center; gap: 32px; margin: 24px 0; }
    .feature { text-align: center; }
    .feature-num { font-size: 22px; font-weight: 800; color: #2563eb; }
    .feature-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
  </style>
`

func sharedWrapper(title, subtitle, bodyContent string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  %s
</head>
<body>
  <div class="container">
    <img src="%s" alt="SaludTech" class="logo" />
    <div class="header">
      <h1>SaludTech</h1>
      <p>%s</p>
    </div>
    <div class="body">
      %s
    </div>
    <div class="footer">
      <p>SaludTech — Salud financiada a tu alcance.</p>
      <p>Este correo fue enviado automaticamente. Si crees que es un error, puedes ignorarlo.</p>
      <p style="margin-top: 12px;">
        <a href="%s">Ir a SaludTech</a>
      </p>
    </div>
  </div>
</body>
</html>`, baseStyles, logoURL, subtitle, bodyContent, patientAppURL)
}

// ─── 1. Payment Reminder (upcoming due date) ────────────────────────────────

func PaymentReminderEmail(userName string, amount float64, dueDate, installmentNum string) string {
	body := fmt.Sprintf(`
      <h2>Hola %s,</h2>
      <p>Tu <strong>cuota #%s</strong> vence el <strong>%s</strong>. Te recordamos para que puedas pagar a tiempo y mantener tu linea de credito activa.</p>
      <div class="info-box info-blue">
        <p class="info-label" style="color: #1e40af;">Monto a pagar</p>
        <p class="info-value">$%.2f</p>
        <p class="info-sub">Cuota #%s &middot; Vence el %s</p>
      </div>
      <p>Paga desde la app en menos de 1 minuto. Evita la suspension de tu credito y el cargo de reactivacion.</p>
      <a href="%s/dashboard/cuotas" class="cta cta-blue">Pagar ahora</a>
`, userName, installmentNum, dueDate, amount, installmentNum, dueDate, patientAppURL)
	return sharedWrapper("Recordatorio de pago", "Recordatorio de pago", body)
}

// ─── 2. Payment Confirmation ────────────────────────────────────────────────

func PaymentConfirmationEmail(userName string, amount float64, installmentNum, paidAt string) string {
	body := fmt.Sprintf(`
      <h2>Hola %s,</h2>
      <p>Hemos recibido tu pago correctamente. ¡Gracias por mantener tu cuenta al dia!</p>
      <div class="info-box info-green">
        <p class="info-label" style="color: #166534;">Pago confirmado</p>
        <p class="info-value">$%.2f</p>
        <p class="info-sub">Cuota #%s &middot; Procesado el %s</p>
      </div>
      <p>Tu linea de credito sigue activa. Puedes seguir utilizando SaludTech para tus necesidades de salud.</p>
      <a href="%s/dashboard/cuotas" class="cta cta-green">Ver mis cuotas</a>
`, userName, amount, installmentNum, paidAt, patientAppURL)
	return sharedWrapper("Pago confirmado", "Pago confirmado", body)
}

// ─── 3. Overdue Notice (installment overdue + credit paused) ────────────────

func OverdueNoticeEmail(userName string, amount float64, installmentNum, dueDate string, reactivationFee float64) string {
	body := fmt.Sprintf(`
      <h2>Hola %s,</h2>
      <span class="badge badge-red">Cuota vencida</span>
      <p>Tu <strong>cuota #%s</strong> vencio el <strong>%s</strong> y no hemos recibido el pago.</p>
      <div class="info-box info-red">
        <p class="info-label" style="color: #991b1b;">Monto pendiente</p>
        <p class="info-value">$%.2f</p>
        <p class="info-sub">Cuota #%s &middot; Vencio el %s</p>
      </div>
      <div class="info-box info-red">
        <p class="info-label" style="color: #991b1b;">Cargo de reactivacion</p>
        <p class="info-value">$%.2f</p>
        <p class="info-sub">Se aplica por pago tardio</p>
      </div>
      <p>Tu <strong>linea de credito ha sido pausada</strong>. Para reactivarla, paga el monto pendiente mas el cargo de reactivacion.</p>
      <a href="%s/dashboard/cuotas" class="cta cta-red">Regularizar pago</a>
`, userName, installmentNum, dueDate, amount, installmentNum, dueDate, reactivationFee, patientAppURL)
	return sharedWrapper("Cuota vencida", "Cuota vencida", body)
}

// ─── 4. Credit Reactivation (lines restored after paying overdue) ───────────

func CreditReactivationEmail(userName string) string {
	body := fmt.Sprintf(`
      <h2>Hola %s,</h2>
      <span class="badge badge-green">Credito reactivado</span>
      <p>Hemos recibido tu pago y tu <strong>linea de credito esta activa nuevamente</strong>. Ya puedes seguir utilizando SaludTech para tus necesidades de salud.</p>
      <div class="info-box info-green">
        <p class="info-label" style="color: #166534;">Estado de tu cuenta</p>
        <p class="info-value" style="font-size: 22px;">Al dia</p>
        <p class="info-sub">Linea de credito activa</p>
      </div>
      <p><strong>Consejo:</strong> Pagar a tiempo mantiene tu credito activo y mejora tu nivel en SaludTech.</p>
      <a href="%s/dashboard" class="cta cta-green">Ir a mi cuenta</a>
`, userName, patientAppURL)
	return sharedWrapper("Credito reactivado", "Credito reactivado", body)
}

// ─── 5. Welcome / Registration ──────────────────────────────────────────────

func WelcomeEmail(userName string, creditLimit float64) string {
	body := fmt.Sprintf(`
      <h2>Bienvenido a SaludTech, %s</h2>
      <p>Tu cuenta ha sido creada exitosamente. Ya puedes acceder a farmacias, clinicas, laboratorios y especialistas, y pagar en cuotas con <strong>0%% de interes</strong>.</p>
      <div class="info-box info-blue">
        <p class="info-label" style="color: #1e40af;">Linea de credito inicial</p>
        <p class="info-value">$%.2f</p>
        <p class="info-sub">Disponible para usar ahora</p>
      </div>
      <div class="features">
        <div class="feature">
          <div class="feature-num">0%%</div>
          <div class="feature-label">Interes</div>
        </div>
        <div class="feature">
          <div class="feature-num">14</div>
          <div class="feature-label">Dias entre cuotas</div>
        </div>
        <div class="feature">
          <div class="feature-num">3 min</div>
          <div class="feature-label">Aprobacion</div>
        </div>
      </div>
      <p>Completa tu perfil de salud para personalizar tu experiencia y desbloquear recomendaciones de comercios cercanos.</p>
      <a href="%s/dashboard" class="cta cta-blue">Comenzar a usar SaludTech</a>
`, userName, creditLimit, patientAppURL)
	return sharedWrapper("Bienvenido a SaludTech", "Bienvenido", body)
}

// ─── 6. Triage Response (admin responded to triage) ─────────────────────────

func TriageResponseEmail(userName, status, recommendation string) string {
	statusBadge := ""
	statusLabel := ""
	switch status {
	case "RESOLVED":
		statusBadge = "badge-green"
		statusLabel = "Resuelto"
	case "REFERRED":
		statusBadge = "badge-purple"
		statusLabel = "Referido a especialista"
	case "COMPLETED":
		statusBadge = "badge-blue"
		statusLabel = "Completado"
	default:
		statusBadge = "badge-blue"
		statusLabel = status
	}

	recommendationBlock := ""
	if recommendation != "" {
		recommendationBlock = fmt.Sprintf(`
      <div class="info-box info-blue">
        <p class="info-label" style="color: #1e40af;">Recomendacion del equipo medico</p>
        <p style="color: #1e293b; font-size: 15px; line-height: 1.7; margin: 8px 0 0;">%s</p>
      </div>
`, recommendation)
	}

	body := fmt.Sprintf(`
      <h2>Hola %s,</h2>
      <span class="badge %s">%s</span>
      <p>Tu consulta de triaje ha sido revisada por nuestro equipo medico.</p>
      %s
      <p>Si tienes preguntas o necesitas seguir una consulta, puedes iniciar una nueva desde la app.</p>
      <a href="%s/dashboard" class="cta cta-blue">Ver detalles</a>
`, userName, statusBadge, statusLabel, recommendationBlock, patientAppURL)
	return sharedWrapper("Respuesta de triaje", "Respuesta de triaje", body)
}

// ─── 7. Account Status Change (admin activated/deactivated) ─────────────────

func AccountStatusEmail(userName string, isActive bool) string {
	if isActive {
		body := fmt.Sprintf(`
      <h2>Hola %s,</h2>
      <span class="badge badge-green">Cuenta activada</span>
      <p>Tu cuenta ha sido <strong>activada</strong>. Ya puedes acceder a tu cuenta y utilizar todos los servicios de SaludTech.</p>
      <div class="info-box info-green">
        <p class="info-label" style="color: #166534;">Estado de tu cuenta</p>
        <p class="info-value" style="font-size: 22px;">Activa</p>
        <p class="info-sub">Puedes usar SaludTech normalmente</p>
      </div>
      <a href="%s/dashboard" class="cta cta-green">Ir a mi cuenta</a>
`, userName, patientAppURL)
		return sharedWrapper("Cuenta activada", "Cuenta activada", body)
	}

	body := fmt.Sprintf(`
      <h2>Hola %s,</h2>
      <span class="badge badge-red">Cuenta desactivada</span>
      <p>Tu cuenta ha sido <strong>desactivada</strong> temporalmente. Si crees que esto es un error, contacta a nuestro equipo de soporte.</p>
      <div class="info-box info-red">
        <p class="info-label" style="color: #991b1b;">Estado de tu cuenta</p>
        <p class="info-value" style="font-size: 22px;">Inactiva</p>
        <p class="info-sub">Acceso restringido temporalmente</p>
      </div>
      <p style="color: #64748b; font-size: 13px; margin-top: 16px;">Soporte: soporte@saludtech.com</p>
`, userName)
	return sharedWrapper("Cuenta desactivada", "Cuenta desactivada", body)
}

// ─── 8. Merchant Status Change (admin activated/deactivated merchant) ───────

func MerchantStatusEmail(merchantName string, isActive bool) string {
	if isActive {
		body := fmt.Sprintf(`
      <h2>Estimado equipo de %s,</h2>
      <span class="badge badge-green">Comercio activado</span>
      <p>Su comercio ha sido <strong>activado</strong> en SaludTech. Ya aparece en el directorio y puede recibir transacciones de pacientes con financiamiento.</p>
      <div class="info-box info-green">
        <p class="info-label" style="color: #166534;">Estado de su comercio</p>
        <p class="info-value" style="font-size: 22px;">Activo</p>
        <p class="info-sub">Visible en el directorio de SaludTech</p>
      </div>
      <p>Puede gestionar sus servicios, insumos y ver transacciones desde el panel de comerciante.</p>
`, merchantName)
		return sharedWrapper("Comercio activado", "Comercio activado", body)
	}

	body := fmt.Sprintf(`
      <h2>Estimado equipo de %s,</h2>
      <span class="badge badge-red">Comercio desactivado</span>
      <p>Su comercio ha sido <strong>desactivado</strong> temporalmente y no aparecera en el directorio de SaludTech.</p>
      <div class="info-box info-red">
        <p class="info-label" style="color: #991b1b;">Estado de su comercio</p>
        <p class="info-value" style="font-size: 22px;">Inactivo</p>
        <p class="info-sub">No visible en el directorio</p>
      </div>
      <p>Si tiene preguntas sobre esta accion, contacte a nuestro equipo de soporte.</p>
      <p style="color: #64748b; font-size: 13px; margin-top: 16px;">Soporte: soporte@saludtech.com</p>
`, merchantName)
	return sharedWrapper("Comercio desactivado", "Comercio desactivado", body)
}

// ─── 9. Email Verification (new registration) ───────────────────────────────

func EmailVerificationEmail(userName, verificationURL string) string {
	body := fmt.Sprintf(`
      <h2>Bienvenido a SaludTech, %s,</h2>
      <p>Para completar tu registro y activar tu linea de credito, necesitas <strong>verificar tu correo electronico</strong>.</p>
      <div class="info-box info-blue">
        <p class="info-label" style="color: #1e40af;">Verificacion requerida</p>
        <p style="color: #1e293b; font-size: 15px; line-height: 1.7; margin: 8px 0 0;">
          Confirma que este es tu correo para acceder a todas las funciones de SaludTech.
        </p>
      </div>
      <p>Haz clic en el boton de abajo para verificar tu cuenta. Este enlace expira en 24 horas.</p>
      <a href="%s" class="cta cta-blue">Verificar mi correo</a>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">
        Si no creaste una cuenta en SaludTech, puedes ignorar este correo.
      </p>
`, userName, verificationURL)
	return sharedWrapper("Verifica tu correo", "Verificacion de correo", body)
}
