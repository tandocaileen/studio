
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'Store Supervisor' | 'Liaison' | 'Cashier' | 'Accounting';

export type User = {
    email: string;
    name: string;
    role: UserRole;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to set a cookie
const setCookie = (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    // Encode the value to handle special characters
    document.cookie = name + "=" + (encodeURIComponent(value) || "")  + expires + "; path=/";
}

// Helper function to remove a cookie
const removeCookie = (name: string) => {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('ltoportal-user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.role) {
                    setUser(parsedUser);
                } else {
                     localStorage.removeItem('ltoportal-user');
                     removeCookie('ltoportal-user');
                }
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('ltoportal-user');
            removeCookie('ltoportal-user');
        }
        setLoading(false);
    }, []);

    const login = (userData: User) => {
        let finalUserData = { ...userData };
        if (userData.role === 'Store Supervisor') {
            finalUserData.name = 'Naruto Uzumaki';
        } else if (userData.role === 'Cashier') {
            finalUserData.name = 'Sasuke Uchiha';
        } else if (userData.role === 'Accounting') {
            finalUserData.name = 'Sakura Haruno';
        } else if (userData.role === 'Liaison' && finalUserData.name.startsWith('Demo')) {
            finalUserData.name = 'Bryle Nikko Hamili';
        }


        const userString = JSON.stringify(finalUserData);
        setUser(finalUserData);
        localStorage.setItem('ltoportal-user', userString);
        // Set a session cookie for the middleware to read
        setCookie('ltoportal-user', userString, 1);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ltoportal-user');
        localStorage.removeItem('data_generated_flag');
        // Remove the session cookie
        removeCookie('ltoportal-user');
        // Use window.location to ensure a full page refresh and state clearing
        window.location.href = '/login?reset_data=true';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
