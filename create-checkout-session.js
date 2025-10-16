
// Lệnh `npm install stripe` sẽ được Vercel tự động chạy
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // Chỉ cho phép phương thức POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }
    try {
        const { cart } = req.body;

        // Chuyển đổi dữ liệu giỏ hàng của cậu thành định dạng mà Stripe yêu cầu
        const line_items = cart.map(item => {
            return {
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.price, // Stripe tính giá bằng đơn vị nhỏ nhất (xu)
                },
                quantity: item.quantity,
            };
        });
        // Tạo một phiên thanh toán (Checkout Session)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Cho phép thanh toán bằng thẻ
            line_items: line_items,
            mode: 'payment',
            // URL để chuyển khách về sau khi thanh toán thành công hoặc thất bại
            success_url: `${req.headers.origin}/thanhtoan.html?success=true`,
            cancel_url: `${req.headers.origin}/thanhtoan.html?canceled=true`,
        });
        // Trả về ID của phiên để frontend có thể chuyển hướng
        res.status(200).json({ id: session.id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ statusCode: 500, message: err.message });
    }
};