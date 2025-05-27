import React from 'react';
import Link from 'next/link';

export default function CancelPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
                <div className="mb-6">
                    <svg
                        className="w-16 h-16 text-yellow-500 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">
                    Payment Cancelled
                </h1>
                <p className="text-gray-300 mb-8">
                    Your payment was cancelled. No charges were made to your account.
                </p>
                <div className="space-y-4">
                    <Link
                        href="/contracts"
                        className="inline-block w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                        Return to Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="inline-block w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                        Try Again
                    </Link>
                </div>
            </div>
        </div>
    );
} 