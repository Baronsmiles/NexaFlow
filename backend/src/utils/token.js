import jwt from 'jsonwebtoken';

export function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m'
    }
  );
}