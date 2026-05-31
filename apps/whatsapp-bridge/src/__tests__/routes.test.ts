import request from 'supertest';
import express from 'express';
import routes from '../routes';
import { whatsappClient } from '../whatsapp';

// Mock the whatsappClient
jest.mock('../whatsapp', () => ({
  whatsappClient: {
    isConnected: jest.fn(),
    getConnectionStatus: jest.fn(),
    sendMessage: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/', routes);

describe('WhatsApp Bridge API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      (whatsappClient.isConnected as jest.Mock).mockReturnValue(true);
      (whatsappClient.getConnectionStatus as jest.Mock).mockReturnValue('CONNECTED');

      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.whatsapp.connected).toBe(true);
    });
  });

  describe('POST /send-otp', () => {
    it('should fail if phone or code is missing', async () => {
      const response = await request(app)
        .post('/send-otp')
        .send({ phone: '1234567890' });
        
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it('should fail if WhatsApp is disconnected', async () => {
      (whatsappClient.isConnected as jest.Mock).mockReturnValue(false);

      const response = await request(app)
        .post('/send-otp')
        .send({ phone: '1234567890', code: '123456' });
        
      expect(response.status).toBe(503);
    });

    it('should succeed and send OTP if connected', async () => {
      (whatsappClient.isConnected as jest.Mock).mockReturnValue(true);
      (whatsappClient.sendMessage as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/send-otp')
        .send({ phone: '1234567890', code: '123456' });
        
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(whatsappClient.sendMessage).toHaveBeenCalledWith('1234567890', '123456');
    });
  });
});
