
'use client';

import { create } from 'zustand';
import { useAdminStore, useCustomerStore } from '@/lib/store';

// This is a simplified auth store that will be replaced by Firebase Auth.
// It uses Zustand for state management for now.

type AuthUser = {
    phoneNumber: string;
    isDeveloper: boolean;
};

type AuthState = {
    user: AuthUser | null;
    login: (phoneNumber: string) => Promise<boolean>;
    logout: () => void;
};

const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    login: async (phoneNumber: string) => {
        // In a real app, this would be an API call to a backend with Firebase Auth
        const { developers } = useAdminStore.getState();
        const { users } = useCustomerStore.getState();

        const isDeveloper = developers.some(d => d.mobileNumber === phoneNumber);
        const isCustomer = users.some(u => u.operatorMobileNumber === phoneNumber);

        if (isDeveloper || isCustomer) {
            set({ user: { phoneNumber, isDeveloper } });
            return true;
        }

        return false;
    },
    logout: () => {
        set({ user: null });
    },
}));

// A simple hook to expose the store's state and actions
export function useAuth() {
    return useAuthStore();
}
