import prisma from '../../config/prisma.js';

export async function getOrderHistory(req, res) {
  try {

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.'
      });
    }
    const userId = req.user.id;

    const orders = await prisma.orderHistory.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get order history error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while getting order history.'
    });
  }
}