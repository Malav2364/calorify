"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Utensils } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from 'react-hot-toast';
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get form data
      const formData = new FormData(e.target);
      const email = formData.get("email");
      const password = formData.get("password");
      
      // Show login in progress toast
      const loginToastId = toast.loading('Signing in...');
      
      // Use NextAuth's signIn function - this is the key difference
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        // Handle error
        toast.error(result.error || 'Invalid credentials', {
          id: loginToastId
        });
        console.error("Login error:", result.error);
      } else {
        // Success
        toast.success('Logged in successfully!', {
          id: loginToastId
        });
        
        // Show welcome toast
        toast.success(`Welcome back!`, {
          duration: 5000,
          icon: '👋'
        });
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                required 
                className="border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
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
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white flex items-center justify-center"
            >
              {loading ? "Signing in..." : "Sign in"}
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
