import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export const config = {
  api: {
    bodyParser: false,
  },
};

function generateApiKey() {
  return [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).send('Missing Stripe signature header');
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    const rawBody = (await buffer(req)).toString();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret!);
  } catch (err: any) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Handle checkout.session.completed: create/enable user
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email;
    if (!customerEmail) return res.status(400).send('Missing customer email');

    // Check if user exists
    // Must select all fields you'll use (here: id, api_key)
    const { data: existing, error: selectErr } = await supabase
      .from('users')
      .select('id, api_key')
      .eq('email', customerEmail)
      .maybeSingle();

    let apiKey;
    if (existing) {
      // If user exists, reactivate and keep API key
      apiKey = existing.api_key;
      const { error: updateErr } = await supabase
        .from('users')
        .update({ is_enabled: true })
        .eq('id', existing.id);
      if (updateErr) return res.status(500).send('Supabase update error: ' + updateErr.message);
    } else {
      // Otherwise, create with a new API key
      apiKey = generateApiKey();
      const { error: insertErr } = await supabase
        .from('users')
        .insert({ email: customerEmail, api_key: apiKey, is_enabled: true });
      if (insertErr) return res.status(500).send('Supabase insert error: ' + insertErr.message);
    }
    return res.status(200).send('User stored');
  }

  // Handle subscription cancellation/expiration (disable user)
  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'customer.subscription.updated' && event.data.object.status !== 'active'
  ) {
    // Get the customer from the subscription
    const sub = event.data.object;
    const customerId = String(sub.customer);
    // Look up session for latest email
    const customer = await stripe.customers.retrieve(customerId);
    const email = (customer as any).email;
    if (email) {
      const { error: updateErr } = await supabase
        .from('users')
        .update({ is_enabled: false })
        .eq('email', email);
      if (updateErr) return res.status(500).send('Supabase update error: ' + updateErr.message);
      return res.status(200).send('User disabled');
    }
  }

  res.status(200).send('Webhook received');
}
