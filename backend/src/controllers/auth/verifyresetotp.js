import prisma from '../../config/prisma.js';
import { compareOtp } from '../../utils/otp.js';

export async function verifyResetOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.'
      });
    }

    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.'
      });
    }

    // 2. Find the OTP record
    const resetOtp = await prisma.passwordResetOtp.findUnique({
      where: {
        userId: user.id
      }
    });

    if (!resetOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.'
      });
    }

    // 3. Check if account is locked due to too many attempts
    if (
      resetOtp.lockedUntil &&
      new Date() < resetOtp.lockedUntil
    ) {
      const remainingMinutes = Math.ceil(
        (resetOtp.lockedUntil.getTime() - Date.now()) / 60000
      );

      return res.status(429).json({
        success: false,
        message: `Too many incorrect attempts. Please try again in ${remainingMinutes} minute(s).`
      });
    }

    // 4. Check if OTP has already been used
    if (resetOtp.used) {
      return res.status(400).json({
        success: false,
        message: 'This OTP has already been used.'
      });
    }

    // 5. Check expiration
    if (new Date() > resetOtp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired.'
      });
    }

    // 6. Compare submitted OTP with hashed OTP
    const isValid = await compareOtp(
      otp,
      resetOtp.otpHash
    );

    if (!isValid) {
      const newAttempts = resetOtp.attempts + 1;
      const attemptsRemaining = 5 - newAttempts;

      if (newAttempts >= 5) {
        const lockedUntil = new Date(
          Date.now() + 15 * 60 * 1000
        );

        await prisma.passwordResetOtp.update({
          where: {
            userId: user.id
          },
          data: {
            attempts: newAttempts,
            lockedUntil
          }
        });

        return res.status(429).json({
          success: false,
          message: 'Too many incorrect attempts. Please try again in 15 minutes.'
        });
      }

      await prisma.passwordResetOtp.update({
        where: {
          userId: user.id
        },
        data: {
          attempts: newAttempts
        }
      });

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${attemptsRemaining} attempt(s) remaining.`
      });
    }

    // 7. Reset attempts and lock on successful verification
    await prisma.passwordResetOtp.update({
      where: {
        userId: user.id
      },
      data: {
        attempts: 0,
        lockedUntil: null,
        verifiedAt: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.'
    });

  } catch (error) {
    console.error('Verify reset OTP error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while verifying OTP.'
    });
  }
}