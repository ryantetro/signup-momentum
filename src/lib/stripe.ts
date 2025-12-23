import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    appInfo: {
        name: 'Signup Momentum',
        version: '0.1.0'
    }
})
