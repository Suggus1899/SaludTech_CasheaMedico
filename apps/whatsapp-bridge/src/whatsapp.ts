import { create, Client } from '@open-wa/wa-automate';
import pino from 'pino';

export class WhatsAppClient {
  private client: Client | null = null;
  private logger = pino({ level: 'info' });
  private statusStr: string = 'Initializing...';

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      this.client = await create({
        sessionId: "session",
        multiDevice: true, 
        authTimeout: 60, 
        blockCrashLogs: true,
        disableSpins: true,
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,

        logConsole: false,
        popup: false,
        qrTimeout: 0, 
      });
      
      this.logger.info('WhatsApp connection opened successfully!');
      this.statusStr = 'Connected';

      this.client.onStateChanged((state) => {
        this.logger.info(`State changed: ${state}`);
        this.statusStr = state;
        if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
          this.client?.forceRefocus();
        }
      });

    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp connection:', error);
      this.statusStr = 'Error';
    }
  }

  public async sendMessage(phone: string, code: string): Promise<boolean> {
    if (!this.client) {
      this.logger.error('WhatsApp client not initialized');
      return false;
    }

    try {
      const formattedPhone = phone.replace(/[^\d]/g, '');
      const jid = `${formattedPhone}@c.us`;

      const message = `Tu código de verificación SaludTech es: ${code}. Válido por 10 minutos.`;
      
      await this.client.sendText(jid as any, message);

      this.logger.info(`OTP sent successfully to ${phone}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${phone}:`, error);
      return false;
    }
  }

  public isConnected(): boolean {
    return this.client !== null && this.statusStr === 'Connected';
  }

  public getConnectionStatus(): string {
    return this.statusStr;
  }
}

// Singleton instance
export const whatsappClient = new WhatsAppClient();
