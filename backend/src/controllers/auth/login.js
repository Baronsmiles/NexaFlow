import bcrypt from 'bcrypt';
import prisma from '../../config/prisma.js';
import { generateAccessToken } from '../../utils/token.js';
import {
  generateRefreshToken,
  hashRefreshToken
} from '../../utils/refreshToken.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 1. Generate short-lived access token
    const accessToken = generateAccessToken(user);

    // 2. Generate random refresh token
    const refreshToken = generateRefreshToken();

    // 3. Hash refresh token before storing it
    const refreshTokenHash =
      hashRefreshToken(refreshToken);

    // 4. Refresh session expires in 7 days
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // 5. Store refresh-token session
    await prisma.refreshTokenSession.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt
      }
    });

    // 6. Send raw refresh token to browser
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while logging in.'
    });
  }
}