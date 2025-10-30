import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session_id = req.query.session_id as string;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const email = session.customer_details?.email;
    if (!email) return res.status(404).json({ error: 'Email not found in session.' });
    const { data: user } = await supabase
      .from('users')
      .select('api_key')
      .eq('email', email)
      .maybeSingle();
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json({ api_key: user.api_key });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
