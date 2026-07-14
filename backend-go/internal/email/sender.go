package email

import (
	"fmt"
	"log"

	"github.com/resend/resend-go/v3"
)

// Sender wraps the Resend client for sending transactional emails.
type Sender struct {
	client    *resend.Client
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
		client:    resend.NewClient(apiKey),
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
