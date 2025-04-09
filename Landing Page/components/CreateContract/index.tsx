import { useState, useEffect } from 'react';
import cn from 'classnames';
import styles from './CreateContract.module.sass';
import { generateContract, ContractData, ContractResponse, saveContractToDatabase } from '@/services/contractService';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../Toast/Toaster';
import { z } from 'zod';
import { useSupabase } from '@/components/Providers/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import AddressAutocomplete from '../AddressAutocomplete';
import Script from 'next/script';

const contractSchema = z.object({
    contractType: z.string().min(1, 'Agreement type is required'),
    firstPartyName: z.string().min(1, 'First party name is required'),
    firstPartyAddress: z.string().optional(),
    secondPartyName: z.string().min(1, 'Second party name is required'),
    secondPartyAddress: z.string().optional(),
    jurisdiction: z.string().min(1, 'Jurisdiction is required'),
    keyTerms: z.string().optional(),
    description: z.string().min(1, 'Agreement description is required'),
    intensity: z.enum(['Simple', 'Moderate', 'Watertight']),
    preference: z.enum(['Option A', 'Option B'])
});

const contractTypes = [
    'Employment Agreement',
    'Non-Disclosure Agreement',
    'Service Agreement',
    'Lease Agreement',
    'Sale and Purchase Agreement',
    'Partnership Agreement',
    'Consultant Agreement',
    'License Agreement',
    'Franchise Agreement',
    'Joint Venture Agreement',
    'Distribution Agreement',
    'Supply Agreement',
    'Rent Agreement',
    'Vendor Agreement',
    'Settlement Agreement',
    'Loan Agreement',
    'Insurance Contract',
    'Real Estate Purchase Agreement',
    'Construction Contract',
    'Software License Agreement',
    'Trademark License Agreement',
    'Patent License Agreement',
    'Merger and Acquisition Agreement',
    'Merger Agreement',
    'Acquisition Agreement',
    'Shareholder Agreement',
    'Operating Agreement',
    'Subscription Agreement',
    'Sponsorship Agreement',
    'Event Contract',
    'Photography Contract',
    'Memorandum of Understanding',
    'Article of Association',
    'Mutual Agreement',
    'Money Lender Agreement',
    'Debt Agreement',
    'Deed of Assignment',
    'Deed of Trust',
    'Deed of Gift',
    'Deed of Lease',
    'Deed of Sale',
    'Deed of Purchase',
    'Deed of Transfer',
    'Deed of Warranty',
    'Deed of Release',
    'Freelance Agreement'
];

const contractTypeDescriptions: Record<string, string> = {
    'Employment Contract': 'This agreement outlines the terms of employment between an employer and employee, including job responsibilities, compensation, benefits, and termination conditions.',
    'Non-Disclosure Agreement': 'This agreement protects confidential information shared between parties, preventing unauthorized disclosure and use of sensitive business information.',
    'Service Agreement': 'This contract defines the terms of service provision between a service provider and client, including scope of work, payment terms, and service standards.',
    'Lease Agreement': 'This document establishes the terms of property rental between a landlord and tenant, including rent amount, duration, and property maintenance responsibilities.',
    'Sales Agreement': 'This agreement formalizes the terms of a sale transaction between a buyer and seller, including product specifications, price, and delivery terms.',
    'Partnership Agreement': 'This contract outlines the terms of a business partnership, including profit sharing, decision-making processes, and partner responsibilities.',
    'Consultant Agreement': 'This document defines the terms of consulting services, including scope of work, deliverables, and compensation structure.',
    'License Agreement': 'This agreement grants permission to use intellectual property or other assets under specified terms and conditions.',
    'Franchise Agreement': 'This contract establishes the terms of a franchise relationship, including brand usage, operational standards, and franchise fees.',
    'Joint Venture Agreement': 'This document outlines the terms of a business collaboration between two or more parties for a specific project or purpose.',
    'Distribution Agreement': 'This agreement defines the terms of product distribution between a manufacturer and distributor.',
    'Supply Agreement': 'This contract establishes the terms of product or service supply between a supplier and purchaser.',
    'Settlement Agreement': 'This agreement formalizes the resolution of a dispute between parties, including terms of settlement and release of claims.',
    'Loan Agreement': 'This contract outlines the terms of a loan, including principal amount, interest rate, repayment schedule, and collateral.',
    'Insurance Contract': 'This agreement defines the terms of insurance coverage, including premiums, coverage limits, and claim procedures.',
    'Real Estate Purchase Agreement': 'This document formalizes the terms of a real estate transaction, including purchase price, closing date, and property condition.',
    'Construction Contract': 'This agreement outlines the terms of a construction project, including scope of work, timeline, and payment schedule.',
    'Software License Agreement': 'This contract defines the terms of software usage, including licensing rights, restrictions, and maintenance terms.',
    'Trademark License Agreement': 'This document establishes the terms of trademark usage between a licensor and licensee.',
    'Patent License Agreement': 'This agreement defines the terms of patent usage and licensing between parties.',
    'Merger Agreement': 'This contract formalizes the terms of a business merger, including valuation, share exchange, and post-merger operations.',
    'Acquisition Agreement': 'This document outlines the terms of a business acquisition, including purchase price, assets, and liabilities.',
    'Shareholder Agreement': 'This agreement defines the rights and responsibilities of company shareholders.',
    'Operating Agreement': 'This document outlines the management and operation of a limited liability company.',
    'Subscription Agreement': 'This contract establishes the terms of a subscription service, including duration, fees, and service terms.',
    'Sponsorship Agreement': 'This agreement defines the terms of a sponsorship arrangement, including benefits, obligations, and payment terms.',
    'Event Contract': 'This document outlines the terms of event planning and execution, including services, timeline, and payment schedule.',
    'Photography Contract': 'This agreement defines the terms of photography services, including usage rights, deliverables, and payment terms.',
    'Freelance Agreement': 'This contract establishes the terms of freelance work, including project scope, payment terms, and intellectual property rights.',
    'Rent Agreement': 'This document formalizes the terms of property rental, including rent amount, duration, maintenance responsibilities, and tenant rights.',
    'Vendor Agreement': 'This contract defines the relationship between a business and its vendors, including product specifications, pricing, delivery terms, and quality standards.',
    'Confidentiality Agreement': 'This agreement protects sensitive business information by establishing confidentiality obligations between parties.',
    'Merger and Acquisition Agreement': 'This comprehensive document outlines the complete terms of a business combination, including structure, valuation, due diligence, and post-merger integration.',
    'Article of Association': 'This document defines the rules and regulations governing a company\'s internal management and operations.',
    'Mutual Agreement': 'This document formalizes a mutual understanding between parties regarding specific terms, conditions, or actions.',
    'Money Lender Agreement': 'This contract establishes the terms of a money lending arrangement, including loan amount, interest rate, repayment schedule, and default conditions.',
    'Debt Agreement': 'This document formalizes the terms of a debt arrangement, including principal amount, interest rate, repayment schedule, and consequences of default.',
    'Deed of Assignment': 'This legal document transfers rights, interests, or property from one party to another.',
    'Deed of Trust': 'This document establishes a trust relationship where property is held by a trustee for the benefit of beneficiaries.',
    'Deed of Gift': 'This legal document formalizes the transfer of property as a gift from one party to another.',
    'Deed of Lease': 'This document formalizes the terms of a property lease, including rent, duration, and maintenance responsibilities.',
    'Deed of Sale': 'This document formalizes the transfer of property ownership from seller to buyer, including terms of sale and warranties.',
    'Deed of Purchase': 'This document formalizes the acquisition of property, including purchase price, conditions, and warranties.',
    'Deed of Transfer': 'This document formalizes the transfer of property rights from one party to another.',
    'Deed of Warranty': 'This document provides guarantees regarding the title or quality of property being transferred.',
    'Deed of Release': 'This document formalizes the release of claims, rights, or interests in property or other assets.',
    'Memorandum of Understanding': 'This document outlines the preliminary understanding between parties before a formal agreement is reached, establishing the framework for future negotiations.'
};

