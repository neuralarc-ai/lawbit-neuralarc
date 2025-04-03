import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import Toast from '@/components/Toast';
import styles from './ContractAnalysis.module.sass';
import ReactDOM from 'react-dom/client';

// Simple toast utility
const showToast = (message: string) => {
  // Create a container for the toast
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  document.body.appendChild(container);
  
  // Create the toast element
  const toastElement = document.createElement('div');
  container.appendChild(toastElement);
  
  // Render the toast
  const root = ReactDOM.createRoot(toastElement);
  root.render(
    <Toast 
      message={message} 
      onClose={() => {
        root.unmount();
      }} 
    />
  );
};

const ContractAnalysis = () => {
  const [contractText, setContractText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeContract = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!contractText.trim()) {
        throw new Error('Please enter a contract to analyze');
      }
      
      // Check if user has enough tokens
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
      
      // Analyze contract
      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractText,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze contract');
      }
      
      const data = await response.json();
      setAnalysisResult(data.analysis);
      
      // Update token usage
      const { error: updateError } = await supabase.rpc('update_token_usage', {
        p_user_id: user.id,
        p_action: 'analyze_contract',
        p_tokens: 20000
      });
      
      if (updateError) {
        console.error('Failed to update token usage:', updateError);
        showToast('Contract analyzed but failed to update token usage');
      }
      
      showToast('Contract analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing contract:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze contract');
      showToast(error instanceof Error ? error.message : 'Failed to analyze contract');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Contract Analysis</h1>
        <p className={styles.description}>
          Upload or paste your contract text to analyze it for potential issues, risks, and improvements.
        </p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.inputSection}>
          <h2 className={styles.sectionTitle}>Contract Text</h2>
          <textarea
            className={styles.textarea}
            placeholder="Paste your contract text here..."
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            rows={10}
          />
          <button
            className={styles.analyzeButton}
            onClick={handleAnalyzeContract}
            disabled={isLoading || !contractText.trim()}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Contract'}
          </button>
        </div>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        {analysisResult && (
          <motion.div
            className={styles.resultSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={styles.sectionTitle}>Analysis Results</h2>
            <div className={styles.resultContent}>
              {analysisResult}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContractAnalysis; 