import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client, LocalAuth } from 'whatsapp-web.js';

@Injectable()
export class AppService implements OnModuleInit {
  private client: Client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    },
    webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html' },
  });
  private readonly logger = new Logger(AppService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    this.client.on('qr', (qr) => {
      this.logger.log(
        `QrCode: http://localhost:8081/qrcode`,
      );
      this.eventEmitter.emit('qrcode.created', qr);
    });

    this.client.on('ready', () => {
      this.logger.log("You're connected successfully!");
    });

    this.client.on('message', (msg) => {
      this.logger.verbose(`${msg.from}: ${msg.body}`);
      this.eventEmitter.emit('message.received', msg);
    });

    this.client.initialize();
  }
}
