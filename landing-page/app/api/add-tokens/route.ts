import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil'
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
        let newTotal = 0;
        if (priceId === process.env.NEXT_PUBLIC_LAWBIT_PLUS_PRODUCT_ID) {
            newTotal = 300000; // Plus plan: 300,000 tokens
        } else if (priceId === process.env.NEXT_PUBLIC_LAWBIT_ULTRA_PRODUCT_ID) {
            newTotal = 650000; // Ultra plan: 650,000 tokens
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
        let currentUsage = {
            total: 0,
            used: 0,
            remaining: 0,
            last_reset: new Date().toISOString()
        };

        if (tokenData?.token_usage) {
            currentUsage = {
                total: tokenData.token_usage.total || 0,
                used: tokenData.token_usage.used || 0,
                remaining: tokenData.token_usage.remaining || 0,
                last_reset: tokenData.token_usage.last_reset || new Date().toISOString()
            };
        }

        // Calculate new token usage
        const newTokenUsage = {
            total: newTotal, // Set to new plan total
            used: currentUsage.used, // Keep used tokens the same
            remaining: newTotal - currentUsage.used, // Calculate remaining as: total - used
            last_reset: currentUsage.last_reset
        };

        // Update token usage in Supabase
        const { error: updateError } = await supabase
            .from('users')
            .update({
                token_usage: newTokenUsage
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
            tokensAdded: newTokenUsage.remaining - currentUsage.remaining,
            newBalance: newTokenUsage.remaining,
            newTotal: newTokenUsage.total,
            usedTokens: newTokenUsage.used
        });
    } catch (error) {
        console.error('Error processing token addition:', error);
        return NextResponse.json(
            { error: 'Error processing token addition' },
            { status: 500 }
        );
    }
} 