
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Logo } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const ALL_ROLES: UserRole[] = ['Store Supervisor', 'Liaison', 'Cashier', 'Accounting'];

export function LoginForm() {
    const [email, setEmail] = useState('demo@ltoportal.com');
    const [password, setPassword] = useState('password');
    const [role, setRole] = useState<UserRole>('Store Supervisor');
    const { user, login } = useAuth();
    const router = useRouter();
    const { setTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
          router.push('/home');
        }
    }, [user, router]);


    const handleLogin = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            let name = `Demo ${role}`;
            if (role === 'Liaison') {
                name = 'Bryle Nikko Hamili';
            } else if (role === 'Store Supervisor') {
                name = 'Naruto Uzumaki';
            } else if (role === 'Cashier') {
                name = 'Sasuke Uchiha';
            } else if (role === 'Accounting') {
                name = 'Sakura Haruno';
            }
            login({ email, name, role });
            // The useEffect will handle the redirect
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full relative">
             <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setTheme('light')}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <span className="sr-only">Set light theme</span>
                </Button>
                 <Button variant="outline" size="icon" onClick={() => setTheme('dark')}>
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Set dark theme</span>
                </Button>
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Logo className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>Select a role to log in to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALL_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleLogin} className="w-full mt-2" loading={isLoading}>
                            Login as {role}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
