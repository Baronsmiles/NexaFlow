import prisma from '../../config/prisma.js';
import { hashRefreshToken } from '../../utils/refreshToken.js';

export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const tokenHash =
        hashRefreshToken(refreshToken);

      await prisma.refreshTokenSession.updateMany({
        where: {
          tokenHash,
          revokedAt: null
        },
        data: {
          revokedAt: new Date()
        }
      });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      secure: true,
      sameSite: 'none',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });

  } catch (error) {
    console.error('Logout error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while logging out.'
    });
  }
}
