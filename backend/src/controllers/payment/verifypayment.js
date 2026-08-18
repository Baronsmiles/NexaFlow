import prisma from '../../config/prisma.js';
import { verifyTransaction } from '../../services/paystack.service.js';

export async function verifyPayment(req, res) {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required.'
      });
    }

    // 1. Verify transaction with Paystack
    const transaction = await verifyTransaction(reference);


    // 2. Make sure Paystack says the payment was successful
    if (transaction.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment was not successful.'
      });
    }

    // 3. Find the existing order using Paystack reference
    const order = await prisma.orderHistory.findUnique({
      where: {
        paymentReference: reference
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order associated with this payment was not found.'
      });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to verify this payment.'
      });
    }

    // 4. Update the order payment status
    const updatedOrder = await prisma.orderHistory.update({
      where: {
        id: order.id
      },
      data: {
        paymentStatus: 'SUCCESS'
      }
    });

    // 5. Send response to frontend
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      transaction,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Verify payment error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while verifying payment.'
    });
  }
}