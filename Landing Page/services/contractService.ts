export type ContractData = {
    contractType: string;
    firstPartyName: string;
    firstPartyAddress?: string;
    secondPartyName: string;
    secondPartyAddress?: string;
    jurisdiction: string;
    keyTerms: string;
    description: string;
    intensity: 'Simple' | 'Moderate' | 'Watertight';
    preference: 'Option A' | 'Option B';
};

export type ContractResponse = {
    content: string;
    timestamp: string;
};

export const generateContract = async (contractData: ContractData): Promise<ContractResponse> => {
    try {
        const response = await fetch('/api/generate-contract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contractData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate contract');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in contract generation:', error);
        throw error;
    }
}; 