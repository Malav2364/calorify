"use client"

import React, { useState, useEffect } from 'react'
import { 
  ArrowDownIcon, 
  PlusIcon, 
  UserIcon,
  Utensils,
  BarChart4,
  Calendar,
  Activity,
  LogOut,
  Settings,
  Bell
} from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/ui/dl-toggle"
import { cn } from "@/lib/utils"

// Mock user data
const userData = {
  name: "John Doe",
  height: 175, // cm
  weight: 70, // kg
  age: 32,
  gender: "Male",
  activityLevel: "Moderate",
  goal: "Maintain weight"
}

// Mock dish data
const initialDishes = [
  { id: 1, dishName: "Oatmeal with berries", calories: 320 },
  { id: 2, dishName: "Grilled chicken salad", calories: 450 },
  { id: 3, dishName: "Protein shake", calories: 180 }
]

// Calculate BMI
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
}

// Get BMI category
const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500" };
  if (bmi < 25) return { category: "Normal weight", color: "text-emerald-500" };
  if (bmi < 30) return { category: "Overweight", color: "text-yellow-500" };
  return { category: "Obese", color: "text-red-500" };
}

// Calculate daily calorie needs (Harris-Benedict equation with activity factor)
const calculateCalorieNeeds = (weight, height, age, gender, activityLevel) => {
  let bmr = 0;
  
  // Calculate BMR based on gender
  if (gender === "Male") {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  // Apply activity multiplier
  let activityMultiplier = 1.2; // Sedentary
  switch (activityLevel) {
    case "Light":
      activityMultiplier = 1.375;
      break;
    case "Moderate":
      activityMultiplier = 1.55;
      break;
    case "Active":
      activityMultiplier = 1.725;
      break;
    case "Very Active":
      activityMultiplier = 1.9;
      break;
  }
  
  return Math.round(bmr * activityMultiplier);
}

export default function Dashboard() {
  const [dishes, setDishes] = useState([]);
  const [newDishName, setNewDishName] = useState("");
  const [newDishCalories, setNewDishCalories] = useState("");
  
  // Load dishes from localStorage on initial render
  useEffect(() => {
    const savedDishes = localStorage.getItem("calorify-dishes");
    if (savedDishes) {
      setDishes(JSON.parse(savedDishes));
    } else {
      setDishes(initialDishes);
      localStorage.setItem("calorify-dishes", JSON.stringify(initialDishes));
    }
  }, []);
  
  // Save dishes to localStorage whenever they change
  useEffect(() => {
    if (dishes.length > 0) {
      localStorage.setItem("calorify-dishes", JSON.stringify(dishes));
    }
  }, [dishes]);
  
  // Calculate user metrics
  const bmi = calculateBMI(userData.weight, userData.height);
  const bmiCategory = getBMICategory(bmi);
  const totalCaloriesNeeded = calculateCalorieNeeds(
    userData.weight, 
    userData.height, 
    userData.age, 
    userData.gender, 
    userData.activityLevel
  );
  
  // Calculate calories consumed today
  const caloriesConsumed = dishes.reduce((total, dish) => total + dish.calories, 0);
  const caloriesRemaining = totalCaloriesNeeded - caloriesConsumed;
  const consumptionPercentage = Math.round((caloriesConsumed / totalCaloriesNeeded) * 100);
  
  // Determine calorie progress color based on consumption percentage
  const getCalorieProgressColor = () => {
    if (consumptionPercentage >= 90) return "bg-red-500";
    if (consumptionPercentage >= 80) return "bg-orange-500";
    if (consumptionPercentage >= 50) return "bg-yellow-500";
    return "bg-emerald-500";
  };
  
  // Add new dish
  const handleAddDish = () => {
    if (newDishName && newDishCalories) {
      const newDish = {
        id: Date.now(),
        dishName: newDishName,
        calories: parseInt(newDishCalories)
      };
      
      setDishes([...dishes, newDish]);
      setNewDishName("");
      setNewDishCalories("");
    }
  };
  
  // Delete a dish
  const handleDeleteDish = (id) => {
    setDishes(dishes.filter(dish => dish.id !== id));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-emerald-50/30 dark:from-background dark:to-emerald-950/10">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-emerald-100 dark:border-emerald-900/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 dark:bg-emerald-600 rounded-md p-1">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">
              Calori<span className="text-emerald-500 dark:text-emerald-400">fy</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-emerald-200 dark:border-emerald-800">
                    <AvatarImage src="/avatar.png" alt={userData.name} />
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-red-500">
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {userData.name.split(' ')[0]}</h1>
            <p className="text-muted-foreground">Track your nutrition and stay on target with your goals</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
              <Calendar className="h-4 w-4 mr-2" /> Today
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
              onClick={() => {
                // Reset dishes for a new day
                setDishes([]);
                localStorage.removeItem("calorify-dishes");
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" /> New Day
            </Button>
          </div>
        </div>
        
        {/* Key Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* BMI Card */}
          <Card className="border-emerald-100 dark:border-emerald-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground">BMI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold">{bmi}</p>
                  <p className={`text-sm font-medium ${bmiCategory.color}`}>
                    {bmiCategory.category}
                  </p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                  <Activity className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Daily Calorie Target Card */}
          <Card className="border-emerald-100 dark:border-emerald-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground">Daily Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold">{totalCaloriesNeeded}</p>
                  <p className="text-sm font-medium text-muted-foreground">calories</p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                  <BarChart4 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Calories Consumed Card */}
          <Card className="border-emerald-100 dark:border-emerald-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground">Consumed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold">{caloriesConsumed}</p>
                  <p className="text-sm font-medium text-muted-foreground">calories</p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                  <Utensils className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Calories Remaining Card */}
          <Card className="border-emerald-100 dark:border-emerald-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className={`text-3xl font-bold ${caloriesRemaining < 0 ? 'text-red-500' : ''}`}>
                    {caloriesRemaining}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">calories</p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                  <ArrowDownIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Progress Bar */}
        <Card className="border-emerald-100 dark:border-emerald-900/50 mb-8">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Daily Calorie Progress</CardTitle>
              <Badge variant={consumptionPercentage > 100 ? "destructive" : "outline"} className="font-medium">
                {consumptionPercentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  getCalorieProgressColor()
                )}
                style={{ 
                  width: `${Math.min(consumptionPercentage, 100)}%` 
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>0</span>
              <span>{Math.floor(totalCaloriesNeeded / 2)}</span>
              <span>{totalCaloriesNeeded}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Dish Log Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Add New Dish */}
          <Card className="border-emerald-100 dark:border-emerald-900/50">
            <CardHeader>
              <CardTitle>Add Dish</CardTitle>
              <CardDescription>Log what you've eaten today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="dishName" className="text-sm font-medium mb-1 block">Dish Name</label>
                  <Input 
                    id="dishName"
                    placeholder="Enter dish name" 
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    className="border-emerald-200 dark:border-emerald-900/50"
                  />
                </div>
                <div>
                  <label htmlFor="calories" className="text-sm font-medium mb-1 block">Calories</label>
                  <Input 
                    id="calories"
                    placeholder="Enter calories" 
                    type="number"
                    value={newDishCalories}
                    onChange={(e) => setNewDishCalories(e.target.value)}
                    className="border-emerald-200 dark:border-emerald-900/50"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
                onClick={handleAddDish}
              >
                Add Dish
              </Button>
            </CardFooter>
          </Card>
          
          {/* Dish List */}
          <Card className="border-emerald-100 dark:border-emerald-900/50">
            <CardHeader>
              <CardTitle>Today's Dishes</CardTitle>
              <CardDescription>All dishes you've logged today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {dishes.map((dish) => (
                  <div 
                    key={dish.id} 
                    className="flex justify-between p-3 border border-emerald-100 dark:border-emerald-900/50 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
                  >
                    <div>
                      <p className="font-medium">{dish.dishName}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-4">
                        <p className="font-bold">{dish.calories}</p>
                        <p className="text-xs text-muted-foreground">calories</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                        onClick={() => handleDeleteDish(dish.id)}
                      >
                        <span className="sr-only">Delete</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {dishes.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No dishes logged yet today</p>
                    <p className="text-sm">Add your first dish from the form</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-emerald-100 dark:border-emerald-900/50 pt-4">
              <p className="text-sm text-muted-foreground">Total dishes: {dishes.length}</p>
              <p className="font-medium">Total: <span className="font-bold">{caloriesConsumed}</span> calories</p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
