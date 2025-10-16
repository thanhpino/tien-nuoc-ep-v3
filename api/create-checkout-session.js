// File: /api/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { cart } = req.body;

        // DÒNG MỚI SỐ 1: In ra để xem giỏ hàng nhận được
        console.log('--- Received Cart Data ---', JSON.stringify(cart, null, 2));

        const line_items = cart.map(item => {
            return {
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: item.name,
                    },
                    // Stripe yêu cầu giá phải là một số nguyên
                    unit_amount: parseInt(item.price, 10),
                },
                quantity: item.quantity,
            };
        });

        // DÒNG MỚI SỐ 2: In ra để xem dữ liệu sẽ gửi cho Stripe
        console.log('--- Sending to Stripe ---', JSON.stringify(line_items, null, 2));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `${req.headers.origin}/thanhtoan.html?success=true`,
            cancel_url: `${req.headers.origin}/thanhtoan.html?canceled=true`,
        });

        res.status(200).json({ id: session.id });

    } catch (err) {
        // In ra lỗi chi tiết từ Stripe
        console.error('--- Stripe Error ---', err);
        res.status(500).json({ statusCode: 500, message: err.message });
    }
};
