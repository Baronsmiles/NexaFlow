import bcrypt from 'bcrypt';
import prisma from '../../config/prisma.js';
import { generateAccessToken } from '../../utils/token.js';
import { generateRefreshToken, hashRefreshToken } from '../../utils/refreshToken.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    const refreshTokenHash = hashRefreshToken(refreshToken);


    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshTokenSession.create({ data: { userId: user.id, tokenHash: refreshTokenHash, expiresAt } });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);

    res.status(500).json({
      success: false,
      message: 'Something went wrong while creating the account.'
    });
  }
}