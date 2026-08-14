import { Transport } from 'nodemailer';
import { app } from '../app';

export default class ConsoleTransporter implements Transport {
  public name: string = 'console-transporter';
  public version: string = '1.0.0';

  public send(mail: import('nodemailer/lib/mailer/mail-message')<any>, callback: (err: Error | null, info: any) => void): void {
    const separator = `+${'-'.repeat(80)}+`;
    console.log(`+${'-'.repeat(80/2-11)} Fallback Mail Viewer ${'-'.repeat(80/2-11)}+`);
    console.log('From: ', app.get('mailFrom'));
    console.log('To: ', mail.data.to);
    console.log('Subject: ', mail.data.subject);
    console.log(separator);
    console.log(mail.data.text);
    console.log(separator);
    callback(null, {});
  }
}