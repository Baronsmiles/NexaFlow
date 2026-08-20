import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export async function validateAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required.'
      });
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format.'
      });
    }

    // Verify the access token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Get the current user and token version
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        tokenVersion: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check whether this access token has been invalidated
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }

    // Authentication successful
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    next();

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token.'
      });
    }

    console.error('Authentication error:', error);

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
}