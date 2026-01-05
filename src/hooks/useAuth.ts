
'use client';

import { useAdminStore } from '@/lib/store';
import { useUser } from '@/firebase';

export function useAuth() {
  const { user, loading, error } = useUser(); 
  const { developers, users, login: adminLogin, logout: adminLogout, isAuthenticated } = useAdminStore();

  const login = async (mobileNumber: string): Promise<boolean> => {
    const isDeveloper = developers.some(d => d.mobileNumber === mobileNumber);
    const isUser = users.some(u => u.operatorMobileNumber === mobileNumber);
    
    if (isDeveloper) {
      adminLogin('developer');
      return true;
    }
    if (isUser) {
      adminLogin('owner'); // Assuming any valid customer is an 'owner' for billing
      return true;
    }
    
    return false;
  };
  
  const logout = () => {
    adminLogout();
  };

  return { user, loading, error, login, logout, isAuthenticated };
}
