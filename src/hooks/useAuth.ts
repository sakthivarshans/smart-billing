'use client';

import { useAdminStore } from '@/lib/store';
import { useUser } from '@/firebase';

export function useAuth() {
  // This hook will be updated to use Firebase Authentication.
  // The current implementation is a temporary placeholder.
  const { user, loading, error } = useUser(); 
  const { developers, users, login: customerLogin, logout: customerLogout, isAuthenticated } = useCustomerStore();

  const login = async (mobileNumber: string): Promise<boolean> => {
    const isDeveloper = developers.some(d => d.mobileNumber === mobileNumber);
    const isUser = users.some(u => u.operatorMobileNumber === mobileNumber);
    
    if (isDeveloper || isUser) {
      customerLogin(mobileNumber, isDeveloper ? 'developer' : 'owner');
      return true;
    }
    
    return false;
  };
  
  const logout = () => {
    customerLogout();
  };

  return { user, loading, error, login, logout, isAuthenticated };
}
