import crypto from 'crypto';
import prisma from '../../config/prisma.js';

export async function paystackWebhook(req, res) {
  try {
    const signature = req.headers['x-paystack-signature'];

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature.'
      });
    }

    const event = req.body;

    if (event.event === 'charge.success') {

      const reference =
        event.data.reference;

      const order =
        await prisma.orderHistory.findUnique({
          where: {
            paymentReference: reference
          }
        });

      if (!order) {
        return res.sendStatus(200);
      }

      if (
        order.paymentStatus === 'SUCCESS'
      ) {
        return res.sendStatus(200);
      }

      await prisma.orderHistory.update({
        where: {
          id: order.id
        },
        data: {
          paymentStatus: 'SUCCESS'
        }
      });

    }

    return res.sendStatus(200);

  } catch (error) {
    console.error('Webhook error:', error);
    return res.sendStatus(500);
  }
}