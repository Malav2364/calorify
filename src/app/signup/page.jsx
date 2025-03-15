"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Utensils } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SignupPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      // Handle redirect or success notification
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-emerald-50 dark:from-background dark:to-emerald-950/20 px-4 py-10">
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
                  required 
                  className="border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                className="border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                className="border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            
            {/* Height Input */}
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <div className="flex gap-2">
                <Input 
                  id="height" 
                  type="number" 
                  min="1"
                  required 
                  className="flex-1 border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
                />
                <Select defaultValue="cm">
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
                  type="number" 
                  min="1"
                  step="0.1"
                  required 
                  className="flex-1 border-emerald-200 dark:border-emerald-900/50 focus:ring-emerald-500 dark:focus:ring-emerald-600" 
                />
                <Select defaultValue="kg">
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
  )
}