const contractTypeKeyFields: Record<string, string[]> = {
    'Employment Contract': [
        'Job Title and Responsibilities',
        'Compensation and Benefits',
        'Working Hours and Schedule',
        'Probation Period',
        'Termination Conditions',
        'Term of Agreement',
        'Non-Compete Clause',
        'Intellectual Property Rights',
        'Governing Law',
        'Dispute Resolution',
        'Miscellaneous Clause',
        'Confidentiality Requirements'
    ],
    'Non-Disclosure Agreement': [
        'Definition of Confidential Information',
        'Obligations of Receiving Party',
        'Duration of Confidentiality',
        'Permitted Disclosures',
        'Return of Information',
        'Remedies for Breach',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause',

    ],
    'Service Agreement': [
        'Scope of Services',
        'Service Standards',
        'Payment Terms',
        'Timeline and Milestones',
        'Termination Conditions',
        'Liability Limitations',
        'Intellectual Property Rights',
        'Governing Law',
        'Dispute Resolution',
        'Miscellaneous Clause',
        'Service Level Agreements'
    ],
    'Lease Agreement': [
        'Property Description',
        'Lease Term',
        'Rent Amount and Payment Schedule',
        'Security Deposit',
        'Maintenance Responsibilities',
        'Subletting Conditions',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause',
        'Renewal Terms',
        'Early Termination Conditions'
    ],
    'Sales Contract': [
        'Product Description',
        'Price and Payment Terms',
        'Delivery Terms',
        'Warranty Information',
        'Return Policy',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause',
        'Title Transfer',
        'Risk of Loss',
        'Force Majeure'
    ],
    'Partnership Agreement': [
        'Partnership Structure',
        'Capital Contributions',
        'Profit/Loss Distribution',
        'Decision Making Process',
        'Partner Responsibilities',
        'Admission of New Partners',
        'Dissolution Terms',
        'Governing Law',
        'Term and Termination',
        'Miscellaneous Clause',
        'Dispute Resolution'
    ],
    'Consulting Agreement': [
        'Consulting Scope',
        'Deliverables',
        'Timeline',
        'Payment Structure',
        'Expense Reimbursement',
        'Independent Contractor Status',
        'Confidentiality',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause',
        'Intellectual Property Rights'
    ],
    'License Agreement': [
        'Licensed Property',
        'License Scope',
        'Territory',
        'Term and Renewal',
        'Royalties and Payments',
        'Quality Control',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause',
        'Termination Rights',
        'Sub-licensing Terms'
    ],
    'Franchise Agreement': [
        'Franchise Territory',
        'Franchise Fees',
        'Training Requirements',
        'Operating Standards',
        'Marketing Requirements',
        'Renewal Terms',
        'Transfer Conditions',
        'Termination Rights',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Joint Venture Agreement': [
        'Purpose and Scope',
        'Contributions',
        'Management Structure',
        'Profit Distribution',
        'Decision Making',
        'Term and Termination',
        'Dispute Resolution',
        'Confidentiality',
        'Governing Law'
    ],
    'Distribution Agreement': [
        'Territory',
        'Product Lines',
        'Pricing Structure',
        'Ordering Process',
        'Delivery Terms',
        'Marketing Requirements',
        'Performance Metrics',
        'Termination Conditions',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Supply Agreement': [
        'Product Specifications',
        'Quantity Requirements',
        'Pricing Terms',
        'Delivery Schedule',
        'Quality Standards',
        'Payment Terms',
        'Force Majeure',
        'Termination Rights',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Confidentiality Agreement': [
        'Definition of Confidential Information',
        'Obligations',
        'Duration',
        'Permitted Disclosures',
        'Return of Information',
        'Remedies',
        'Governing Law',
        'Jurisdiction',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Settlement Agreement': [
        'Dispute Description',
        'Settlement Terms',
        'Payment Details',
        'Release of Claims',
        'Confidentiality',
        'No Admission of Liability',
        'Governing Law',
        'Enforcement Terms',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Loan Agreement': [
        'Loan Amount',
        'Interest Rate',
        'Repayment Schedule',
        'Collateral',
        'Default Terms',
        'Prepayment Conditions',
        'Late Payment Penalties',
        'Security Requirements',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Insurance Contract': [
        'Coverage Details',
        'Premium Amount',
        'Policy Term',
        'Deductibles',
        'Exclusions',
        'Claims Process',
        'Cancellation Terms',
        'Renewal Conditions',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Real Estate Purchase Agreement': [
        'Property Description',
        'Purchase Price',
        'Earnest Money',
        'Closing Date',
        'Contingencies',
        'Title Requirements',
        'Inspection Rights',
        'Closing Costs',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Construction Contract': [
        'Project Scope',
        'Timeline',
        'Payment Schedule',
        'Change Order Process',
        'Warranty Terms',
        'Insurance Requirements',
        'Lien Waivers',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Software License Agreement': [
        'License Type',
        'Usage Rights',
        'Restrictions',
        'Maintenance Terms',
        'Support Services',
        'Updates and Upgrades',
        'Termination Rights',
        'Data Protection',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Trademark License Agreement': [
        'Trademark Details',
        'License Scope',
        'Quality Control',
        'Royalties',
        'Term and Renewal',
        'Infringement Protection',
        'Termination Rights',
        'Sub-licensing',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Patent License Agreement': [
        'Patent Details',
        'License Scope',
        'Territory',
        'Royalties',
        'Improvements',
        'Infringement Protection',
        'Termination Rights',
        'Sub-licensing',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Merger Agreement': [
        'Transaction Structure',
        'Purchase Price',
        'Closing Conditions',
        'Representations and Warranties',
        'Covenants',
        'Termination Rights',
        'Indemnification',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Acquisition Agreement': [
        'Assets/Stock Description',
        'Purchase Price',
        'Closing Conditions',
        'Representations and Warranties',
        'Covenants',
        'Termination Rights',
        'Indemnification',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Shareholder Agreement': [
        'Share Transfer Restrictions',
        'Voting Rights',
        'Dividend Policy',
        'Board Composition',
        'Pre-emptive Rights',
        'Drag-Along Rights',
        'Tag-Along Rights',
        'Dispute Resolution',
        'Governing Law',
        'Term and Termination',
        'Miscellaneous Clause'
    ],
    'Operating Agreement': [
        'Management Structure',
        'Capital Contributions',
        'Profit Distribution',
        'Voting Rights',
        'Transfer Restrictions',
        'Dissolution Terms',
        'Dispute Resolution',
        'Amendments Process',
        'Governing Law',
        'Term and Termination',
        'Miscellaneous Clause'
    ],
    'Subscription Agreement': [
        'Service Description',
        'Subscription Term',
        'Fees and Payment',
        'Usage Limits',
        'Service Level Agreement',
        'Termination Rights',
        'Data Protection',
        'Service Updates',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Sponsorship Agreement': [
        'Sponsorship Benefits',
        'Sponsorship Fee',
        'Duration',
        'Brand Usage Rights',
        'Exclusivity Terms',
        'Performance Requirements',
        'Termination Rights',
        'Indemnification',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Event Contract': [
        'Event Description',
        'Date and Location',
        'Services Provided',
        'Payment Schedule',
        'Cancellation Terms',
        'Force Majeure',
        'Insurance Requirements',
        'Liability Limitations',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Photography Contract': [
        'Shoot Details',
        'Usage Rights',
        'Delivery Timeline',
        'Payment Terms',
        'Cancellation Policy',
        'Model Releases',
        'Copyright Terms',
        'Editing Rights',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ],
    'Freelance Agreement': [
        'Project Scope',
        'Deliverables',
        'Timeline',
        'Payment Terms',
        'Revisions Policy',
        'Intellectual Property Rights',
        'Termination Terms',
        'Independent Contractor Status',
        'Governing Law',
        'Term and Termination',
        'Dispute Resolution',
        'Miscellaneous Clause'
    ]
};

