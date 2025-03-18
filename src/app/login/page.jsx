"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Utensils } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from 'react-hot-toast';
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // We'll use a different approach that doesn't require toast.isActive
  const toastIdRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Create a toast and store its ID
    const toastId = toast.loading('Logging in...');
    toastIdRef.current = toastId;
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result.error) {
        setError(result.error);
        // Update the existing toast instead of checking if it's active
        toast.error('Login failed: ' + result.error, { id: toastId });
      } else if (result.ok) {
        toast.success('Successfully logged in!', { id: toastId });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      // Update the existing toast
      toast.error('An unexpected error occurred', { id: toastId });
    } finally {
      setLoading(false);
      
      // Instead of checking if toast is active, use a safer approach
      // The toast will be automatically dismissed when updated above
      // But let's add a fallback in case those updates didn't happen
      setTimeout(() => {
        // Try to dismiss the toast after a delay, ignoring any errors
        try {
          toast.dismiss(toastIdRef.current);
        } catch (e) {
          // Ignore any errors that might occur when dismissing
          console.log("Toast already dismissed or couldn't be found");
        }
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-emerald-50 dark:from-background dark:to-emerald-950/20 px-4 py-10">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="absolute top-4 left-4">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-emerald-500 dark:bg-emerald-600 rounded-md p-1.5 mr-2">
            <Utensils className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl">
            Calori<span className="text-emerald-500 dark:text-emerald-400">fy</span>
          </span>
        </div>
        
        <div className="bg-card border border-emerald-100 dark:border-emerald-900/50 rounded-lg shadow-lg shadow-emerald-100/10 dark:shadow-emerald-900/10 p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Sign in to your account</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                required 
                className="border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-emerald-500 dark:text-emerald-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                className="border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-emerald-500 dark:text-emerald-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
