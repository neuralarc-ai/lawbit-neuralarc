import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        let event: Stripe.Event;

        // Skip signature verification in development
        if (process.env.NODE_ENV === 'development') {
            event = JSON.parse(body) as Stripe.Event;
        } else {
            try {
                event = stripe.webhooks.constructEvent(
                    body,
                    signature!,
                    process.env.STRIPE_WEBHOOK_SECRET!
                );
            } catch (err) {
                console.error('Webhook signature verification failed:', err);
                return NextResponse.json(
                    { error: 'Webhook signature verification failed' },
                    { status: 400 }
                );
            }
        }

        const supabase = createClient();

        // Handle payment intent succeeded event
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const userId = paymentIntent.metadata?.userId;
            const priceId = paymentIntent.metadata?.priceId;

            if (!userId || !priceId) {
                console.error('Missing metadata in payment intent:', paymentIntent);
                return NextResponse.json(
                    { error: 'Missing metadata in payment intent' },
                    { status: 400 }
                );
            }

            // Determine token amount based on price ID
            let tokenAmount = 0;
            if (priceId === process.env.NEXT_PUBLIC_LAWBIT_PLUS_PRODUCT_ID) {
                tokenAmount = 250000; // Plus plan: 250,000 tokens
            } else if (priceId === process.env.NEXT_PUBLIC_LAWBIT_ULTA_PRODUCT_ID) {
                tokenAmount = 600000; // Ultra plan: 600,000 tokens
            }

            // Get current token usage
            const { data: tokenData, error: tokenError } = await supabase
                .from('users')
                .select('token_usage')
                .eq('id', userId)
                .single();

            if (tokenError && tokenError.code !== 'PGRST116') {
                console.error('Error fetching token usage:', tokenError);
                return NextResponse.json(
                    { error: 'Error fetching token usage' },
                    { status: 500 }
                );
            }

            // Calculate new token balance
            let newTokenUsage;
            if (!tokenData?.token_usage) {
                // Create new token usage object
                newTokenUsage = {
                    total: tokenAmount,
                    limit: tokenAmount,
                    remaining: tokenAmount,
                    last_reset: new Date().toISOString()
                };
            } else {
                // Add to existing token usage
                const currentUsage = tokenData.token_usage;
                newTokenUsage = {
                    total: (currentUsage.total || 0) + tokenAmount,
                    limit: (currentUsage.limit || 0) + tokenAmount,
                    remaining: (currentUsage.remaining || 0) + tokenAmount,
                    last_reset: currentUsage.last_reset || new Date().toISOString()
                };
            }

            // Update user's token usage in Supabase
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    token_usage: newTokenUsage,
                    subscription_status: priceId === process.env.NEXT_PUBLIC_LAWBIT_ULTA_PRODUCT_ID ? 'ultra' : 'plus',
                    subscription_id: paymentIntent.id,
                })
                .eq('id', userId);

            if (updateError) {
                console.error('Error updating user tokens:', updateError);
                return NextResponse.json(
                    { error: 'Error updating user tokens' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Error processing webhook' },
            { status: 500 }
        );
    }
} 