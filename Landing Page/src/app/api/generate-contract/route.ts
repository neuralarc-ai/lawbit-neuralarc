import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { contractType, firstPartyName, secondPartyName, jurisdiction, keyTerms, description, intensity, preference } = body;

        // Create prompt for contract generation
        const prompt = `Generate a legal contract with the following specifications:
        Contract Type: ${contractType}
        First Party: ${firstPartyName}
        Second Party: ${secondPartyName}
        Jurisdiction: ${jurisdiction}
        Key Terms: ${keyTerms}
        Description: ${description}
        Intensity Level: ${intensity}
        Preference: ${preference}

        Please generate a professional legal contract that includes:
        1. Proper legal formatting and structure
        2. All necessary legal clauses based on the contract type
        3. Specific terms and conditions based on the provided description
        4. Appropriate legal language based on the intensity level
        5. Jurisdiction-specific requirements
        6. Clear party definitions and obligations`;

        // Generate contract using OpenAI
        const openaiResponse = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are a professional legal contract generator. Generate clear, legally sound contracts based on the provided specifications."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        // Generate contract using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const geminiResponse = await model.generateContent(prompt);
        const geminiText = geminiResponse.response.text();

        // Combine and format the responses
        const combinedContract = {
            openaiVersion: openaiResponse.choices[0].message.content,
            geminiVersion: geminiText,
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(combinedContract);
    } catch (error) {
        console.error('Error generating contract:', error);
        return NextResponse.json(
            { error: 'Failed to generate contract' },
            { status: 500 }
        );
    }
} 