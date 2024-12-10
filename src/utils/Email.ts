import { User } from '../entities/User';
import { createTransport, SendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

class Email {
  to: string;
  firstName: string;
  url: string;
  from: string;

  constructor(user: User, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `${process.env.NAME_FROM}<${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    const transportOptions: SMTPTransport.Options = {
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT!),
    };

    return createTransport(transportOptions);
  }

  async send(template: string, subject: string) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    const options: SendMailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.toString(),
    };

    await this.newTransport().sendMail(options);
  }
}

export default Email;
