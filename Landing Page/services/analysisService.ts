import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

export async function analyzeDocument(content: string): Promise<AnalysisResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `Analyze the following legal document and provide a detailed analysis in JSON format exactly matching this structure:

{
    "documentInfo": {
        "title": "string (document title)",
        "dateTime": "string (current date and time)",
        "riskAssessment": "string (must be exactly one of: 'Low Risk', 'Medium Risk', 'High Risk')",
        "keyStatistics": {
            "highRiskItems": "number (count of high risk items found)",
            "clausesIdentified": "number (total number of clauses found)"
        },
        "jurisdiction": "string (jurisdiction name)"
    },
    "jurisdictionClause": {
        "text": "string (the relevant jurisdiction clause text)",
        "riskLevel": "string (must be exactly one of: 'Low Risk', 'Medium Risk', 'High Risk')"
    },
    "extractedText": "string (important text that needs attention)",
    "suggestedAlternatives": [
        {
            "id": "number (1-based index)",
            "text": "string (suggested alternative phrasing)"
        }
    ]
}

Analyze this document for:
1. Overall risk level
2. Potentially problematic clauses
3. Jurisdiction and governing law
4. Legal compliance issues
5. Unclear or ambiguous language
6. Missing essential clauses
7. Unfair or one-sided terms
8. Provide 4 alternative phrasings for risky clauses

Document to analyze:
${content}

Return ONLY the JSON object with no additional text or explanation.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysisText = response.text();
        
        // Parse the response into structured format
        let analysis: AnalysisResponse;
        try {
            analysis = JSON.parse(analysisText);
            
            // Ensure the response matches our interface
            if (!analysis.documentInfo?.dateTime) {
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
            // If parsing fails, create a structured response
            analysis = {
                documentInfo: {
                    title: 'Document Analysis',
                    dateTime: new Date().toISOString(),
                    riskAssessment: 'Medium Risk',
                    keyStatistics: {
                        highRiskItems: 0,
                        clausesIdentified: 0
                    },
                    jurisdiction: 'Not specified'
                },
                jurisdictionClause: {
                    text: 'No jurisdiction clause found',
                    riskLevel: 'Medium Risk'
                },
                extractedText: analysisText,
                suggestedAlternatives: [
                    { id: 1, text: 'No suggestions available' },
                    { id: 2, text: 'No suggestions available' },
                    { id: 3, text: 'No suggestions available' },
                    { id: 4, text: 'No suggestions available' }
                ]
            };
        }

        return analysis;
    } catch (error) {
        console.error('Error analyzing document:', error);
        throw new Error('Failed to analyze document');
    }
}

export async function analyzeFile(file: File): Promise<AnalysisResponse> {
    try {
        const content = await file.text();
        return analyzeDocument(content);
    } catch (error) {
        console.error('Error reading file:', error);
        throw new Error('Failed to read file');
    }
} 