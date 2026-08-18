import { Resend } from 'resend';

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function sendPasswordResetOtpEmail(
  email,
  otp
) {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: [email],
    subject: 'Your NexaFlow Password Reset OTP',

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        
        <h2>NexaFlow Password Reset</h2>

        <p>
          We received a request to reset your NexaFlow password.
        </p>

        <p>
          Your 5-digit verification code is:
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 25px 0;
        ">
          ${otp}
        </div>

        <p>
          This code expires in <strong>15 minutes</strong>.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this email.
        </p>

        <p>
          — NexaFlow
        </p>

      </div>
    `
  });

  if (error) {
    console.error('Resend email error:', error);
    throw new Error('Failed to send password reset email.');
  }

  return data;
}