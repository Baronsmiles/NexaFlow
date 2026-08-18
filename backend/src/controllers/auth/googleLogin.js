import { OAuth2Client } from 'google-auth-library';
import prisma from '../../config/prisma.js';

import {
  generateAccessToken
} from '../../utils/token.js';

import {
  generateRefreshToken,
  hashRefreshToken
} from '../../utils/refreshToken.js';


const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);


export async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    // 1. Validate Google credential
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required.'
      });
    }


    // 2. Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });


    // 3. Get verified Google account information
    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
      email_verified
    } = payload;


    // 4. Make sure Google verified the email
    if (!googleId || !email || !email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Google account could not be verified.'
      });
    }


    // 5. Find user by Google ID
    let user = await prisma.user.findUnique({
      where: {
        googleId
      }
    });


    // 6. If Google account doesn't exist,
    // check whether the email already belongs
    // to another account
    if (!user) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email
        }
      });


      // Do not automatically connect
      // Google to an existing password account
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            'An account already exists with this email. Please log in with your password first.'
        });
      }
    }


    // 7. Create a new Google account
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || 'Google User',
          email,
          googleId
        }
      });
    }


    // 8. Generate short-lived access token
    const accessToken = generateAccessToken(user);


    // 9. Generate random refresh token
    const refreshToken = generateRefreshToken();


    // 10. Hash refresh token before storing it
    const refreshTokenHash =
      hashRefreshToken(refreshToken);


    // 11. Store refresh-token session
    await prisma.refreshTokenSession.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        )
      }
    });


    // 12. Send refresh token through
    // HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


    // 13. Return access token and user
    return res.status(200).json({
      success: true,
      message: 'Google login successful.',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Google login error:', error);

    return res.status(401).json({
      success: false,
      message: 'Google authentication failed.'
    });
  }
}