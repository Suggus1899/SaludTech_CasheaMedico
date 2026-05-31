import express, { Request, Response } from 'express';
import pino from 'pino';
import { whatsappClient } from './whatsapp';

const router: express.Router = express.Router();
const logger = pino({ level: 'info' });

interface SendOtpRequest {
  phone: string;
  code: string;
}

interface SendOtpResponse {
  ok: boolean;
  error?: string;
}

// POST /send-otp
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone, code }: SendOtpRequest = req.body;

    // Validate request body
    if (!phone || !code) {
      const response: SendOtpResponse = { 
        ok: false, 
        error: 'Missing required fields: phone and code' 
      };
      return res.status(400).json(response);
    }

    // Validate phone format (basic validation)
    if (!/^\+?\d{10,15}$/.test(phone)) {
      const response: SendOtpResponse = { 
        ok: false, 
        error: 'Invalid phone number format' 
      };
      return res.status(400).json(response);
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      const response: SendOtpResponse = { 
        ok: false, 
        error: 'Invalid code format (must be 6 digits)' 
      };
      return res.status(400).json(response);
    }

    // Check if WhatsApp is connected
    if (!whatsappClient.isConnected()) {
      const response: SendOtpResponse = { 
        ok: false, 
        error: 'WhatsApp service not connected' 
      };
      return res.status(503).json(response);
    }

    // Send OTP via WhatsApp
    const success = await whatsappClient.sendMessage(phone, code);

    if (success) {
      const response: SendOtpResponse = { ok: true };
      res.status(200).json(response);
      logger.info(`OTP sent successfully to ${phone}`);
    } else {
      const response: SendOtpResponse = { 
        ok: false, 
        error: 'Failed to send OTP via WhatsApp' 
      };
      res.status(500).json(response);
      logger.error(`Failed to send OTP to ${phone}`);
    }

  } catch (error) {
    logger.error('Error in /send-otp endpoint:', error);
    const response: SendOtpResponse = { 
      ok: false, 
      error: 'Internal server error' 
    };
    res.status(500).json(response);
  }
});

// GET /health
router.get('/health', (req: Request, res: Response) => {
  const status = whatsappClient.getConnectionStatus();
  const isConnected = whatsappClient.isConnected();
  
  res.status(200).json({
    status: 'healthy',
    whatsapp: {
      connected: isConnected,
      status: status
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
