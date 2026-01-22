
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Stripe API key is not configured.' });
  }

  try {
    const { cart } = req.body;
    
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 商品マスターデータ (サーバーサイドで管理)
    const PRODUCTS = {
      'onigiri': { name: '手造り肉巻きおにぎり棒 (2本入)', price: 1080 },
      'butasuki': { name: '豚すき丼の素 (2食分)', price: 864 },
      'tarot_premium': { name: 'タロットプレミアム (30回分)', price: 1000 }
    };

    const line_items = cart.map(item => {
      const product = PRODUCTS[item.id];
      if (!product) throw new Error(`Invalid product ID: ${item.id}`);
      
      return {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: product.name,
          },
          unit_amount: product.price,
        },
        quantity: item.count,
      };
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/member?payment=success&product=tarot`,
      cancel_url: `${req.headers.origin}/member?payment=canceled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}
