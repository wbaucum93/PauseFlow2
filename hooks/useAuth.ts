
import { useState, useCallback, useMemo, useEffect } from 'react';
import { User, SubscriptionStatus, Plan } from '../types';

// Mocked user data, simulating a database
const mockAdminUser: User = {
    uid: 'admin-user-uid',
    email: 'baucumwill@gmail.com',
    isAdmin: true,
    status: SubscriptionStatus.ACTIVE,
    plan: Plan.PRO,
    planType: 'lifetime',
    createdAt: new Date(),
};

const mockNewUser: User = {
    uid: 'new-user-uid',
    email: 'test@example.com',
    isAdmin: false,
    status: SubscriptionStatus.INACTIVE,
    createdAt: new Date(),
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Keep error state for API consistency

  // Simulate initial auth check
  useEffect(() => {
    setTimeout(() => {
      // To keep a session-like feel, we can use sessionStorage.
      const storedUser = sessionStorage.getItem('mockUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }, 500);
  }, []);

  const login = useCallback(async (email: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(res => setTimeout(res, 500));
    
    let loggedInUser: User;
    if (email.toLowerCase() === 'baucumwill@gmail.com') {
      loggedInUser = mockAdminUser;
    } else {
      loggedInUser = { ...mockNewUser, email, uid: `user-${Date.now()}` };
    }

    setUser(loggedInUser);
    sessionStorage.setItem('mockUser', JSON.stringify(loggedInUser));
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 200));
    setUser(null);
    sessionStorage.removeItem('mockUser');
    setLoading(false);
  }, []);

  const purchasePlan = useCallback((plan: Plan) => {
    if (user) {
      // FIX: Explicitly type updatedUser as User to solve type incompatibility for planType.
      const updatedUser: User = { 
          ...user, 
          status: SubscriptionStatus.ACTIVE, 
          plan, 
          planType: plan === Plan.LIFETIME ? 'lifetime' : 'monthly',
      };
      setUser(updatedUser);
      sessionStorage.setItem('mockUser', JSON.stringify(updatedUser));
      console.log(`Mock purchased plan: ${plan}`);
    }
  }, [user]);

  return useMemo(() => ({
    user,
    loading,
    error,
    isLoggedIn: !!user,
    login,
    logout,
    purchasePlan,
  }), [user, loading, error, login, logout, purchasePlan]);
};