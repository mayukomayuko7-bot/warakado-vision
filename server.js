
const express = require('express');
const path = require('path');
// 実際の運用では環境変数からキーを取得してください
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// デモ用にダミーのStripeインスタンス動作をシミュレートする場合のフォールバック
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

const app = express();
const PORT = process.env.PORT || 3000;

// JSONボディのパース
app.use(express.json());

// 静的ファイルの配信 (ビルド後のファイルを配信する設定)
app.use(express.static('.'));

// 商品マスターデータ (サーバーサイドで価格を管理し改ざんを防止)
const PRODUCTS = {
  'onigiri': { name: '手造り肉巻きおにぎり棒 (2本入)', price: 1080 },
  'butasuki': { name: '豚すき丼の素 (2食分)', price: 864 }
};

// Stripe Checkout Session作成API
app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe API key is not configured on the server.' });
  }

  try {
    const { cart } = req.body;
    
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

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
      success_url: `${req.headers.origin}/?payment=success`,
      cancel_url: `${req.headers.origin}/?payment=canceled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// SPAのためのフォールバックルーティング
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
