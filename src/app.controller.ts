import { Controller, Get, Res } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Response } from 'express';
import * as QRCode from 'qrcode';

@Controller()
export class AppController {
  private qrCode: string;

  @Get('qrcode')
  async generateQrCode(@Res() response: Response) {
    if (!this.qrCode) {
      return response.status(404).send('QR code not found');
    }

    response.setHeader('Content-Type', 'image/png');
    QRCode.toFileStream(response, this.qrCode);
  }

  @OnEvent('qrcode.created')
  handleQrcodeCreatedEvent(qrCode: string) {
    this.qrCode = qrCode;
  }

  @OnEvent('message.received')
  async handleReceivedMessage(msg: any) {
    const response = await fetch('http://localhost:8080/whatsapp/client/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    })
    const data = await response.json();
    console.log(`API response: ${data}`);
  }
}
