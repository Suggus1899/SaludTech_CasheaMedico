package email

import (
	"fmt"
	"log"

	"github.com/resend/resend-go/v3"
)

// Sender wraps the Resend client for sending transactional emails.
type Sender struct {
	client   *resend.Client
	fromEmail string
}

// New creates a Sender. If apiKey is empty, returns a no-op sender
// that logs warnings instead of sending (useful for dev).
func New(apiKey, fromEmail string) *Sender {
	if apiKey == "" {
		log.Println("⚠️  RESEND_API_KEY not set — email reminders disabled")
		return &Sender{client: nil, fromEmail: fromEmail}
	}
	return &Sender{
		client:   resend.NewClient(apiKey),
		fromEmail: fromEmail,
	}
}

// Send sends a plain HTML email to a single recipient.
func (s *Sender) Send(to, subject, html string) error {
	if s.client == nil {
		log.Printf("[email] (no-op) To: %s, Subject: %s", to, subject)
		return nil
	}

	params := &resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{to},
		Subject: subject,
		Html:    html,
	}

	sent, err := s.client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("send email to %s: %w", to, err)
	}

	log.Printf("📧 Email sent to %s (id: %s)", to, sent.Id)
	return nil
}

// PaymentReminderEmail builds the HTML for a payment reminder.
func PaymentReminderEmail(userName string, amount float64, dueDate, installmentNum string) string {
	return fmt.Sprintf(`
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <div style="background: #3b82f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: white; margin: 0; font-size: 22px;">SaludTech</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Recordatorio de pago</p>
  </div>

  <h2 style="color: #1e293b; font-size: 18px;">Hola %s,</h2>

  <p style="color: #475569; font-size: 15px; line-height: 1.6;">
    Te recordamos que tu <strong>cuota #%s</strong> vence el <strong>%s</strong>.
  </p>

  <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; color: #64748b; font-size: 13px;">Monto a pagar</p>
    <p style="margin: 4px 0 0; color: #1e293b; font-size: 28px; font-weight: bold;">$%.2f</p>
  </div>

  <p style="color: #475569; font-size: 14px; line-height: 1.6;">
    Puedes realizar tu pago desde la app de SaludTech. Evita la suspensión de tu línea de crédito pagando a tiempo.
  </p>

  <a href="https://salud-tech-cashea-medico-web-patien.vercel.app/dashboard/cuotas"
     style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
    Pagar ahora
  </a>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
  <p style="color: #94a3b8; font-size: 12px;">
    SaludTech — Salud financiada a tu alcance.<br>
    Si ya pagaste, ignora este correo.
  </p>
</div>
`, userName, installmentNum, dueDate, amount)
}
