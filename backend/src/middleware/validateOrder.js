export function validateOrder(req, res, next) {
  const { productName, price, image } = req.body;

  const errors = {};

  if (!productName || typeof productName !== 'string' || !productName.trim()) {
    errors.productName = 'Product name is required.';
  }

  if (
    price === undefined ||
    price === null ||
    price === '' ||
    Number.isNaN(Number(price)) ||
    Number(price) <= 0
  ) {
    errors.price = 'Price must be greater than 0.';
  }

  if (!image) {
    errors.image = 'Product image is required.';
  }


  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order inputs.',
      errors
    });
  }

  next();
}