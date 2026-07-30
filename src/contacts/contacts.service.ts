import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateContactDto } from './dto/create-contact.dto';
import { QueryContactDto } from './dto/query-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { ConfigService } from '@nestjs/config';

import { Subject } from 'rxjs';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';
import { Resend } from 'resend';

@Injectable()
export class ContactsService {
  private readonly contactStream$ = new Subject<void>();

  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
    private readonly configService: ConfigService,
  ) {}

  getContactStream() {
    return this.contactStream$.asObservable();
  }

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const createdContact = new this.contactModel(createContactDto);
    const result = await createdContact.save();
    this.contactStream$.next();
    return result;
  }

  async findAll(queryDto: QueryContactDto) {
    const { page = 1, limit = 10, search } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.contactModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true })
        .exec(),
      this.contactModel.countDocuments(filter).exec(),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    this.validateObjectId(id);

    const contact = await this.contactModel
      .findById(id)
      .lean({ virtuals: true })
      .exec();

    if (!contact) {
      throw new NotFoundException(`Contact message with ID "${id}" not found`);
    }

    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    this.validateObjectId(id);

    const updatedContact = await this.contactModel
      .findByIdAndUpdate(id, updateContactDto, {
        returnDocument: 'after',
        runValidators: true,
      })
      .lean({ virtuals: true })
      .exec();

    if (!updatedContact) {
      throw new NotFoundException(`Contact message with ID "${id}" not found`);
    }

    return updatedContact;
  }

  async remove(id: string) {
    this.validateObjectId(id);

    const deletedContact = await this.contactModel
      .findByIdAndDelete(id)
      .lean({ virtuals: true })
      .exec();

    if (!deletedContact) {
      throw new NotFoundException(`Contact message with ID "${id}" not found`);
    }

    return {
      message: `Contact message with ID "${id}" successfully deleted`,
      id,
    };
  }

  async count(): Promise<number> {
    return this.contactModel.countDocuments().exec();
  }

  async sendReply(id: string, replyMessage: string): Promise<any> {
    const contact = await this.findOne(id);

    console.log(
      `Sending reply to ${contact.email} for message: "${contact.message}"`,
    );
    console.log(`Reply content: "${replyMessage}"`);

    // Push reply to replies array and mark status as read in DB
    const updatedContact = await this.contactModel
      .findByIdAndUpdate(
        id,
        {
          $push: {
            replies: {
              message: replyMessage,
              createdAt: new Date(),
            },
          },
          status: 'read',
        },
        { returnDocument: 'after' },
      )
      .lean({ virtuals: true })
      .exec();

    if (!updatedContact) {
      throw new NotFoundException(`Contact message with ID "${id}" not found`);
    }

    this.contactStream$.next(); // notify dashboard real-time

    const resendApiKey =
      this.configService.get<string>('RESEND_API_KEY') ||
      process.env.RESEND_API_KEY;
    const resendFromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      process.env.RESEND_FROM_EMAIL ||
      'onboarding@resend.dev';

    const smtpHost =
      this.configService.get<string>('SMTP_HOST') || process.env.SMTP_HOST;
    const smtpPort = parseInt(
      this.configService.get<string>('SMTP_PORT') ||
        process.env.SMTP_PORT ||
        '587',
      10,
    );
    const smtpUser =
      this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER;
    const smtpPass =
      this.configService.get<string>('SMTP_PASS') || process.env.SMTP_PASS;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 20px; }
          .container { max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; padding: 30px 24px; text-align: center; }
          .header h2 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 24px; line-height: 1.6; }
          .message-bubble { background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 24px; font-size: 15px; color: #1e293b; }
          .original-bubble { background-color: #f8fafc; border-left: 4px solid #cbd5e1; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #64748b; margin-top: 24px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; background-color: #fafafa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Response to Your Inquiry</h2>
          </div>
          <div class="content">
            <p>Hello <strong>${contact.username}</strong>,</p>
            <p>Thank you for reaching out. Here is the reply to your inquiry:</p>

            <div class="message-bubble">
              ${replyMessage.replace(/\n/g, '<br>')}
            </div>

            <div class="original-bubble">
              <strong style="display: block; margin-bottom: 4px; color: #475569;">Your Original Message:</strong>
              <em>"${contact.message}"</em>
            </div>
          </div>
          <div class="footer">
            This is an automated response from my portfolio contact form.
            <br>
            &copy; ${new Date().getFullYear()} Support Team. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    // 1. Try Resend API (HTTP Port 443 - works on Railway & cloud hosts without SMTP block)
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const { error } = await resend.emails.send({
          from: resendFromEmail,
          to: contact.email,
          subject: `Re: Contact Inquiry from ${contact.username}`,
          text: replyMessage,
          html: htmlContent,
        });

        if (!error) {
          console.log(
            `Reply email sent successfully via Resend API to ${contact.email}`,
          );
          return {
            message: 'Reply sent successfully via Resend.',
            simulated: false,
            data: updatedContact,
          };
        }
        console.warn('Resend API returned error, falling back to SMTP:', error);
      } catch (resendError: unknown) {
        const msg =
          resendError instanceof Error
            ? resendError.message
            : String(resendError);
        console.warn('Resend API call failed, falling back to SMTP:', msg);
      }
    }

    // 2. Fallback to Nodemailer SMTP (for localhost or hosts where SMTP ports 587/465 are unblocked)
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn(
        'Neither Resend API nor SMTP configured properly. Simulating mail send.',
      );
      return {
        message: 'Reply simulated successfully (No valid mail config found).',
        simulated: true,
        data: updatedContact,
      };
    }

    try {
      const isSecure = smtpPort === 465;
      const ipv4Addresses = await dns.promises
        .resolve4(smtpHost)
        .catch(() => []);
      const resolvedHost = ipv4Addresses[0] || smtpHost;

      const transporterOptions: nodemailer.TransportOptions = {
        host: resolvedHost,
        port: smtpPort,
        secure: isSecure,
        ...(isSecure ? {} : { requireTLS: true }),
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          servername: smtpHost,
        },
      } as nodemailer.TransportOptions;

      const transporter = nodemailer.createTransport(transporterOptions);

      await transporter.sendMail({
        from: `"Portfolio Contact" <${smtpUser}>`,
        to: contact.email,
        subject: `Re: Contact Inquiry from ${contact.username}`,
        text: replyMessage,
        html: htmlContent,
      });

      console.log(
        `Reply email sent successfully via Gmail SMTP to ${contact.email}`,
      );
      return {
        message: 'Reply sent successfully.',
        simulated: false,
        data: updatedContact,
      };
    } catch (mailError: unknown) {
      const errorMessage =
        mailError instanceof Error ? mailError.message : String(mailError);
      console.error('Gmail SMTP email delivery error:', errorMessage);
      return {
        message: 'Reply saved, but email delivery failed.',
        simulated: false,
        data: updatedContact,
      };
    }
  }

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: "${id}"`);
    }
  }
}
