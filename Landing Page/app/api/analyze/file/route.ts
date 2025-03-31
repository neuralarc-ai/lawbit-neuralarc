import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/services/analysisService';

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        
        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: 'No file provided or invalid file' },
                { status: 400 }
            );
        }

        // Read the file content
        const content = await file.text();
        
        // Analyze the content
        const analysis = await analyzeDocument(content);
        
        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Error in file analysis route:', error);
        return NextResponse.json(
            { error: 'Failed to analyze file', details: error instanceof Error ? error.message : 'Unknown error' },
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