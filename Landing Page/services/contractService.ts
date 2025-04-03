import { createClient } from '@/lib/supabase';

const supabase = createClient();

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

export const generateContract = async (data: ContractData): Promise<ContractResponse> => {
    try {
        const response = await fetch('/api/generate-contract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
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

export const saveContractToDatabase = async (
    contractData: ContractData,
    generatedContent: string,
    option: 'Option A' | 'Option B'
) => {
    try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated');

        // Create contract record with only the fields that exist in the database
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .insert({
                user_id: user.id,
                title: `${contractData.contractType} - ${option}`,
                content: generatedContent,
                type: 'generated',
                status: 'draft',
                file_type: 'docx'
            })
            .select()
            .single();

        if (contractError) throw contractError;

        // Create contract history record with all the details
        const { error: historyError } = await supabase
            .from('contract_history')
            .insert({
                contract_id: contract.id,
                user_id: user.id,
                action: 'created',
                details: {
                    contract_type: contractData.contractType,
                    option: option,
                    first_party: contractData.firstPartyName,
                    first_party_address: contractData.firstPartyAddress,
                    second_party: contractData.secondPartyName,
                    second_party_address: contractData.secondPartyAddress,
                    intensity: contractData.intensity,
                    jurisdiction: contractData.jurisdiction,
                    key_terms: contractData.keyTerms,
                    description: contractData.description
                }
            });

        if (historyError) throw historyError;

        return contract;
    } catch (error) {
        console.error('Error saving contract:', error);
        throw error;
    }
};

export const getContractHistory = async () => {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated');

        const { data: contracts, error: contractsError } = await supabase
            .from('contracts')
            .select(`
                *,
                contract_history (
                    action,
                    details,
                    created_at
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (contractsError) throw contractsError;

        return contracts;
    } catch (error) {
        console.error('Error fetching contract history:', error);
        throw error;
    }
}; 