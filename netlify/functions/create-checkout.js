const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { product_name, product_price, quantity, delivery, email, address } = JSON.parse(event.body);

  const lineItems = [{
    price_data: {
      currency: 'usd',
      product_data: { name: product_name },
      unit_amount: product_price,
    },
    quantity: quantity || 1,
  }];

  if (delivery === 'delivery') {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Home Delivery — Nassau, New Providence' },
        unit_amount: 5000,
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: email,
    metadata: {
      delivery_type: delivery,
      delivery_address: delivery === 'delivery' ? address : 'Pickup',
    },
    success_url: `https://sanclementeswisswater.com/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `https://sanclementeswisswater.com/#products`,
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: session.url }),
  };
};
