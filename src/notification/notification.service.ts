import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private mailer: nodemailer.Transporter;
  private twilioClient: Twilio;
  sendSignupEmail: any;

  constructor(private readonly config: ConfigService) {
    this.mailer = nodemailer.createTransport({
      host: this.config.get<string>('EMAIL_HOST'),
      port: this.config.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.config.get<string>('EMAIL_USER'),
        pass: this.config.get<string>('EMAIL_PASS'),
      },
    });

    this.twilioClient = new Twilio(
      this.config.get<string>('TWILIO_ACCOUNT_SID') ?? '',
      this.config.get<string>('TWILIO_AUTH_TOKEN') ?? '',
    );
  }

  // ... your existing sendSignupEmail / sendSignupSms if you want to keep them

  async sendOtpEmail(to: string, name: string, otp: string) {
    const from =
      this.config.get<string>('EMAIL_FROM') ?? 'no-reply@example.com';

    try {
      await this.mailer.sendMail({
        from,
        to,
        subject: 'Your login OTP code',
        text: `Hello Guide ${name},\n\nYour OTP code is: ${otp}\nIt expires in 5 minutes.`,
        html: `<p>Hello Guide <b>${name}</b>,</p>
               <p>Your OTP code is: <b>${otp}</b></p>
               <p>It expires in 5 minutes.</p>`,
      });
      this.logger.log(`OTP email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send OTP email to ${to}`, err as Error);
    }
  }

  async sendOtpSms(toPhone: string, name: string, otp: string) {
    const messagingServiceSid = this.config.get<string>(
      'TWILIO_MESSAGING_SERVICE_SID',
    );
    const fromPhone = this.config.get<string>('TWILIO_FROM_PHONE');

    try {
      await this.twilioClient.messages.create({
        // Prefer messaging service if set
        ...(messagingServiceSid
          ? { messagingServiceSid }
          : { from: fromPhone }),
        to: toPhone,
        body: `Hi ${name}, your login OTP is ${otp}. It expires in 5 minutes.`,
      });
      this.logger.log(`OTP SMS sent to ${toPhone}`);
    } catch (err) {
      this.logger.error(`Failed to send OTP SMS to ${toPhone}`, err as Error);
    }
  }
}
