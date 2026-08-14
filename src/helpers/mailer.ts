import { app } from '../app';
import nodemailer from 'nodemailer';
import ConsoleTransporter from './consoleTransporter';

/** This wraps the node mailer to print to console if the mailer is set to inactive (active = false)
 * in config.
 */
export default async function createTransportOrConsoleFallback() {
  const mailer = app.get('mailer');
  const nodeMailerTransport = nodemailer.createTransport({
    host: mailer.host,
    port: 587,
    secure: false,
    auth: {
      user: mailer.address,
      pass: mailer.password,
    },
  });

  try {
    const success = await verifyTransport(nodeMailerTransport);
    console.log('Connected to mail server:', success);
    return nodeMailerTransport;
  } catch (error) {
    console.error('Failed to connect to mail server:', error);
    console.warn('A fallback mailer will be used, this means, the mails will be displayed in the console for dev purposes.');
    return nodemailer.createTransport(new ConsoleTransporter());
  }
}

async function verifyTransport(transport: nodemailer.Transporter) {
  return new Promise((resolve, reject) => {
    transport.verify((error, success) => {
      if (error) return reject(error);
      return resolve(success);
    });
  });
}