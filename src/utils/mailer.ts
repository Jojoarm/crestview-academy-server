import { getBrevoClient } from '../config/brevo.js';
import { env } from './env.js';

interface SendMailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}

export async function sendMail({
  to,
  subject,
  htmlContent,
  replyTo,
}: SendMailOptions) {
  const brevo = getBrevoClient();

  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: env.BREVO_SENDER_NAME,
      email: env.BREVO_SENDER_EMAIL,
    },
    to,
    subject,
    htmlContent,
    ...(replyTo ? { replyTo } : {}),
  });
}

type InviteEmailParams = {
  to: string;
  name: string;
  temporaryPassword: string;
};

export const sendInviteEmail = async ({
  to,
  name,
  temporaryPassword,
}: InviteEmailParams): Promise<void> => {
  await sendMail({
    to: [{ email: to, name }],
    subject: 'You have been invited to Crestview Academy',
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Crestview Academy, ${name}</h2>
        <p>
          Your account has been created on the Crestview Academy management
          system. Use the credentials below to log in.
        </p>
        <div style="background:#f5f5f5;padding:16px;border-radius:6px;margin:16px 0;">
          <p style="margin:0;"><strong>Email:</strong> ${to}</p>
          <p style="margin:8px 0 0;"><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        </div>
        <p>
          You will be required to change your password immediately after
          your first login.
        </p>
        <a
          href="${env.FRONTEND_URL}/auth/login"
          style="
            display: inline-block;
            background: #8b3a2a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 16px 0;
          "
        >
          Login Now
        </a>
        <p style="color: #888; font-size: 12px;">
          Keep your credentials safe. If you did not expect this email,
          contact us immediately at
          <a href="mailto:${env.BREVO_SENDER_EMAIL}">${env.BREVO_SENDER_EMAIL}</a>.
        </p>
      </div>
    `,
    replyTo: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME },
  });
};

type PasswordResetEmailParams = {
  to: string;
  name: string;
  url: string;
};

export const sendPasswordResetEmail = async ({
  to,
  name,
  url,
}: PasswordResetEmailParams): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${extractToken(url)}`;

  await sendMail({
    to: [{ email: to, name }],
    subject: 'Reset your Crestview Academy password',
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>
          We received a request to reset your password. Click the button
          below to choose a new one.
        </p>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            background: #8b3a2a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 16px 0;
          "
        >
          Reset Password
        </a>
        <p style="color: #888; font-size: 12px;">
          If you did not request this, you can safely ignore this email.
          Your password will not change.
        </p>
      </div>
    `,
    replyTo: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME },
  });
};

const extractToken = (url: string): string => {
  try {
    return new URL(url).searchParams.get('token') ?? url;
  } catch {
    return url;
  }
};
