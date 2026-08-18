import express from 'express';
import { validateAuth } from '../middleware/validateAuth.js';
import { validateOrder } from '../middleware/validateOrder.js';
import { createOrder } from '../controllers/order/createorder.js';
import { getOrderHistory } from '../controllers/order/getorderhistory.js';
import { deleteOrder } from '../controllers/order/deleteorder.js';

const router = express.Router();

router.post(
  '/',
  validateAuth,
  validateOrder,
  createOrder
);

router.get(
  '/history',
  validateAuth,
  getOrderHistory
);

router.delete(
  '/:id',
  validateAuth,
  deleteOrder
);


export default router;