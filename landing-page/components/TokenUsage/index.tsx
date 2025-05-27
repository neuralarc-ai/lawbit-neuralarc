import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import styles from './TokenUsage.module.sass';

interface TokenUsageProps {
  className?: string;
}

interface TokenUsageData {
  total: number;
  limit: number;
  remaining: number;
}

const TokenUsage: React.FC<TokenUsageProps> = ({ className }) => {
  const [tokenUsage, setTokenUsage] = useState<TokenUsageData>({
    total: 0,
    limit: 100000,
    remaining: 50000
  });
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const supabase = createClient();

  const fetchTokenUsage = useCallback(async () => {
    try {
      console.log('Fetching token usage...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('token_usage')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching token usage:', error);
        setLoading(false);
        return;
      }
      
      if (data?.token_usage) {
        console.log('Fetched token usage:', data.token_usage);
        setTokenUsage(data.token_usage);
      }
      
      setLoading(false);
      setHasInitialized(true);
    } catch (error) {
      console.error('Error fetching token usage:', error);
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // Initial fetch
    fetchTokenUsage();
    
    // Set up real-time subscription for token usage updates
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      console.log('Setting up real-time subscription for user:', user.id);
      
      const channel = supabase
        .channel('token_usage_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            console.log('Received real-time update:', payload);
            if (payload.new.token_usage) {
              console.log('Updating token usage:', payload.new.token_usage);
              setTokenUsage(payload.new.token_usage);
              setLoading(false);
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return channel;
    };
    
    let channel: any;
    setupSubscription().then(ch => {
      channel = ch;
    }).catch(error => {
      console.error('Error setting up subscription:', error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log('Cleaning up subscription');
        supabase.removeChannel(channel);
      }
    };
  }, [fetchTokenUsage, supabase]);

  // Refresh token usage data every 10 seconds as a fallback
  useEffect(() => {
    if (!hasInitialized) return;
    
    const interval = setInterval(() => {
      console.log('Refreshing token usage data');
      fetchTokenUsage();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchTokenUsage, hasInitialized]);

  if (loading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>Token Usage</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.skeleton}></div>
        </div>
      </div>
    );
  }

  const usagePercentage = Math.min(100, (tokenUsage.total / tokenUsage.limit) * 100);
  const remainingPercentage = 100 - usagePercentage;

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Token Usage</h3>
      </div>
      
      <div className={styles.progressContainer}>
        <motion.div 
          className={styles.progressBar}
          initial={{ width: 0 }}
          animate={{ width: `${usagePercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className={styles.progressFill}></div>
        </motion.div>
      </div>
      
      <div className={styles.usageInfo}>
        <div className={styles.usageStats}>
          <span className={styles.used}>{tokenUsage.total.toLocaleString()} used</span>
          <span className={styles.separator}></span>
          <span className={styles.total}>{tokenUsage.limit.toLocaleString()} total</span>
        </div>
        <div className={styles.remaining}>{tokenUsage.remaining.toLocaleString()} remaining</div>
      </div>
    </div>
  );
};

export default TokenUsage; 