interface FormattedContentItem {
    type: 'heading1' | 'heading2' | 'listItem' | 'keyValue' | 'paragraph' | 'numberedSection';
    text?: string;
    key?: string;
    value?: string;
    level?: number;
    number?: string;
}

// Contract categories by department
interface ContractCategory {
    name: string;
    contracts: string[];
}

const contractCategories: ContractCategory[] = [
    {
        name: "Business",
        contracts: [
            'Partnership Agreement',
            'Joint Venture Agreement',
            'Merger Agreement',
            'Acquisition Agreement',
            'Shareholder Agreement',
            'Operating Agreement',
            'Distribution Agreement',
            'Supply Agreement',
            'Franchise Agreement',
            'Merger and Acquisition Agreement',
            'Article of Association',
            'Mutual Agreement'
        ]
    },
    {
        name: "Employment & Services",
        contracts: [
            'Employment Contract',
            'Consultant Agreement',
            'Freelance Agreement',
            'Service Agreement',
            'Photography Contract',
            'Vendor Agreement'
        ]
    },
    {
        name: "Real Estate & Property",
        contracts: [
            'Lease Agreement',
            'Real Estate Purchase Agreement',
            'Construction Contract',
            'Rent Agreement',
            'Deed of Lease',
            'Deed of Sale',
            'Deed of Purchase',
            'Deed of Transfer',
            'Deed of Warranty'
        ]
    },
    {
        name: "Intellectual Property",
        contracts: [
            'Non-Disclosure Agreement',
            'Confidentiality Agreement',
            'License Agreement',
            'Software License Agreement',
            'Trademark License Agreement',
            'Patent License Agreement'
        ]
    },
    {
        name: "Sales & Marketing",
        contracts: [
            'Sales Agreement',
            'Subscription Agreement',
            'Sponsorship Agreement',
            'Event Contract'
        ]
    },
    {
        name: "Financial",
        contracts: [
            'Loan Agreement',
            'Insurance Contract',
            'Settlement Agreement',
            'Money Lender Agreement',
            'Debt Agreement',
            'Deed of Assignment',
            'Deed of Trust',
            'Deed of Gift',
            'Deed of Release'
        ]
    }
];

