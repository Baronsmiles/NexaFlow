import express from 'express';
import { register } from '../controllers/auth/register.js';
import { login } from '../controllers/auth/login.js';
import { refreshToken } from '../controllers/auth/refreshtoken.js';
import { validateAuth } from '../middleware/validateAuth.js';
import { forgotPassword } from '../controllers/auth/forgetpassword.js';
import { verifyResetOtp } from '../controllers/auth/verifyresetotp.js';
import { resetPassword } from '../controllers/auth/resetpassword.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

router.get('/me', validateAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);


export default router;