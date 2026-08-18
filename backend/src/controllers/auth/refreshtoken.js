import prisma from '../../config/prisma.js';
import { generateAccessToken } from '../../utils/token.js';
import {
  generateRefreshToken,
  hashRefreshToken
} from '../../utils/refreshToken.js';

export async function refreshToken(req, res) {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found.'
      });
    }

    // Hash the token from the cookie
    const tokenHash =
      hashRefreshToken(oldRefreshToken);

    // Find the refresh-token session
    const session =
      await prisma.refreshTokenSession.findUnique({
        where: {
          tokenHash
        },
        include: {
          user: true
        }
      });

    if (!session) {
      res.clearCookie('refreshToken');

      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    // Check if token has already been revoked
    if (session.revokedAt) {
      res.clearCookie('refreshToken');

      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked.'
      });
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      await prisma.refreshTokenSession.update({
        where: {
          id: session.id
        },
        data: {
          revokedAt: new Date()
        }
      });

      res.clearCookie('refreshToken');

      return res.status(401).json({
        success: false,
        message: 'something with wrong.'
      });
    }

    // Generate new access token
    const accessToken =
      generateAccessToken(session.user);

    // Generate new refresh token
    const newRefreshToken =
      generateRefreshToken();

    // Hash new refresh token
    const newRefreshTokenHash =
      hashRefreshToken(newRefreshToken);

    // New expiration
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // Rotate refresh token
    await prisma.$transaction([
      prisma.refreshTokenSession.update({
        where: {
          id: session.id
        },
        data: {
          revokedAt: new Date()
        }
      }),

      prisma.refreshTokenSession.create({
        data: {
          userId: session.userId,
          tokenHash: newRefreshTokenHash,
          expiresAt
        }
      })
    ]);

    // Send new refresh token
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      accessToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while refreshing your session.'
    });
  }
}
