import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'LawBit - Contracts',
    description: 'Create and analyze legal contracts with AI',
};

export default function ContractsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="fustat">
            {children}
        </main>
    );
} 