const CreateContract = () => {
    const { showToast } = useToast();
    const { user } = useSupabase();
    const router = useRouter();
    const [contractData, setContractData] = useState<ContractData>({
        contractType: '',
        firstPartyName: '',
        firstPartyAddress: '',
        secondPartyName: '',
        secondPartyAddress: '',
        jurisdiction: '',
        keyTerms: '',
        description: '',
        intensity: 'Simple',
        preference: 'Option A'
    });
    const [isTemplateGenerated, setIsTemplateGenerated] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [generatedContract, setGeneratedContract] = useState<ContractResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generationStep, setGenerationStep] = useState(0);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [lastUsedContracts, setLastUsedContracts] = useState<string[]>([]);
    const [displayedCategories, setDisplayedCategories] = useState<ContractCategory[]>([...contractCategories]);
    const [enabledOptionalFields, setEnabledOptionalFields] = useState<{
        firstPartyAddress: boolean;
        secondPartyAddress: boolean;
        keyTerms: boolean;
    }>({
        firstPartyAddress: false,
        secondPartyAddress: false,
        keyTerms: false
    });
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipText, setTooltipText] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
    const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);

    // Generation steps descriptions
    const generationSteps = [
        "Analyzing contract requirements...",
        "Identifying legal clauses...",
        "Structuring the document...",
        "Drafting comprehensive terms...",
        "Finalizing your legal document..."
    ];

    // Load last used contracts from localStorage on component mount
    useEffect(() => {
        const savedLastUsed = localStorage.getItem('lastUsedContracts');
        if (savedLastUsed) {
            try {
                const parsedLastUsed = JSON.parse(savedLastUsed);
                if (Array.isArray(parsedLastUsed)) {
                    setLastUsedContracts(parsedLastUsed);
                }
            } catch (e) {
                console.error('Error parsing last used contracts:', e);
            }
        }
    }, []);

    // Update progress during generation
    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 1;
                });
                
                // Update step based on progress
                if (generationProgress < 20) setGenerationStep(0);
                else if (generationProgress < 40) setGenerationStep(1);
                else if (generationProgress < 60) setGenerationStep(2);
                else if (generationProgress < 80) setGenerationStep(3);
                else setGenerationStep(4);
            }, 100);
            
            return () => clearInterval(interval);
        } else {
            setGenerationProgress(0);
            setGenerationStep(0);
        }
    }, [isLoading, generationProgress]);

    // Add new state for storing contracts by option
    const [contractsByOption, setContractsByOption] = useState<{
        'Option A': ContractResponse | null;
        'Option B': ContractResponse | null;
    }>({
        'Option A': null,
        'Option B': null
    });

    const [copySuccess, setCopySuccess] = useState(false);

    const toggleOptionalField = (field: keyof typeof enabledOptionalFields) => {
        setEnabledOptionalFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateField = (name: string, value: string) => {
        try {
            contractSchema.shape[name as keyof typeof contractSchema.shape].parse(value);
            setErrors(prev => ({ ...prev, [name]: '' }));
        } catch (err) {
            if (err instanceof z.ZodError) {
                setErrors(prev => ({ ...prev, [name]: err.errors[0].message }));
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setContractData((prev: ContractData) => ({
            ...prev,
            [name]: value
        }));
        validateField(name, value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleIntensityChange = (intensity: ContractData['intensity']) => {
        setContractData((prev: ContractData) => ({
            ...prev,
            intensity
        }));
        validateField('intensity', intensity);
    };

    const handleContractTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setContractData((prev: ContractData) => ({
            ...prev,
            [name]: value,
            description: contractTypeDescriptions[value] || prev.description,
            keyTerms: contractTypeKeyFields[value]?.join('\n') || prev.keyTerms
        }));
        validateField(name, value);
        
        // Enable the key terms field when a contract type is selected
        if (value) {
            setEnabledOptionalFields(prev => ({
                ...prev,
                keyTerms: true
            }));
            
            // Update recently used contracts
            if (value) {
                // Remove from current position (if exists)
                const filteredContracts = lastUsedContracts.filter(c => c !== value);
                // Add to beginning of array
                const updatedContracts = [value, ...filteredContracts];
                // Update state
                setLastUsedContracts(updatedContracts);
                // Save to localStorage
                localStorage.setItem('lastUsedContracts', JSON.stringify(updatedContracts));
            }
        }
    };

    // Function to store contract in browser storage
    const storeContract = (option: 'Option A' | 'Option B', contract: ContractResponse) => {
        const storageKey = `contract_${contractData.contractType}_${option}`;
        localStorage.setItem(storageKey, JSON.stringify(contract));
        setContractsByOption(prev => ({
            ...prev,
            [option]: contract
        }));
    };

    // Function to retrieve contract from browser storage
    const getStoredContract = (option: 'Option A' | 'Option B'): ContractResponse | null => {
        const storageKey = `contract_${contractData.contractType}_${option}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            return JSON.parse(stored);
        }
        return null;
    };

    // Update handlePreferenceChange to handle both options properly
    const handlePreferenceChange = async (preference: ContractData['preference']) => {
        setContractData((prev: ContractData) => ({
            ...prev,
            preference
        }));
        validateField('preference', preference);

        // Check if we have a stored contract for this option
        const storedContract = getStoredContract(preference);
        if (storedContract) {
            setGeneratedContract(storedContract);
            return;
        }

        // If no stored contract, generate a new one
        setIsLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('token_usage')
                .eq('id', user.id)
                .single();
            
            if (userError) {
                throw userError;
            }
            
            const tokenUsage = userData.token_usage as { total: number; limit: number; remaining: number };
            
            if (tokenUsage.remaining < 20000) {
                throw new Error('Insufficient tokens. Please upgrade your plan to continue.');
            }
            
            const response = await generateContract({
                ...contractData,
                preference
            });
            setGeneratedContract(response);
            storeContract(preference, response);
            
            // Save to database
            await saveContractToDatabase(contractData, response.content, preference);
            
            // Update token usage
            const { error: updateError } = await supabase.rpc('update_token_usage', {
                p_user_id: user.id,
                p_action: 'generate_contract',
                p_tokens: 20000
            });
            
            if (updateError) {
                console.error('Failed to update token usage:', updateError);
                showToast('Contract generated but failed to update token usage');
            }
            
            showToast(`Contract generated successfully for ${preference}!`);
        } catch (err) {
            console.error('Error generating contract:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate contract');
            showToast(err instanceof Error ? err.message : 'Failed to generate contract');
        } finally {
            setIsLoading(false);
        }
    };

    // Update handleSubmit to generate both options
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isDisclaimerAccepted) {
            showToast('Please accept the legal disclaimer to continue');
            return;
        }
        
        if (!user) {
            showToast('Please sign in to create a contract');
            router.push('/auth/signin');
            return;
        }
        
        try {
            contractSchema.parse(contractData);
            setIsLoading(true);
            setError(null);
            setIsTemplateGenerated(true);

            // Check token usage before generating contracts
            const supabase = createClient();
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('token_usage')
                .eq('id', user.id)
                .single();
            
            if (userError) {
                throw userError;
            }
            
            const tokenUsage = userData.token_usage as { total: number; limit: number; remaining: number };
            
            if (tokenUsage.remaining < 20000) {
                // Instead of throwing an error, redirect to subscription modal
                setIsLoading(false);
                showToast('Insufficient tokens. Please upgrade your plan to continue.');
                
                // Access the subscription modal through the Navbar component
                const event = new CustomEvent('openSubscriptionModal');
                window.dispatchEvent(event);
                
                return;
            }

            // Generate contract for current option
            const response = await generateContract(contractData);
            setGeneratedContract(response);
            storeContract(contractData.preference, response);
            
            // Save current option to database
            await saveContractToDatabase(contractData, response.content, contractData.preference);

            // Generate and save the other option
            const otherOption = contractData.preference === 'Option A' ? 'Option B' : 'Option A';
            const otherResponse = await generateContract({
                ...contractData,
                preference: otherOption
            });
            storeContract(otherOption, otherResponse);
            await saveContractToDatabase(contractData, otherResponse.content, otherOption);
            
            // Update token usage after successful generation
            const { error: updateError } = await supabase.rpc('update_token_usage', {
                p_user_id: user.id,
                p_action: 'generate_contract',
                p_tokens: 20000
            });
            
            if (updateError) {
                console.error('Failed to update token usage:', updateError);
                showToast('Contracts generated but failed to update token usage');
            }
            
            showToast('Contracts generated successfully for both options!');
        } catch (err: unknown) {
            if (err instanceof z.ZodError) {
                const newErrors: { [key: string]: string } = {};
                err.errors.forEach((error: z.ZodIssue) => {
                    if (error.path[0]) {
                        newErrors[error.path[0] as string] = error.message;
                    }
                });
                setErrors(newErrors);
                showToast('Please fill in all required fields correctly');
            } else {
                setError('Failed to generate contract. Please try again.');
                showToast('Failed to generate contract. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Process content to detect formatting
    const processContent = (text: string): FormattedContentItem[] => {
        // Split by newlines to preserve paragraph structure
        const paragraphs = text.split('\n\n');
        
        return paragraphs.map(paragraph => {
            // Trim whitespace
            const trimmedParagraph = paragraph.trim();
            
            // Skip empty paragraphs
            if (!trimmedParagraph) {
                return { type: 'paragraph', text: '' };
            }
            
            // Check if this is a heading (starts with # or ##)
            if (trimmedParagraph.startsWith('# ')) {
                return { type: 'heading1', text: trimmedParagraph.substring(2) };
            } else if (trimmedParagraph.startsWith('## ')) {
                return { type: 'heading2', text: trimmedParagraph.substring(3) };
            } 
            // Check if this is a list item
            else if (trimmedParagraph.startsWith('- ') || trimmedParagraph.startsWith('* ')) {
                return { type: 'listItem', text: trimmedParagraph.substring(2) };
            }
            // Check if this is a key-value pair (e.g., "Key: Value")
            else if (trimmedParagraph.includes(': ')) {
                const [key, value] = trimmedParagraph.split(': ');
                return { type: 'keyValue', key, value };
            }
            // Check for numbered sections (e.g., "1.1. Position", "1.2. Duties")
            else if (/^\d+(\.\d+)*\.\s/.test(trimmedParagraph)) {
                const match = trimmedParagraph.match(/^(\d+(\.\d+)*)\.\s(.*)/);
                if (match) {
                    const number = match[1];
                    const text = match[3];
                    // Calculate level based on number of dots
                    const level = number.split('.').length;
                    return { 
                        type: 'numberedSection', 
                        text, 
                        number, 
                        level 
                    };
                }
            }
            // Check for section headers (all caps)
            else if (/^[A-Z\s]+$/.test(trimmedParagraph) && trimmedParagraph.length > 3) {
                return { type: 'heading1', text: trimmedParagraph };
            }
            // Regular paragraph
            else {
                return { type: 'paragraph', text: trimmedParagraph };
            }
            
            // Default case - should never reach here, but TypeScript needs it
            return { type: 'paragraph', text: trimmedParagraph };
        });
    };

    // Function to generate a descriptive contract title
    const generateContractTitle = () => {
        if (!contractData.contractType || !contractData.firstPartyName || !contractData.secondPartyName) {
            return 'Generated Contract';
        }
        
        // Format the contract type (remove "Contract" if it's at the end)
        let formattedType = contractData.contractType;
        if (formattedType.endsWith(' Contract')) {
            formattedType = formattedType.replace(' Contract', '');
        }
        
        // Create a descriptive title
        return `${formattedType} between ${contractData.firstPartyName} and ${contractData.secondPartyName}`;
    };

    const handleDownloadPDF = () => {
        if (!generatedContract) {
            showToast('No contract to download');
            return;
        }

        const doc = new jsPDF();
        
        // Set margins
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - (margin * 2);
        
        // Add title
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        const title = generateContractTitle();
        const titleLines = doc.splitTextToSize(title, contentWidth);
        doc.text(titleLines, pageWidth / 2, margin, { align: 'center' });
        
        // Process content for formatting
        const formattedContent = processContent(generatedContract.content);
        
        // Calculate starting Y position after title
        let yPosition = margin + (titleLines.length * 7) + 10;
        
        // Add each paragraph with proper formatting
        formattedContent.forEach(item => {
            // Check if we need a new page
            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            
            switch (item.type) {
                case 'heading1':
                    doc.setFontSize(16);
                    doc.setFont('times', 'bold');
                    const heading1Lines = doc.splitTextToSize(item.text || '', contentWidth);
                    doc.text(heading1Lines, margin, yPosition);
                    yPosition += (heading1Lines.length * 7) + 5;
                    break;
                    
                case 'heading2':
                    doc.setFontSize(14);
                    doc.setFont('times', 'bold');
                    const heading2Lines = doc.splitTextToSize(item.text || '', contentWidth);
                    doc.text(heading2Lines, margin, yPosition);
                    yPosition += (heading2Lines.length * 7) + 5;
                    break;
                    
                case 'listItem':
                    doc.setFontSize(12);
                    doc.setFont('times', 'normal');
                    const listItemText = '• ' + (item.text || '');
                    const listItemLines = doc.splitTextToSize(listItemText, contentWidth - 5);
                    doc.text(listItemLines, margin + 5, yPosition);
                    yPosition += (listItemLines.length * 7) + 3;
                    break;
                    
                case 'numberedSection':
                    doc.setFontSize(12);
                    doc.setFont('times', 'normal');
                    
                    // Calculate indentation based on level
                    const indent = item.level ? (item.level - 1) * 10 : 0;
                    const availableWidth = contentWidth - indent;
                    
                    // Add the number and text
                    const numberText = (item.number || '') + '. ';
                    const sectionText = item.text || '';
                    const fullText = numberText + sectionText;
                    
                    // Split text to fit within available width
                    const sectionLines = doc.splitTextToSize(fullText, availableWidth);
                    
                    // If the number is long, we might need to handle it differently
                    if (numberText.length > 5) {
                        // First line: number
                        doc.text(numberText, margin + indent, yPosition);
                        
                        // Remaining lines: text with proper indentation
                        const remainingText = sectionText;
                        const remainingLines = doc.splitTextToSize(remainingText, availableWidth - 10);
                        doc.text(remainingLines, margin + indent + 10, yPosition + 7);
                        yPosition += 7 + (remainingLines.length * 7) + 3;
                    } else {
                        // Simple case: just add the text with the number
                        doc.text(sectionLines, margin + indent, yPosition);
                        yPosition += (sectionLines.length * 7) + 3;
                    }
                    break;
                    
                case 'keyValue':
                    doc.setFontSize(12);
                    doc.setFont('times', 'bold');
                    const keyText = (item.key || '') + ': ';
                    const valueText = item.value || '';
                    
                    // Check if key is too long to fit on one line
                    const keyWidth = doc.getStringUnitWidth(keyText) * 12;
                    if (keyWidth > contentWidth / 2) {
                        // Key is too long, put it on its own line
                        const keyLines = doc.splitTextToSize(keyText, contentWidth);
                        doc.text(keyLines, margin, yPosition);
                        yPosition += (keyLines.length * 7);
                        
                        // Then add the value on the next line
                        doc.setFont('times', 'normal');
                        const valueLines = doc.splitTextToSize(valueText, contentWidth);
                        doc.text(valueLines, margin, yPosition);
                        yPosition += (valueLines.length * 7) + 3;
                    } else {
                        // Key fits on one line, use the original approach
                        doc.text(keyText, margin, yPosition);
                        doc.setFont('times', 'normal');
                        const valueLines = doc.splitTextToSize(valueText, contentWidth - keyWidth - 10);
                        doc.text(valueLines, margin + keyWidth + 10, yPosition);
                        yPosition += Math.max(7, valueLines.length * 7) + 3;
                    }
                    break;
                    
                case 'paragraph':
                default:
        doc.setFontSize(12);
                    doc.setFont('times', 'normal');
                    const lines = doc.splitTextToSize(item.text || '', contentWidth);
                    lines.forEach((line: string) => {
                        if (yPosition > pageHeight - margin) {
                            doc.addPage();
                            yPosition = margin;
                        }
                        doc.text(line, margin, yPosition);
                        yPosition += 7;
                    });
                    yPosition += 3; // Add extra space after paragraphs
                    break;
            }
        });
        
        // Format the filename with agreement type, date and time
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        const agreementType = contractData.contractType.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${agreementType}-${date}-${time}.pdf`;
        
        doc.save(filename);
        showToast('Contract downloaded as PDF');
    };

    const handleDownloadDOCX = async () => {
        if (!generatedContract) {
            showToast('No contract to download');
            return;
        }

        // Process content for formatting
        const formattedContent = processContent(generatedContract.content);
        
        // Create document with proper formatting
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440, // 1 inch in twips
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                            header: 720,
                            footer: 720,
                            gutter: 0
                        }
                    }
                },
                children: [
                    new Paragraph({
                        text: generateContractTitle(),
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: {
                            after: 400
                        }
                    }),
                    ...formattedContent.map(item => {
                        switch (item.type) {
                            case 'heading1':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: item.text || '',
                                            bold: true,
                                            size: 32, // 16pt
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    spacing: {
                                        before: 240,
                                        after: 120
                                    }
                                });
                                
                            case 'heading2':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: item.text || '',
                                            bold: true,
                                            size: 28, // 14pt
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    spacing: {
                                        before: 240,
                                        after: 120
                                    }
                                });
                                
                            case 'listItem':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "• ",
                                            bold: true,
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        }),
                                        new TextRun({
                                            text: item.text || '',
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    indent: {
                                        left: 720 // 0.5 inch
                                    },
                                    spacing: {
                                        before: 120,
                                        after: 120
                                    }
                                });
                                
                            case 'numberedSection':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: (item.number || '') + '. ',
                                            bold: true,
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        }),
                                        new TextRun({
                                            text: item.text || '',
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    indent: {
                                        left: item.level ? (item.level - 1) * 720 : 0 // 0.5 inch per level
                                    },
                                    spacing: {
                                        before: 120,
                                        after: 120
                                    }
                                });
                                
                            case 'keyValue':
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: (item.key || '') + ": ",
                                            bold: true,
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        }),
                                        new TextRun({
                                            text: item.value || '',
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    spacing: {
                                        before: 120,
                                        after: 120
                                    }
                                });
                                
                            case 'paragraph':
                            default:
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: item.text || '',
                                            size: 24, // 12pt
                                            font: "Times New Roman",
                                            color: "000000" // Black color
                                        })
                                    ],
                                    spacing: {
                                        line: 360, // 1.5 line spacing
                                        before: 120,
                                        after: 120
                                    }
                                });
                        }
                    })
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        // Format the filename with agreement type, date and time
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        const agreementType = contractData.contractType.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${agreementType}-${date}-${time}.docx`;
        
        saveAs(blob, filename);
        showToast('Contract downloaded as DOCX');
    };

    const copyToClipboard = (text: string) => {
        if (!text || text.trim() === '') {
            showToast('No content to copy');
            return;
        }

        // Try the modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                setCopySuccess(true);
                showToast('Copied to clipboard successfully!');
                setTimeout(() => setCopySuccess(false), 2000);
            }).catch((err) => {
                console.error('Failed to copy: ', err);
                // Fall back to document.execCommand for Safari
                fallbackCopyToClipboard(text);
            });
        } else {
            // Use fallback for browsers that don't support clipboard API
            fallbackCopyToClipboard(text);
        }
    };

    // Fallback copy method for browsers that don't support clipboard API
    const fallbackCopyToClipboard = (text: string) => {
        try {
            // Create a temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = text;
            
            // Make it non-editable to avoid focus and move outside the screen
            textArea.setAttribute('readonly', '');
            textArea.style.position = 'absolute';
            textArea.style.left = '-9999px';
            
            document.body.appendChild(textArea);
            
            // Check if the browser supports selection
            const selected = document.getSelection()?.rangeCount || 0 > 0 
                ? document.getSelection()?.getRangeAt(0) 
                : false;
            
            // Select the text in the textarea
            textArea.select();
            textArea.setSelectionRange(0, text.length);
            
            // Execute copy command
            const success = document.execCommand('copy');
            
            // Clean up
            document.body.removeChild(textArea);
            
            // Restore selection if there was any
            if (selected && document.getSelection()) {
                document.getSelection()?.removeAllRanges();
                document.getSelection()?.addRange(selected);
            }
            
            if (success) {
                setCopySuccess(true);
                showToast('Copied to clipboard successfully!');
                setTimeout(() => setCopySuccess(false), 2000);
            } else {
                showToast('Failed to copy text. Please try selecting and copying manually.');
            }
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            showToast('Failed to copy text. Please try selecting and copying manually.');
        }
    };

    // Handle mouse enter for contract options
    const handleContractOptionHover = (e: React.MouseEvent<HTMLOptionElement>, contractType: string) => {
        const description = contractTypeDescriptions[contractType] || '';
        if (description) {
            setTooltipText(description);
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            });
            setShowTooltip(true);
        }
    };

    // Handle mouse leave for contract options
    const handleContractOptionLeave = () => {
        setShowTooltip(false);
    };

    return (
        <div className={styles.container}>
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div 
                        className={styles.generatingOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={styles.loadingIcon}>
                            <div className={styles.spinner}></div>
                            <Image 
                                src="/icons/lawbit-preview.svg" 
                                alt="LawBit Logo" 
                                width={70} 
                                height={70} 
                                className={styles.logo}
                            />
                        </div>
                        <h2 className={styles.loadingText}>Generating Your Contract</h2>
                        <p className={styles.loadingDescription}>{generationSteps[generationStep]}</p>
                        <div className={styles.progressBarContainer}>
                            <div 
                                className={styles.progressBar} 
                                style={{ width: `${generationProgress}%` }}
                            ></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className={styles.formSection}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label>Agreement type</label>
                        <div className={styles.selectWrapper}>
                            <select
                                name="contractType"
                                value={contractData.contractType}
                                onChange={handleContractTypeChange}
                                onBlur={handleBlur}
                                className={cn(styles.select, { [styles.error]: errors.contractType })}
                            >
                                <option value="">{errors.contractType || "Select contract type"}</option>
                                
                                {/* Recently Used Contracts */}
                                {lastUsedContracts.length > 0 && (
                                    <>
                                        <optgroup label="Recently Used">
                                            {lastUsedContracts.slice(0, 5).map((type) => (
                                                <option 
                                                    key={`recent-${type}`} 
                                                    value={type}
                                                    onMouseEnter={(e) => handleContractOptionHover(e, type)}
                                                    onMouseLeave={handleContractOptionLeave}
                                                    className={styles.selectedOption}
                                                >
                                                    {type}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </>
                                )}

                                {/* Contracts Grouped by Department */}
                                {contractCategories.map((category) => (
                                    <optgroup key={category.name} label={category.name}>
                                        {category.contracts.map((type) => (
                                            <option 
                                                key={type} 
                                                value={type}
                                                onMouseEnter={(e) => handleContractOptionHover(e, type)}
                                                onMouseLeave={handleContractOptionLeave}
                                            >
                                                {type}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            
                            {/* Contract Description Tooltip */}
                            {showTooltip && (
                                <div 
                                    className={cn(styles.contractTooltip, styles.visible)}
                                    style={{
                                        top: `${tooltipPosition.top}px`,
                                        left: `${tooltipPosition.left}px`
                                    }}
                                >
                                    {tooltipText}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>First party name</label>
                        <input
                            type="text"
                            name="firstPartyName"
                            value={contractData.firstPartyName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={errors.firstPartyName || "Enter first party name"}
                            className={cn({ [styles.error]: errors.firstPartyName })}
                        />
                    </div>
                    <div className={cn(styles.field, styles.optionalField)}>
                        <div className={styles.labelRow}>
                            <input
                                type="checkbox"
                                className={styles.toggleButton}
                                checked={enabledOptionalFields.firstPartyAddress}
                                onChange={() => toggleOptionalField('firstPartyAddress')}
                            />
                            <label>First party address (Optional)</label>
                        </div>
                        <div className={cn(styles.optionalContent, {
                            [styles.visible]: enabledOptionalFields.firstPartyAddress
                        })}>
                            <AddressAutocomplete
                                value={contractData.firstPartyAddress || ''}
                                onChange={(value) => handleChange({ target: { name: 'firstPartyAddress', value } } as any)}
                                onBlur={() => handleBlur({ target: { name: 'firstPartyAddress', value: contractData.firstPartyAddress || '' } } as any)}
                                placeholder={errors.firstPartyAddress || "Enter first party address"}
                                error={errors.firstPartyAddress}
                                type="address"
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>Second party name</label>
                        <input
                            type="text"
                            name="secondPartyName"
                            value={contractData.secondPartyName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={errors.secondPartyName || "Enter second party name"}
                            className={cn({ [styles.error]: errors.secondPartyName })}
                        />
                    </div>
                    <div className={cn(styles.field, styles.optionalField)}>
                        <div className={styles.labelRow}>
                            <input
                                type="checkbox"
                                className={styles.toggleButton}
                                checked={enabledOptionalFields.secondPartyAddress}
                                onChange={() => toggleOptionalField('secondPartyAddress')}
                            />
                            <label>Second party address (Optional)</label>
                        </div>
                        <div className={cn(styles.optionalContent, {
                            [styles.visible]: enabledOptionalFields.secondPartyAddress
                        })}>
                            <AddressAutocomplete
                                value={contractData.secondPartyAddress || ''}
                                onChange={(value) => handleChange({ target: { name: 'secondPartyAddress', value } } as any)}
                                onBlur={() => handleBlur({ target: { name: 'secondPartyAddress', value: contractData.secondPartyAddress || '' } } as any)}
                                placeholder={errors.secondPartyAddress || "Enter second party address"}
                                error={errors.secondPartyAddress}
                                type="address"
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>Jurisdiction</label>
                        <AddressAutocomplete
                            value={contractData.jurisdiction}
                            onChange={(value) => handleChange({ target: { name: 'jurisdiction', value } } as any)}
                            onBlur={() => handleBlur({ target: { name: 'jurisdiction', value: contractData.jurisdiction } } as any)}
                            placeholder={errors.jurisdiction || "Enter jurisdiction"}
                            error={errors.jurisdiction}
                            type="jurisdiction"
                        />
                    </div>
                    <div className={cn(styles.field, styles.optionalField)}>
                        <div className={styles.labelRow}>
                            <input
                                type="checkbox"
                                className={styles.toggleButton}
                                checked={enabledOptionalFields.keyTerms}
                                onChange={() => toggleOptionalField('keyTerms')}
                            />
                            <label>Key Terms (Optional)</label>
                        </div>
                        <div className={cn(styles.optionalContent, {
                            [styles.visible]: enabledOptionalFields.keyTerms
                        })}>
                            <div className={styles.suggestiveText}>
                                These are suggested terms for your legal document. You can modify them as needed.
                            </div>
                            <textarea
                                name="keyTerms"
                                value={contractData.keyTerms}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={errors.keyTerms || "Any key terms you'd like to specify"}
                                className={cn({ 
                                    [styles.error]: errors.keyTerms
                                })}
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>Agreement Description</label>
                        <div className={styles.suggestiveText}>
                            This is a suggested description based on the contract type. Feel free to customize it.
                        </div>
                        <textarea
                            name="description"
                            value={contractData.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={errors.description || "Describe what this contract should cover"}
                            className={cn({ [styles.error]: errors.description })}
                        />
                    </div>
                    <div className={styles.field}>
                        <label>Contract Intensity</label>
                        <div className={styles.tabSelector}>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: contractData.intensity === 'Simple'
                                })}
                                onClick={() => handleIntensityChange('Simple')}
                            >
                                Beginner
                            </button>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: contractData.intensity === 'Moderate'
                                })}
                                onClick={() => handleIntensityChange('Moderate')}
                            >
                                Moderate
                            </button>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: contractData.intensity === 'Watertight'
                                })}
                                onClick={() => handleIntensityChange('Watertight')}
                            >
                                Watertight
                            </button>
                        </div>
                    </div>
                    
                    <div className={styles.legalDisclaimer}>
                        <button 
                            type="button"
                            className={styles.disclaimerHeader} 
                            onClick={() => setIsDisclaimerOpen(!isDisclaimerOpen)}
                        >
                            <div className={styles.headerContent}>
                                <h3 className={styles.disclaimerTitle}>Legal Disclaimer</h3>
                                <Image 
                                    src="/images/chevron-down.svg"
                                    width={24}
                                    height={24}
                                    alt="Toggle"
                                    className={cn(styles.chevron, {
                                        [styles.open]: isDisclaimerOpen
                                    })}
                                />
                            </div>
                        </button>
                        
                        <div className={cn(styles.disclaimerContent, {
                            [styles.open]: isDisclaimerOpen
                        })}>
                            <div className={styles.disclaimerText}>
                                <p>
                                    This AI-powered legal document generator is designed to provide general legal document templates and assistance. While we strive for accuracy and completeness, please note the following important points:
                                </p>
                                <p>
                                    1. Not Legal Advice: The generated documents and information provided are not substitutes for professional legal advice. Consult with a qualified legal professional for specific legal matters.
                                </p>
                                <p>
                                    2. No Attorney-Client Relationship: Use of this service does not create an attorney-client relationship between you and our platform or any affiliated parties.
                                </p>
                                <p>
                                    3. Accuracy & Completeness: While we make efforts to keep information up-to-date and accurate, we cannot guarantee the completeness, accuracy, or adequacy of the generated documents for your specific needs.
                                </p>
                                <p>
                                    4. Review Requirement: All generated documents should be thoroughly reviewed by a qualified legal professional before use or implementation.
                                </p>
                            </div>
                        </div>
                        
                        <label className={cn(styles.checkbox, styles.acceptanceRow)}>
                            <input 
                                type="checkbox"
                                checked={isDisclaimerAccepted}
                                onChange={(e) => setIsDisclaimerAccepted(e.target.checked)}
                            />
                            <span className={styles.checkmark}></span>
                            <span className={styles.label}>
                                I understand and accept the legal disclaimer
                            </span>
                        </label>
                    </div>
                    
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        <span>{isLoading ? 'Generating...' : 'Legal Draft Template'}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </form>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.previewSection}>
                    <div className={styles.previewContent}>
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div 
                                    className={styles.loading}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                        <Image 
                                            src="/icons/lawbit-preview.svg" 
                                            alt="LawBit Logo" 
                                            width={120} 
                                            height={120} 
                                            className={styles.logo}
                                        />
                                    </motion.div>
                                    <motion.div 
                                        className={styles.loadingText}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.3 }}
                                    >
                                        Generating...
                                    </motion.div>
                                </motion.div>
                            ) : generatedContract ? (
                                <motion.div 
                                    className={styles.contractPreview}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={styles.contractContent}>
                                        <h1 className={styles.heading1}>{generateContractTitle()}</h1>
                                        {processContent(generatedContract.content).map((item, index) => {
                                            switch (item.type) {
                                                case 'heading1':
                                                    return (
                                                        <h1 key={index} className={styles.heading1}>
                                                            {item.text}
                                                        </h1>
                                                    );
                                                case 'heading2':
                                                    return (
                                                        <h2 key={index} className={styles.heading2}>
                                                            {item.text}
                                                        </h2>
                                                    );
                                                case 'listItem':
                                                    return (
                                                        <div key={index} className={styles.listItem}>
                                                            <span className={styles.bullet}>•</span>
                                                            <span>{item.text}</span>
                                                        </div>
                                                    );
                                                case 'numberedSection':
                                                    return (
                                                        <div 
                                                            key={index} 
                                                            className={styles.numberedSection}
                                                            style={{ 
                                                                marginLeft: `${(item.level || 1) * 20}px`,
                                                                paddingLeft: '10px'
                                                            }}
                                                        >
                                                            <span className={styles.number}>{item.number}.</span>
                                                            <span>{item.text}</span>
                                                        </div>
                                                    );
                                                case 'keyValue':
                                                    return (
                                                        <div key={index} className={styles.keyValue}>
                                                            <span className={styles.key}>{item.key}:</span>
                                                            <span className={styles.value}>{item.value}</span>
                                                        </div>
                                                    );
                                                case 'paragraph':
                                                default:
                                                    return (
                                                        <p key={index} className={styles.paragraph}>
                                                            {item.text}
                                                        </p>
                                                    );
                                            }
                                        })}
                                    </div>
                                </motion.div>
                            ) : (
                            <motion.div 
                                className={styles.previewPlaceholder}
                                initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Image 
                                        src="/icons/lawbit-preview.svg" 
                                        alt="Contract Preview" 
                                        width={120} 
                                        height={120}
                                        className={styles.previewIcon} 
                                    />
                                    <p className={styles.placeholderText}>
                                        Your generated contract will appear here
                                    </p>
                            </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className={styles.actionsSection}>
                    <div className={styles.preferenceSelector}>
                        <label>Choose a preference</label>
                        <div className={styles.tabSelector}>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: contractData.preference === 'Option A',
                                    [styles.disabled]: !isTemplateGenerated
                                })}
                                onClick={() => handlePreferenceChange('Option A')}
                                disabled={!isTemplateGenerated}
                            >
                                Option A
                            </button>
                            <button
                                type="button"
                                className={cn(styles.tabButton, {
                                    [styles.active]: contractData.preference === 'Option B',
                                    [styles.disabled]: !isTemplateGenerated
                                })}
                                onClick={() => handlePreferenceChange('Option B')}
                                disabled={!isTemplateGenerated}
                            >
                                Option B
                            </button>
                        </div>
                    </div>
                    <div className={styles.downloadButtons}>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.buttonInner}>
                                <button type="button" className={styles.iconButton} onClick={handleDownloadDOCX}>
                                    <Image src="/icons/word.svg" alt="Word" width={24} height={24} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.buttonInner}>
                                <button type="button" className={styles.iconButton} onClick={handleDownloadPDF}>
                                    <Image src="/icons/pdf.svg" alt="PDF" width={24} height={24} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.buttonInner}>
                                <button 
                                    type="button" 
                                    className={styles.iconButton} 
                                    onClick={() => copyToClipboard(generatedContract?.content || '')}
                                    aria-label={copySuccess ? "Copied" : "Copy to clipboard"}
                                >
                                    {copySuccess ? (
                                        <Image 
                                            src="/icons/tick.svg" 
                                            alt="Copied" 
                                            width={24} 
                                            height={24} 
                                            className={styles.success}
                                            priority
                                        />
                                    ) : (
                                        <Image 
                                            src="/icons/copy.svg" 
                                            alt="Copy" 
                                            width={24} 
                                            height={24}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateContract; 