import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

const PLAN_TO_PRICE_ENV: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { plan } = req.body || {};
    if (!plan) return res.status(400).json({ error: 'Missing plan' });

    const priceId = PLAN_TO_PRICE_ENV[plan];
    if (!priceId)
      return res.status(400).json({ error: `Price ID not configured for plan: ${plan}` });

    // Best-effort detection of base URL
    const baseUrl = req.headers['origin'] || `https://${req.headers['host']}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: { plan },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating Stripe session:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
