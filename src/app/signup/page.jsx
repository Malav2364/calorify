"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Utensils } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast, Toaster } from 'react-hot-toast';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState("");
  const router = useRouter();

  const handleGenderChange = (value) => {
    setGender(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get form data
      const formData = new FormData(e.target);
      const userData = {
        name: formData.get("firstName"),
        email: formData.get("email"),
        password: formData.get("password"),
        height: parseFloat(formData.get("height")),
        weight: parseFloat(formData.get("weight")),
        gender: gender
      };

      // Show signup in progress toast
      const signupToastId = toast.loading('Creating your account...');
      
      // Step 1: Create the user account
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const signupData = await signupResponse.json();
      
      if (!signupResponse.ok) {
        // Update the loading toast to error
        toast.error(signupData.message || 'Failed to create account', {
          id: signupToastId
        });
        throw new Error(signupData.message || 'Failed to create account');
      }
      
      // Update signup toast to success
      toast.success('Account created successfully!', {
        id: signupToastId
      });
      
      // Show login in progress toast
      const loginToastId = toast.loading('Logging you in...');
      
      // Step 2: Log the user in
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok) {
        // Update the loading toast to error
        toast.error('Account created but login failed. Please log in manually.', {
          id: loginToastId
        });
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        
        return;
      }
      
      // Update login toast to success
      toast.success('Logged in successfully!', {
        id: loginToastId
      });
      
      // Store the token and user data in localStorage for client-side usage
      localStorage.setItem('authToken', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      
      // Show welcome toast
      toast.success(`Welcome to Calorify, ${loginData.user.name}!`, {
        duration: 5000,
        icon: '👋'
      });
      
      // Redirect to dashboard
      router.push('/login');
      
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'An error occurred during signup');
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
          <h1 className="text-2xl font-bold text-center mb-6">Create your account</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName"
                  required 
                  className="border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
                />
              </div>
            </div>
            
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
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                className="border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            
            {/* Gender Selection */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={gender}
                onValueChange={handleGenderChange}
                required
              >
                <SelectTrigger 
                  id="gender"
                  className="w-full border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Hidden input to store gender value for form submission */}
              <Input 
                type="hidden" 
                name="gender" 
                value={gender} 
              />
            </div>
            
            {/* Height Input */}
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <div className="flex gap-2">
                <Input 
                  id="height" 
                  name="height"
                  type="number" 
                  min="1"
                  required 
                  className="flex-1 border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
                />
                <Select defaultValue="cm" name="heightUnit">
                  <SelectTrigger className="w-24 border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="ft">ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Weight Input */}
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <div className="flex gap-2">
                <Input 
                  id="weight" 
                  name="weight"
                  type="number" 
                  min="1"
                  step="0.1"
                  required 
                  className="flex-1 border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
                />
                <Select defaultValue="kg" name="weightUnit">
                  <SelectTrigger className="w-24 border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white flex items-center justify-center"
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </div>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-500 dark:text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
