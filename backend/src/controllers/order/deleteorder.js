import prisma from '../../config/prisma.js';
import { deleteProductImage } from '../../services/supabase.service.js';

export async function deleteOrder(req, res) {
  try {
    const orderId = Number(req.params.id);
    const userId = req.user.id;

    if (Number.isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.'
      });
    }

    const order = await prisma.orderHistory.findFirst({
      where: {
        id: orderId,
        userId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (order.imageUrl) {
      await deleteProductImage(order.imageUrl);
    }

    await prisma.orderHistory.delete({
      where: {
        id: orderId
      }
    });

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully.'
    });

  } catch (error) {
    console.error('Delete order error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete order.'
    });
  }
}