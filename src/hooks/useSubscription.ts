import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface SubscriptionInfo {
  canPurchaseRecharge: boolean;
  subscription: {
    type: 'free' | 'monthly' | 'lifetime';
    endDate: string | null;
  };
  availablePackages: any;
  loading: boolean;
  error: string | null;
}

export function useSubscription(): SubscriptionInfo {
  const { user, token } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    canPurchaseRecharge: false,
    subscription: {
      type: 'free',
      endDate: null
    },
    availablePackages: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!user || !token) {
        setSubscriptionInfo(prev => ({
          ...prev,
          loading: false,
          canPurchaseRecharge: false
        }));
        return;
      }

      try {
        const response = await fetch('/api/credits/recharge', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionInfo({
            canPurchaseRecharge: data.canPurchaseRecharge,
            subscription: data.subscription,
            availablePackages: data.availablePackages,
            loading: false,
            error: null
          });
        } else {
          setSubscriptionInfo(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to fetch subscription info'
          }));
        }
      } catch (error) {
        console.error('Error fetching subscription info:', error);
        setSubscriptionInfo(prev => ({
          ...prev,
          loading: false,
          error: 'Network error'
        }));
      }
    };

    fetchSubscriptionInfo();
  }, [user, token]);

  return subscriptionInfo;
}