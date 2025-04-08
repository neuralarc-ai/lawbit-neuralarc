import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        // Check for API key
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('Gemini API key is not configured');
        }

        const body = await request.json();
        const { contractType, firstPartyName, secondPartyName, jurisdiction, keyTerms, description, intensity, preference } = body;

        // Create prompt for contract generation
        const prompt = `Generate a professional legal draft with the following specifications:
        Contract Type: ${contractType}
        First Party: ${firstPartyName}
        Second Party: ${secondPartyName}
        Jurisdiction: ${jurisdiction}
        Key Terms: ${keyTerms}
        Description: ${description}
        Intensity Level: ${intensity}
        Preference: ${preference}

        IMPORTANT FORMATTING INSTRUCTIONS:
        1. DO NOT use any markdown symbols (*, #, -, etc.)
        2. Use proper legal drafting formatting with clear section headings in CAPITAL LETTERS
        3. Use proper indentation and spacing (4 spaces for each level)
        4. Use proper legal numbering system (1.1, 1.1.1, etc.)
        5. Use proper legal language based on the intensity level
        6. Include proper date formatting (Date of Agreement)
        7. Use proper party definitions and references
        8. Include proper signature blocks
        9. Use proper legal draft structure:
           TITLE 
           PARTIES 
           RECITALS
           DEFINITIONS
           MAIN BODY
           SIGNATURES
        10. Use proper legal document styling:
            - Section headings in CAPITAL LETTERS
            - Proper paragraph spacing
            - Proper indentation
            - Clear section breaks
            - Professional legal language

        Format the contract as a professional legal document with proper spacing, indentation, and structure. Ensure there are no markdown symbols or special characters.`;

        // Select model based on preference
        const modelName = preference === 'Option A' ? 'gemini-2.0-flash' : 'gemini-2.0-flash-lite';
        const model = genAI.getGenerativeModel({ model: modelName });
        const geminiResponse = await model.generateContent(prompt);
        const geminiText = geminiResponse.response.text();

        // Format the response
        const contract = {
            content: geminiText,
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(contract);
    } catch (error: any) {
        console.error('Error generating contract:', error);
        
        // Handle specific error types
        if (error.code === 'invalid_api_key') {
            return NextResponse.json(
                { error: 'Invalid API key. Please check your environment variables.' },
                { status: 401 }
            );
        }
        
        return NextResponse.json(
            { error: error.message || 'Failed to generate contract' },
            { status: 500 }
        );
    }
} 