import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil'
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

        // Verify the price exists
        const price = await stripe.prices.retrieve(priceId);
        if (!price) {
            return NextResponse.json(
                { error: 'Invalid price ID' },
                { status: 400 }
            );
        }

        // Create the payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price.unit_amount ?? 0, // Provide default value to handle null
            currency: price.currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId,
                priceId,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create payment intent' },
            { status: 500 }
        );
    }
} 