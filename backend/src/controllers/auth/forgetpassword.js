import prisma from '../../config/prisma.js';
import { generateOtp, hashOtp } from '../../utils/otp.js';
import { sendPasswordResetOtpEmail } from '../../services/email.service.js';

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    // Don't reveal whether an email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, an OTP has been sent.'
      });
    }

    // 2. Generate a new OTP
    const otp = generateOtp();

    // 3. Hash the OTP before storing it
    const otpHash = await hashOtp(otp);

    // 4. OTP expires in 15 minutes
    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    // 5. Save/update the OTP
    await prisma.passwordResetOtp.upsert({
      where: {
        userId: user.id
      },

      update: {
        otpHash,
        expiresAt,
        used: false,
        attempts: 0,
        lockedUntil: null
      },

      create: {
        userId: user.id,
        otpHash,
        expiresAt,
        used: false,
        attempts: 0,
        lockedUntil: null
      }
    });

    await sendPasswordResetOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: 'OTP has been sent to Email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.'
    });
  }
}