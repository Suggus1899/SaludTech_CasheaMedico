package email

import (
	"fmt"
	"log"
	"strings"

	"github.com/resend/resend-go/v3"
	"gopkg.in/gomail.v2"
)

// Sender wraps the email client for sending transactional emails.
// Supports two providers:
//   - Resend (if ResendAPIKey is set)
//   - Gmail SMTP (if GmailAppPassword is set)
//
// If neither is configured, returns a no-op sender that logs warnings.
type Sender struct {
	provider string // "resend", "gmail", or "noop"
	// Resend
	client    *resend.Client
	fromEmail string
	// Gmail SMTP
	gmailUser     string
	gmailPassword string
	smtpHost      string
	smtpPort      int
}

// New creates a Sender based on available configuration.
// Priority: Resend > Gmail SMTP > no-op.
func New(apiKey, fromEmail string) *Sender {
	return NewWithGmail(apiKey, fromEmail, "", "")
}

// NewWithGmail creates a Sender with Gmail SMTP support.
// If apiKey is set, uses Resend. Otherwise if gmailAppPassword is set, uses Gmail SMTP.
func NewWithGmail(apiKey, fromEmail, gmailUser, gmailAppPassword string) *Sender {
	if apiKey != "" {
		return &Sender{
			provider:  "resend",
			client:    resend.NewClient(apiKey),
			fromEmail: fromEmail,
		}
	}

	if gmailAppPassword != "" && gmailUser != "" {
		user := gmailUser
		if !strings.HasSuffix(user, "@gmail.com") {
			user = user + "@gmail.com"
		}
		log.Printf("📧 Using Gmail SMTP for outgoing emails (user: %s)", user)
		return &Sender{
			provider:      "gmail",
			fromEmail:     user,
			gmailUser:     user,
			gmailPassword: gmailAppPassword,
			smtpHost:      "smtp.gmail.com",
			smtpPort:      587,
		}
	}

	log.Println("⚠️  No email provider configured — email reminders disabled")
	return &Sender{provider: "noop", fromEmail: fromEmail}
}

// Send sends a plain HTML email to a single recipient.
func (s *Sender) Send(to, subject, html string) error {
	switch s.provider {
	case "noop":
		log.Printf("[email] (no-op) To: %s, Subject: %s", to, subject)
		return nil
	case "gmail":
		return s.sendGmail(to, subject, html)
	case "resend":
		return s.sendResend(to, subject, html)
	default:
		log.Printf("[email] (no-op) To: %s, Subject: %s", to, subject)
		return nil
	}
}

func (s *Sender) sendResend(to, subject, html string) error {
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

func (s *Sender) sendGmail(to, subject, html string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", s.fromEmail)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", html)

	d := gomail.NewDialer(s.smtpHost, s.smtpPort, s.gmailUser, s.gmailPassword)

	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("send gmail to %s: %w", to, err)
	}

	log.Printf("📧 Email sent to %s via Gmail SMTP", to)
	return nil
}
