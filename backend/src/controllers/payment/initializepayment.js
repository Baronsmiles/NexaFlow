import prisma from '../../config/prisma.js';
import { uploadProductImage } from '../../services/supabase.service.js';
import { initializeTransaction } from '../../services/paystack.service.js';

export async function initializePayment(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.'
      });
    }

    const { productName, price, image } = req.body;

    if (!productName || !price || !image) {
      return res.status(400).json({
        success: false,
        message: 'Product name, price, and image are required.'
      });
    }

    const amount = Number(price);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0.'
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const imageUrl = await uploadProductImage(
      image,
      productName
    );

    const { authorizationUrl, reference } =
      await initializeTransaction({
        email: user.email,
        amount,
        metadata: {
          userId: user.id,
          productName: productName.trim(),
          price: amount,
          imageUrl
        }
      });

    const order = await prisma.orderHistory.create({
      data: {
        userId: user.id,
        productName,
        price: Number(price),
        imageUrl,
        paymentReference: reference,
        paymentStatus: 'PENDING'
      }
    });


    return res.status(200).json({
      success: true,
      message: 'Payment initialized successfully.',
      authorizationUrl,
      reference,
      orderId: order.id
    });

  } catch (error) {
    console.error('Initialize payment error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while initializing payment.'
    });
  }
}