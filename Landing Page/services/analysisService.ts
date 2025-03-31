import { GoogleGenerativeAI } from '@google/generative-ai';
import * as mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';

// Initialize Gemini API with error checking
const initializeGeminiAPI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not found. Please check your environment variables.');
    }
    return new GoogleGenerativeAI(apiKey);
};

const genAI = initializeGeminiAPI();

export interface SuggestedAlternative {
    id: number;
    text: string;
    description?: string; // Added description for why this will resolve the clause
}

export interface ClauseAnalysis {
    title: string;
    riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk';
    extractedText: string;
    suggestedAlternatives: SuggestedAlternative[];
    text?: string; // Summary or description text
}

export interface AnalysisResponse {
    documentInfo: {
        title: string;
        dateTime: string;
        riskAssessment: 'High Risk' | 'Medium Risk' | 'Low Risk';
        keyStatistics: {
            highRiskItems: number;
            clausesIdentified: number;
            riskScore: number; // Add risk score property
        };
        jurisdiction: string;
        previewText?: string; // Add optional preview text
    };
    clauses: ClauseAnalysis[]; // Array of analyzed clauses
}

async function extractTextFromFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const fileType = file.type;

    try {
        switch (fileType) {
            case 'application/pdf':
                const pdfDoc = await PDFDocument.load(buffer);
                let text = '';
                // For PDF-lib, we don't have direct text extraction
                // Instead, return a placeholder message
                return `[PDF content extracted - ${pdfDoc.getPageCount()} pages]`;

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            case 'application/msword':
                const result = await mammoth.extractRawText({ arrayBuffer: buffer });
                return result.value;

            case 'text/plain':
                return new TextDecoder().decode(buffer);

            default:
                throw new Error('Unsupported file type');
        }
    } catch (error) {
        console.error('Error extracting text:', error);
        throw new Error('Failed to extract text from file');
    }
}

export async function analyzeDocument(content: string): Promise<AnalysisResponse> {
    try {
        if (!content || typeof content !== 'string') {
            throw new Error('Invalid content provided for analysis');
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.3,
                topP: 0.8,
                topK: 40,
            }
        });

        const prompt = `You are a legal document analyzer. Analyze the following document and provide a structured analysis in valid JSON format.

The response MUST follow this exact structure and be valid JSON:

{
    "documentInfo": {
        "title": "Document Title",
        "dateTime": "${new Date().toISOString()}",
        "riskAssessment": "Medium Risk",
        "keyStatistics": {
            "highRiskItems": 0,
            "clausesIdentified": 0
        },
        "jurisdiction": "Jurisdiction Name"
    },
    "clauses": [
        {
            "title": "Termination Clause",
            "text": "The full text of the clause",
            "extractedText": "Critical text extracted from the clause",
            "riskLevel": "High Risk",
            "suggestedAlternatives": [
                {
                    "id": 1,
                    "text": "Alternative text that would resolve the issue",
                    "description": "Brief explanation of why this resolves the issue"
                },
                {
                    "id": 2,
                    "text": "Another suggested alternative",
                    "description": "Brief explanation of why this resolves the issue"
                },
                {
                    "id": 3,
                    "text": "Third alternative if applicable",
                    "description": "Brief explanation of why this resolves the issue"
                }
            ]
        },
        {
            "title": "Jurisdiction Clause",
            "text": "The full text of the clause",
            "extractedText": "Critical text extracted from the clause",
            "riskLevel": "Medium Risk",
            "suggestedAlternatives": [
                {
                    "id": 1,
                    "text": "Alternative text that would resolve the issue",
                    "description": "Brief explanation of why this resolves the issue"
                },
                {
                    "id": 2,
                    "text": "Another suggested alternative",
                    "description": "Brief explanation of why this resolves the issue"
                }
            ]
        }
    ]
}

Analyze for:
1. Overall risk level (Low/Medium/High Risk)
2. Problematic clauses (find at least 3 important clauses)
3. Jurisdiction and governing law
4. Legal compliance issues
5. Unclear language
6. Missing clauses
7. Unfair terms
8. For each clause, provide at least 2-3 alternative phrasings with explanations of why they resolve the issue

For each identified clause, classify risk as:
- High Risk (red): Clauses that could invalidate the contract, have serious legal consequences, or heavily favor one party
- Medium Risk (orange): Clauses with ambiguities, potential for disputes, or moderate imbalance
- Low Risk (yellow): Minor issues, slight ambiguities, or places where improvements could be made

Color-code the risk levels appropriately in the response.

Document to analyze:
${content}

Return ONLY valid JSON matching the above structure.`;

        const result = await model.generateContent(prompt);
        if (!result.response) {
            throw new Error('No response received from the AI model');
        }
        
        const analysisText = result.response.text();
        if (!analysisText) {
            throw new Error('No analysis generated from the AI model');
        }

        // Parse the response into structured format
        let analysis: AnalysisResponse;
        try {
            // Remove any markdown code block markers if present
            const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim();
            analysis = JSON.parse(cleanJson);
            
            // Ensure the response matches our interface
            if (!analysis.documentInfo) {
                throw new Error('Invalid analysis format: missing documentInfo');
            }

            // Add current date if missing
            if (!analysis.documentInfo.dateTime) {
                analysis.documentInfo.dateTime = new Date().toISOString();
            }
            
            // Ensure clauses array exists
            if (!analysis.clauses || !Array.isArray(analysis.clauses)) {
                analysis.clauses = [];
            }
            
            // Ensure each clause has all required fields
            analysis.clauses = analysis.clauses.map(clause => {
                if (!clause.suggestedAlternatives || !Array.isArray(clause.suggestedAlternatives)) {
                    clause.suggestedAlternatives = [];
                }
                
                // Ensure risk levels are valid
                if (!['Low Risk', 'Medium Risk', 'High Risk'].includes(clause.riskLevel)) {
                    clause.riskLevel = 'Medium Risk';
                }
                
                return clause;
            });
            
            // Ensure risk level is valid
            if (!['Low Risk', 'Medium Risk', 'High Risk'].includes(analysis.documentInfo.riskAssessment)) {
                analysis.documentInfo.riskAssessment = 'Medium Risk';
            }
            
        } catch (error) {
            console.error('Error parsing analysis:', error);
            console.error('Raw analysis text:', analysisText);
            throw new Error('Failed to parse analysis response');
        }

        return analysis;
    } catch (error) {
        console.error('Error analyzing document:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to analyze document');
    }
}

export async function analyzeFile(file: File): Promise<AnalysisResponse> {
    try {
        const content = await extractTextFromFile(file);
        return analyzeDocument(content);
    } catch (error) {
        console.error('Error reading file:', error);
        throw new Error('Failed to read file');
    }
} 