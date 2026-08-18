import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Navbar from '../../components/ui/Navbar';
import Modal from '../../components/ui/model';
import Alert from '../../components/ui/alert';
import './OrderHistory.css';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  async function fetchOrderHistory() {
    setIsLoading(true);
    setFormError('');

    try {
      const response = await api.get(
        '/orders/history',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          withCredentials: true
        }
      );

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Order history error:', error);

      setFormError(
        error.response?.data?.message ||
        'Something went wrong while loading your orders.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleDeleteClick(order) {
    setSelectedOrder(order);
  }

  function handleCloseModal() {
    setSelectedOrder(null);
  }

  async function handleConfirmDelete() {
    if (!selectedOrder) return;

    setIsDeleting(true);
    setFormError('');

    try {
      await api.delete(
        `/orders/${selectedOrder.id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      setOrders((prevOrders) =>
        prevOrders.filter(
          (order) => order.id !== selectedOrder.id
        )
      );

      setSelectedOrder(null);

    } catch (error) {
      console.error('Delete order error:', error);

      setFormError(
        error.response?.data?.message ||
        'Something went wrong while deleting the order.'
      );

      setSelectedOrder(null);
    } finally {
      setIsDeleting(false);
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  return (
    <div className="order-history-wrapper">
      <Navbar />

      <main className="order-history-page">

        <div className="order-history-header">
          <h1>Order History</h1>

          <p>
            View and manage your previous orders.
          </p>
        </div>

        {formError && (
          <Alert
            type="error"
            message={formError}
            dismissible
            onClose={() => setFormError('')}
          />
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

            <p>
              Your completed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="orders-card">

            {/* Desktop table header */}
            <div className="orders-table-header">
              <span>Product</span>
              <span>Price</span>
              <span>Date</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {orders.map((order) => (
              <div
                className="order-row"
                key={order.id}
              >
                <div className="order-product">
                  <div className="order-image">
                    {order.imageUrl ? (
                      <img
                        src={order.imageUrl}
                        alt={order.productName}
                      />
                    ) : (
                      <i className="fa-solid fa-image"></i>
                    )}
                  </div>

                  <span>
                    {order.productName}
                  </span>
                </div>

                <span className="order-price">
                  ₦{Number(order.price).toLocaleString()}
                </span>

                <span className="order-date">
                  {formatDate(order.createdAt)}
                </span>

                <span className={`order-status ${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>

                <button
                  type="button"
                  className="delete-order-btn"
                  onClick={() => handleDeleteClick(order)}
                >
                  <i className="fa-solid fa-trash"></i>
                  Delete
                </button>
              </div>
            ))}

          </div>
        )}

      </main>

      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={handleCloseModal}
        title="Delete Order"
      >
        <div className="delete-order-modal">

          <p>
            Are you sure you want to delete this order?
          </p>

          {selectedOrder && (
            <strong>
              {selectedOrder.productName}
            </strong>
          )}

          <div className="delete-order-actions">

            <button
              type="button"
              className="cancel-delete-btn"
              onClick={handleCloseModal}
            >
              Cancel
            </button>

            <button
              type="button"
              className="confirm-delete-btn"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Deleting...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-trash"></i>
                  Delete
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