import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async ({ to, resetToken }) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const { data, error } = await resend.emails.send({
    from: `${process.env.APP_NAME || "Your App"} <noreply@${process.env.RESEND_DOMAIN}>`,
    to: [to],
    subject: "Reset Your Password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 24px; line-height: 1.5;">
          We received a request to reset your password. Click the button below to create a new password. This link will expire in <strong>15 minutes</strong>.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #1a1a1a; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 32px; line-height: 1.5;">
          If you didn't request a password reset, you can safely ignore this email.<br/>
          If you have trouble clicking the button, copy and paste this URL into your browser:<br/>
          <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send reset email");
  }

  return data;
};