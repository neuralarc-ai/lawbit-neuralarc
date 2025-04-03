import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
    try {
        const { priceId, userId } = await req.json();

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price ID is required' },
                { status: 400 }
            );
        }

        // Get the price details from Stripe
        const price = await stripe.prices.retrieve(priceId);
        
        if (!price) {
            return NextResponse.json(
                { error: 'Price not found' },
                { status: 404 }
            );
        }

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price.unit_amount || 0,
            currency: price.currency,
            automatic_payment_methods: {
                enabled: true,
            },
            setup_future_usage: 'off_session',
            metadata: {
                userId: userId || 'anonymous',
                priceId: priceId,
            },
        });

        // Create a client secret for the payment intent
        const clientSecret = paymentIntent.client_secret;
        
        if (!clientSecret) {
            return NextResponse.json(
                { error: 'Failed to create client secret' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            clientSecret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: 'Error creating payment intent' },
            { status: 500 }
        );
    }
} 