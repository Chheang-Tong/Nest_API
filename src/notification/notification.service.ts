/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

  // -----------------------------
  // Helper: normalize phone number
  // -----------------------------
  /**
   * Normalize Cambodia phone number into E.164 format.
   *
   * Examples:
   *  - "098xxxxxx"      -> "+85598xxxxxx"
   *  - "+85598xxxxxx"   -> "+85598xxxxxx"
   *  - "85598xxxxxx"    -> "+85598xxxxxx"
   */
  private normalizeCambodiaPhone(raw: string): string {
    if (!raw) {
      throw new Error('Phone number is required');
    }

    // Remove spaces, dashes, etc.
    const digitsOnly = raw.replace(/\D/g, '');

    // Already with 855 prefix (e.g. "85598xxxxxx")
    if (digitsOnly.startsWith('855')) {
      return `+${digitsOnly}`;
    }

    // Local format starting with 0 (e.g. "098xxxxxx")
    if (digitsOnly.startsWith('0')) {
      return `+855${digitsOnly.slice(1)}`;
    }

    // If already starts with country code 855 but with + included, Twilio can handle it.
    if (raw.startsWith('+855')) {
      return raw;
    }

    // Fallback – log and throw so you see wrong formats
    this.logger.error(
      `normalizeCambodiaPhone: invalid format received: ${raw}`,
    );
    throw new Error('Invalid Cambodia phone number format');
  }

  // -----------------------------
  // EMAIL OTP
  // -----------------------------
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
      this.logger.error(
        `Failed to send OTP email to ${to}: ${(err as Error).message}`,
      );
    }
  }

  // -----------------------------
  // SMS OTP
  // -----------------------------
  async sendOtpSms(toPhone: string, name: string, otp: string) {
    const messagingServiceSid = this.config.get<string>(
      'TWILIO_MESSAGING_SERVICE_SID',
    );
    const fromPhone = this.config.get<string>('TWILIO_FROM_PHONE');

    try {
      const normalizedTo = this.normalizeCambodiaPhone(toPhone);

      await this.twilioClient.messages.create({
        ...(messagingServiceSid
          ? { messagingServiceSid }
          : { from: fromPhone }),
        to: normalizedTo,
        body: `Hi ${name}, your login OTP is ${otp}. It expires in 5 minutes.`,
      });

      this.logger.log(`OTP SMS sent to ${normalizedTo}`);
    } catch (err: any) {
      this.logger.error(
        `Failed to send OTP SMS to ${toPhone} (${err?.code ?? 'no-code'}): ${
          err?.message ?? err
        }`,
      );
    }
  }
}
