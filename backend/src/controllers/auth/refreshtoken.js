import prisma from '../../config/prisma.js';
import { generateAccessToken } from '../../utils/token.js';
import {
  generateRefreshToken,
  hashRefreshToken
} from '../../utils/refreshToken.js';

export async function refreshToken(req, res) {
  try {
    // 1. Get refresh token from HttpOnly cookie
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found.'
      });
    }

    // 2. Hash the refresh token
    const tokenHash = hashRefreshToken(oldRefreshToken);

    // 3. Find the existing refresh-token session
    const session = await prisma.refreshTokenSession.findUnique({
      where: {
        tokenHash
      },
      include: {
        user: true
      }
    });

    if (!session) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    // 4. Check whether the session was revoked
    if (session.revokedAt) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      });

      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked.'
      });
    }

    // 5. Check whether the refresh token has expired
    if (new Date() > session.expiresAt) {
      await prisma.refreshTokenSession.update({
        where: {
          id: session.id
        },
        data: {
          revokedAt: new Date()
        }
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      });

      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired. Please log in again.'
      });
    }

    // 6. Generate a new access token
    const accessToken = generateAccessToken(session.user);

    // 7. Generate a new refresh token
    const newRefreshToken = generateRefreshToken();

    // 8. Hash the new refresh token
    const newRefreshTokenHash =
      hashRefreshToken(newRefreshToken);

    // 9. Give the refresh session another 7 days
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // 10. UPDATE the existing row
    await prisma.refreshTokenSession.update({
      where: {
        id: session.id
      },
      data: {
        tokenHash: newRefreshTokenHash,
        expiresAt
      }
    });

    // 11. Replace the refresh-token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    // 12. Return only the new access token
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