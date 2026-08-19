import api from '../utils/api';

export async function getOrderHistory() {
  const response = await api.get('/orders/history');

  return response.data.orders || [];
}

export async function deleteOrder(orderId) {
  const response = await api.delete(`/orders/${orderId}`);

  return response.data;
}