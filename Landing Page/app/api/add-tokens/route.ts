import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // The sessionId is actually a client secret
        // We need to extract the payment intent ID from it
        const paymentIntentId = sessionId.split('_secret_')[0];
        
        // Get the payment intent details from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (!paymentIntent) {
            return NextResponse.json(
                { error: 'Payment intent not found' },
                { status: 404 }
            );
        }

        // Check if payment was successful
        if (paymentIntent.status !== 'succeeded') {
            // If payment is still processing, wait a bit and check again
            if (paymentIntent.status === 'processing') {
                // Wait for 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Check the payment intent again
                const updatedPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                
                if (updatedPaymentIntent.status !== 'succeeded') {
                    return NextResponse.json(
                        { error: 'Payment is still processing. Please try again in a few moments.' },
                        { status: 400 }
                    );
                }
                
                // If we get here, the payment has succeeded after waiting
                paymentIntent.status = 'succeeded';
            } else {
                // Payment failed or was canceled
                return NextResponse.json(
                    { error: `Payment not completed. Status: ${paymentIntent.status}` },
                    { status: 400 }
                );
            }
        }

        const userId = paymentIntent.metadata?.userId;
        const priceId = paymentIntent.metadata?.priceId;

        if (!userId || !priceId) {
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
        const supabase = createClient();
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

        return NextResponse.json({ 
            success: true,
            tokensAdded: tokenAmount,
            newBalance: newTokenUsage.remaining
        });
    } catch (error) {
        console.error('Error processing token addition:', error);
        return NextResponse.json(
            { error: 'Error processing token addition' },
            { status: 500 }
        );
    }
} 