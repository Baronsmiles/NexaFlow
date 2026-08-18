import bcrypt from 'bcrypt';
import prisma from '../../config/prisma.js';

export async function resetPassword(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // 2. Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.'
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter.'
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter.'
      });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number.'
      });
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one symbol.'
      });
    }

    // 3. Find user
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Unable to reset password.'
      });
    }

    // 4. Find password reset record
    const resetOtp = await prisma.passwordResetOtp.findUnique({
      where: {
        userId: user.id
      }
    });

    if (!resetOtp) {
      return res.status(400).json({
        success: false,
        message: 'Password reset session is invalid or expired.'
      });
    }

    // 5. OTP must have been verified first
    if (!resetOtp.verifiedAt) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your OTP first.'
      });
    }

    // 6. OTP must not already be used
    if (resetOtp.used) {
      return res.status(400).json({
        success: false,
        message: 'Password reset session has already been used.'
      });
    }

    // 7. OTP verification expires after 15 minutes
    const verificationAge =
      Date.now() - new Date(resetOtp.verifiedAt).getTime();

    const fifteenMinutes = 15 * 60 * 1000;

    if (verificationAge > fifteenMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Password reset session has expired. Please request a new OTP.'
      });
    }

    // 8. Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // 9. Update password and invalidate OTP together
    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          password: passwordHash,
          tokenVersion: {
            increment: 1
          }
        }
      }),

      prisma.passwordResetOtp.update({
        where: {
          userId: user.id
        },
        data: {
          used: true,
          verifiedAt: null,
          attempts: 0,
          lockedUntil: null
        }
      }),

      prisma.refreshTokenSession.updateMany({
        where: {
          userId: user.id,
          revokedAt: null
        },
        data: {
          revokedAt: new Date()
        }
      })
    ]);


    return res.status(200).json({
      success: true,
      message: 'Password reset successfully.'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while resetting your password.'
    });
  }
}