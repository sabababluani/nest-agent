import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Telegraf } from 'telegraf';

@Injectable()
export class GmailService {
  private bot: Telegraf;
  private readonly channelId = '@babluanis';

  constructor() {
    this.bot = new Telegraf('7980466571:AAGgUAhyOMXYDBswvPEVpS52AYKrHfHVAT0');
  }


  async verifyChannelAccess() {
    try {
      const chat = await this.bot.telegram.getChat(this.channelId);
      console.log('Channel found:', chat);
      return chat;
    } catch (err) {
      console.error('Cannot access channel:', err);
      throw err;
    }
  }

  async create() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Saba Babluani" <${process.env.GMAIL_USER}>`,
      to: 'shakoabzianidze@gmail.com',
      subject: 'Hello ✔',
      text: 'salamai mome kalami!',
      html: '<b>zd all</b>',
    });

    console.log('Message sent:', info);
    return `Email sent: ${info.messageId}`;
  }

  async createTelegram() {
    const message = `
🎵 *New Vinyl Available!*
*Name:* salamai mome kalami\\!
*Price:* $29.99
*Link:* [Check Store](https://example.com/vinyl)
    `.trim();

    try {
      const result = await this.bot.telegram.sendMessage(this.channelId, message, {
        parse_mode: 'Markdown'
      });
      console.log('Message sent successfully:', result.message_id);
      return `Telegram message sent: ${result.message_id}`;
    } catch (err) {
      console.error('Failed to send vinyl to Telegram:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
      }
      throw err;
    }
  }
}