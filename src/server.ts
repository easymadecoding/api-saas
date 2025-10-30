import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS (allow all in dev)
app.use(cors());
app.use(express.json());

// Static files from public
const publicDir = path.join(process.cwd(), 'public');
app.use(express.static(publicDir));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Stripe initialization
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. The checkout endpoint will fail until you add it to .env');
}
const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2024-06-20',
});

// Map plan -> price id via env
const PLAN_TO_PRICE_ENV: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

app.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { plan } = req.body as { plan?: string };
    if (!plan) {
      return res.status(400).json({ error: 'Missing plan' });
    }

    const priceId = PLAN_TO_PRICE_ENV[plan];
    if (!priceId) {
      return res.status(400).json({ error: `Price ID not configured for plan: ${plan}` });
    }

    if (!stripeSecretKey) {
      return res.status(500).json({ error: 'Stripe not configured on server' });
    }

    const protocol = req.headers['x-forwarded-proto']?.toString() || 'http';
    const host = req.headers['x-forwarded-host']?.toString() || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: { plan },
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

// Serve fallback to index.html for root
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Success and Cancel routes (static files in public)
app.get('/success', (_req, res) => {
  res.sendFile(path.join(publicDir, 'success.html'));
});
app.get('/cancel', (_req, res) => {
  res.sendFile(path.join(publicDir, 'cancel.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


