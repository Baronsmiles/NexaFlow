import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import Navbar from '../../components/ui/Navbar';
import Modal from '../../components/ui/model';
import Alert from '../../components/ui/alert';
import './OrderHistory.css';

function OrderHistory() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formError, setFormError] = useState('');

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders/history', { withCredentials: true });
      return response.data.orders || [];
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      await api.delete(`/orders/${orderId}`, { withCredentials: true });
    },
    onSuccess: (_, deletedOrderId) => {
      queryClient.setQueryData(['orders'], (oldOrders = []) =>
        oldOrders.filter((order) => order.id !== deletedOrderId)
      );
      setSelectedOrder(null);
    },
    onError: (error) => {
      console.error('Delete order error:', error);
      setFormError(error.response?.data?.message || 'Something went wrong while deleting the order.');
      setSelectedOrder(null);
    }
  });

  function handleDeleteClick(order) {
    setFormError('');
    setSelectedOrder(order);
  }

  function handleCloseModal() {
    if (deleteOrderMutation.isPending) return;
    setSelectedOrder(null);
  }

  function handleConfirmDelete() {
    if (!selectedOrder) return;
    deleteOrderMutation.mutate(selectedOrder.id);
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (isError) {
    return (
      <div className="order-history-wrapper">
        <Navbar />
        <main className="order-history-page">
          <div className="order-history-header">
            <h1>Order History</h1>
            <p>View and manage your previous orders.</p>
          </div>
          <Alert type="error" message="Something went wrong while loading your orders." />
        </main>
      </div>
    );
  }

  return (
    <div className="order-history-wrapper">
      <Navbar />
      <main className="order-history-page">
        <div className="order-history-header">
          <h1>Order History</h1>
          <p>View and manage your previous orders.</p>
        </div>

        {formError && (
          <Alert type="error" message={formError} dismissible onClose={() => setFormError('')} />
        )}

        {isLoading ? (
          <div className="empty-orders">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <h2>Loading orders...</h2>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <i className="fa-solid fa-box-open"></i>
            <h2>No orders yet</h2>
            <p>Your completed orders will appear here.</p>
          </div>
        ) : (
          <div className="orders-card">
            <div className="orders-table-header">
              <span>Product</span>
              <span>Price</span>
              <span>Date</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {orders.map((order) => (
              <div className="order-row" key={order.id}>
                <div className="order-product">
                  <div className="order-image">
                    {order.imageUrl ? (
                      <img src={order.imageUrl} alt={order.productName} />
                    ) : (
                      <i className="fa-solid fa-image"></i>
                    )}
                  </div>
                  <span>{order.productName}</span>
                </div>

                <span className="order-price">₦{Number(order.price).toLocaleString()}</span>
                <span className="order-date">{formatDate(order.createdAt)}</span>
                <span className={`order-status ${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>

                <button type="button" className="delete-order-btn" onClick={() => handleDeleteClick(order)}>
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={Boolean(selectedOrder)} onClose={handleCloseModal} title="Delete Order">
        <div className="delete-order-modal">
          <p>Are you sure you want to delete this order?</p>
          {selectedOrder && <strong>{selectedOrder.productName}</strong>}

          <div className="delete-order-actions">
            <button
              type="button"
              className="cancel-delete-btn"
              onClick={handleCloseModal}
              disabled={deleteOrderMutation.isPending}
            >
              Cancel
            </button>

            <button
              type="button"
              className="confirm-delete-btn"
              onClick={handleConfirmDelete}
              disabled={deleteOrderMutation.isPending}
            >
              {deleteOrderMutation.isPending ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Deleting...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-trash"></i> Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default OrderHistory;