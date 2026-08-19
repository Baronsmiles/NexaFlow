import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import Navbar from '../../components/ui/Navbar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/button';
import Alert from '../../components/ui/alert';
import './dashboard.css';
import api from '../../utils/api';

const DRAFT_KEY = 'nexaflow_dashboard_draft';
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day

function loadDraft() {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    const isExpired = Date.now() - parsed.savedAt > DRAFT_MAX_AGE_MS;

    if (isExpired) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load dashboard draft:', error);
    localStorage.removeItem(DRAFT_KEY);
    return null;
  }
}

function Dashboard() {
  const [productData, setProductData] = useState(() => {
    const draft = loadDraft();
    return {
      productName: draft?.productName || '',
      price: draft?.price || '',
      image: draft?.image || null
    };
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const draftToSave = { ...productData, savedAt: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
  }, [productData]);

  const paymentMutation = useMutation({
    mutationFn: async (product) => {
      const response = await api.post('/payments/initialize', product, {
        withCredentials: true,
      });
      return response.data;
    },

    onSuccess: (data) => {
      localStorage.removeItem(DRAFT_KEY);
      setProductData({ productName: '', price: '', image: null });
      setSuccessMessage('Payment initialized! Redirecting to Paystack...');

      setTimeout(() => {
        window.location.href = data.authorizationUrl;
      }, 1500);
    },

    onError: (error) => {
      console.error('Payment error:', error);
      setFormError(error.response?.data?.message || 'Something went wrong while starting payment.');
    }
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  }

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be less than 5MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProductData((prev) => ({ ...prev, image: reader.result }));
      setErrors((prev) => ({ ...prev, image: '' }));
      setFormError('');
    };
    reader.readAsDataURL(file);
  }

  function validateForm() {
    const newErrors = {};

    if (!productData.productName.trim()) newErrors.productName = 'Product name is required.';

    if (!productData.price.trim()) {
      newErrors.price = 'Price is required.';
    } else if (Number(productData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0.';
    }

    if (!productData.image) newErrors.image = 'Product image is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    paymentMutation.mutate({
      productName: productData.productName,
      price: productData.price,
      image: productData.image
    });
  }

  return (
    <div className="dashboard-wrapper">
      <Navbar />

      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Create your product and place an order.</p>
        </div>

        <div className="dashboard-card">
          {formError && (
            <Alert type="error" message={formError} dismissible onClose={() => setFormError('')} />
          )}

          {successMessage && <Alert type="success" message={successMessage} />}

          <div className="dashboard-section">
            <h2>Product Details</h2>
            <p>Add the information for your product.</p>
          </div>

          <form className="dashboard-form" onSubmit={handleSubmit}>
            <div className="image-upload-group">
              <label className="form-label">Product Image</label>

              <label className="image-upload">
                <input type="file" accept="image/*" onChange={handleImageChange} />

                {productData.image ? (
                  <div className="image-preview">
                    <img src={productData.image} alt="Product preview" />
                  </div>
                ) : (
                  <div className="image-upload-content">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <strong>Upload product image</strong>
                    <span>PNG, JPG or WEBP</span>
                  </div>
                )}
              </label>

              {errors.image && <span className="input-error">{errors.image}</span>}
            </div>

            <Input
              label="Product Name"
              name="productName"
              type="text"
              placeholder="Enter product name"
              value={productData.productName}
              onChange={handleChange}
              error={errors.productName}
              required
            />

            <Input
              label="Price"
              name="price"
              type="number"
              placeholder="Enter product price"
              value={productData.price}
              onChange={handleChange}
              error={errors.price}
              required
            />

            <Button type="submit" loading={paymentMutation.isPending}>
              Place Order
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;