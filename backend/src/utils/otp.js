import crypto from 'crypto';
import bcrypt from 'bcrypt';

export function generateOtp() {
  return crypto.randomInt(10000, 100000).toString();
}

export async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

export async function compareOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}