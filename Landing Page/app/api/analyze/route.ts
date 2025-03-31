import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/services/analysisService';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        
        if (!data.content) {
            return NextResponse.json(
                { error: 'No content provided' },
                { status: 400 }
            );
        }

        const analysis = await analyzeDocument(data.content);
        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Error in analysis route:', error);
        return NextResponse.json(
            { error: 'Failed to analyze document' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
} 