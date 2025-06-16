
// @ts-nocheck
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { login } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, BarChartBig, BrainCircuit, Users, Building } from 'lucide-react';

// Placeholder Google SVG Icon
const GoogleIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

// Placeholder Microsoft SVG Icon
const MicrosoftIcon = () => (
  <svg className="mr-2 h-5 w-5" viewBox="0 0 23 23" fill="currentColor">
    <path fill="#f3f3f3" d="M0 0H23V23H0z" />
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
);

const FeatureHighlights = [
  { icon: ShieldCheck, text: "Secure Access", "data-ai-hint": "security protection" },
  { icon: BarChartBig, text: "Data Analytics", "data-ai-hint": "charts graphs" },
  { icon: BrainCircuit, text: "AI Insights", "data-ai-hint": "artificial intelligence" },
  { icon: Users, text: "Customer Mgmt", "data-ai-hint": "team collaboration" },
];

export function LoginForm() {
  const [email, setEmail] = useState('demouser@lumiq.ai'); // Pre-fill for demo
  const [password, setPassword] = useState('lumiq123'); // Pre-fill for demo
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Using email as username for the auth function
      await login(email, password); 
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      router.push('/chat');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-background p-4 selection:bg-primary/20 selection:text-primary">
      {/* Left Side Content */}
      <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col items-center md:items-start text-center md:text-left p-8 md:pr-16">
        <div className="flex items-center mb-6">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg mr-4">
            {/* Placeholder BankChat Logo SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="9" width="18" height="12" rx="2" ry="2"></rect>
              <path d="M7 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
              <line x1="12" y1="13" x2="12" y2="17"></line>
              <line x1="9" y1="13" x2="9" y2="17"></line>
              <line x1="15" y1="13" x2="15" y2="17"></line>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-headline">BankChat</h1>
            <p className="text-sm text-muted-foreground">Relationship Manager Portal</p>
          </div>
        </div>
        <h2 className="text-5xl font-bold text-foreground mb-4 font-headline">Welcome Back</h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-lg">
          Access your customer insights and AI-powered banking analytics dashboard.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          {FeatureHighlights.map((feature, index) => (
            <div 
              key={index} 
              className="p-4 border rounded-lg bg-card flex items-center space-x-3 shadow-sm hover:shadow-md transition-shadow"
              data-ai-hint={feature['data-ai-hint']}
            >
              <feature.icon className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-card-foreground">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex justify-center p-4">
        <Card className="w-full max-w-md shadow-xl rounded-xl p-2 sm:p-4">
          <CardContent className="p-6 sm:p-8">
            <div className="text-left mb-8">
              <h3 className="text-2xl font-bold text-foreground font-headline">Sign In</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred login method.</p>
            </div>
            
            <Button className="w-full mb-4 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base">
              <Building className="mr-2 h-5 w-5" /> Continue with Bank SSO
            </Button>

            <div className="flex items-center space-x-2 mb-4">
              <Button variant="outline" className="w-full py-5 text-sm">
                <GoogleIcon /> Google
              </Button>
              <Button variant="outline" className="w-full py-5 text-sm">
                <MicrosoftIcon /> Microsoft
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="demouser@lumiq.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 py-6 text-base border-input focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 py-6 text-base border-input focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" />
                  <Label htmlFor="remember-me" className="font-normal text-muted-foreground">Remember me</Label>
                </div>
                <a href="#" className="font-medium text-primary hover:underline">Forgot password?</a>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            <p className="mt-8 text-center text-xs text-muted-foreground">
              Need help? <a href="#" className="font-medium text-primary hover:underline">Contact IT Support</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
