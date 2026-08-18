import prisma from '../../config/prisma.js';
import { uploadProductImage } from '../../services/supabase.service.js';

export async function createOrder(req, res) {
  try {
    const { productName, price, image } = req.body;

    const userId = req.user.id;

    const fileName = `${userId}-${Date.now()}.jpg`;

    const imageUrl = await uploadProductImage(
      image,
      fileName
    );

    const order = await prisma.orderHistory.create({
      data: {
        userId,
        productName: productName.trim(),
        price: Number(price),
        imageUrl
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create order.'
    });
  }
}