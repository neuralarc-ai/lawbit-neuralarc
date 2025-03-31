import { GoogleGenerativeAI } from '@google/generative-ai';
import * as mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Initialize Gemini API with error checking
const initializeGeminiAPI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not found. Please check your environment variables.');
    }
    return new GoogleGenerativeAI(apiKey);
};

const genAI = initializeGeminiAPI();

export interface AnalysisResponse {
    documentInfo: {
        title: string;
        dateTime: string;
        riskAssessment: 'Low Risk' | 'Medium Risk' | 'High Risk';
        keyStatistics: {
            highRiskItems: number;
            clausesIdentified: number;
        };
        jurisdiction: string;
    };
    jurisdictionClause: {
        text: string;
        riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
    };
    extractedText: string;
    suggestedAlternatives: Array<{
        id: number;
        text: string;
    }>;
}

async function extractTextFromFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const fileType = file.type;

    try {
        switch (fileType) {
            case 'application/pdf':
                const pdfData = new Uint8Array(buffer);
                const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                const pdf = await loadingTask.promise;
                let text = '';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const strings = content.items.map((item: any) => item.str);
                    text += strings.join(' ') + '\n';
                }
                return text;

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
    "jurisdictionClause": {
        "text": "Relevant jurisdiction clause",
        "riskLevel": "Medium Risk"
    },
    "extractedText": "Important text that needs attention",
    "suggestedAlternatives": [
        {
            "id": 1,
            "text": "Alternative 1"
        }
    ]
}

Analyze for:
1. Overall risk level (Low/Medium/High Risk)
2. Problematic clauses
3. Jurisdiction and governing law
4. Legal compliance issues
5. Unclear language
6. Missing clauses
7. Unfair terms
8. Provide 4 alternative phrasings

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
            
            // Ensure we have exactly 4 suggested alternatives
            if (!analysis.suggestedAlternatives || !Array.isArray(analysis.suggestedAlternatives)) {
                analysis.suggestedAlternatives = [];
            }
            while (analysis.suggestedAlternatives.length < 4) {
                analysis.suggestedAlternatives.push({
                    id: analysis.suggestedAlternatives.length + 1,
                    text: 'No additional suggestions'
                });
            }
            
            // Ensure risk levels are valid
            if (!['Low Risk', 'Medium Risk', 'High Risk'].includes(analysis.documentInfo.riskAssessment)) {
                analysis.documentInfo.riskAssessment = 'Medium Risk';
            }
            if (!['Low Risk', 'Medium Risk', 'High Risk'].includes(analysis.jurisdictionClause.riskLevel)) {
                analysis.jurisdictionClause.riskLevel = 'Medium Risk';
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