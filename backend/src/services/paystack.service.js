import axios from 'axios';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export async function initializeTransaction({ email, amount, metadata }) {
  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: Math.round(amount * 100), // Paystack expects kobo, not naira
      metadata,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    }
  );

  return {
    authorizationUrl: response.data.data.authorization_url,
    reference: response.data.data.reference
  };
}

export async function verifyTransaction(reference) {
  const response = await axios.get(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    }
  );

  return response.data.data;
}