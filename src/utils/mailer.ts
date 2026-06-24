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
  url: string; //Better Auth verification url
};

export const sendInviteEmail = async ({
  to,
  name,
  url,
}: InviteEmailParams): Promise<void> => {
  // Redirect Better Auth's verify URL to our custom set-password page
  const setPasswordUrl = `${env.FRONTEND_URL}/auth/set-password?token=${extractToken(url)}`;
  const htmlTemplate = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Crestview Academy, ${name}</h2>
      <p>
        Your account has been created. Click the button below to set your
        password and activate your account.
      </p>
      <p>This link expires in <strong>48 hours</strong>.</p>
      <a
        href="${setPasswordUrl}"
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
        Set Your Password
      </a>
      <p style="color: #888; font-size: 12px;">
        If you did not expect this email, please ignore it or contact
        <a href="mailto:${env.BREVO_SENDER_EMAIL}">${env.BREVO_SENDER_EMAIL}</a>.
      </p>
    </div>
  `;

  await sendMail({
    to: [{ email: to, name }], // the invited user
    subject:
      'You have been invited to complete onboarding at Crestview Academy',
    htmlContent: htmlTemplate,
    replyTo: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME }, // replies go to school
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
  const htmlTemplate = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>
        We received a request to reset your password. Click the button below
        to choose a new one.
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
        If you did not request a password reset, please ignore this email.
        Your password will not change.
      </p>
    </div>
  `;

  await sendMail({
    to: [{ email: to, name }],
    subject: 'Reset your Crestview Academy password',
    htmlContent: htmlTemplate,
  });
};

const extractToken = (url: string): string => {
  try {
    return new URL(url).searchParams.get('token') ?? url;
  } catch {
    return url;
  }
};
