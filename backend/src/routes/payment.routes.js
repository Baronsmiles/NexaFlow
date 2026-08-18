import express from 'express';
import { initializePayment } from '../controllers/payment/initializepayment.js';
import { validateAuth } from '../middleware/validateAuth.js';
import { verifyPayment } from '../controllers/payment/verifypayment.js';
import { paystackWebhook } from '../controllers/payment/webhook.js';

const router = express.Router();

router.post(
  '/initialize',
  validateAuth,
  initializePayment
);

router.get(
  '/verify',
  validateAuth,
  verifyPayment
);


router.post(
  '/webhook',
  paystackWebhook
);

export default router;