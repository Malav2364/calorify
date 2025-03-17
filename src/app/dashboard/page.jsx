"use client"

import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
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
  Bell,
  RefreshCw
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
import { useRouter } from "next/navigation"
import { toast, Toaster } from 'react-hot-toast'

// Calculate BMI
const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
}

// Get BMI category
const getBMICategory = (bmi) => {
  if (!bmi) return { category: "Add height & weight", color: "text-muted-foreground" };
  if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500" };
  if (bmi < 25) return { category: "Normal weight", color: "text-emerald-500" };
  if (bmi < 30) return { category: "Overweight", color: "text-yellow-500" };
  return { category: "Obese", color: "text-red-500" };
}

// Calculate daily calorie needs (Harris-Benedict equation with activity factor)
// Uses an assumed average age of 30 for simplicity
const calculateCalorieNeeds = (weight, height, gender, activityLevel) => {
  if (!weight || !height) return 2000; // Default value if data is missing
  
  let bmr = 0;
  const assumedAge = 30; // Default age for calculation
  
  // Calculate BMR based on gender
  if (gender === "Male") {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * assumedAge);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * assumedAge);
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
    default:
      activityMultiplier = 1.55; // Default to moderate activity
  }
  
  return Math.round(bmr * activityMultiplier);
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [dishes, setDishes] = useState([]);
  const [newDishName, setNewDishName] = useState("");
  const [newDishCalories, setNewDishCalories] = useState("");
  const [userData, setUserData] = useState({
    name: "User",
    height: null,
    weight: null,
    gender: "Male",
    activityLevel: "Moderate",
    goal: "Maintain weight"
  });
  const [loading, setLoading] = useState(true);
  const [calorieHistory, setCalorieHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Set data directly from session
      // console.log("Session data:", session.user);
      setUserData({
        name: session.user.name || "User",
        email: session.user.email,
        height: session.user.height || null,
        weight: session.user.weight || null,
        gender: session.user.gender || "Male",
        activityLevel: "Moderate", 
        goal: "Maintain weight" 
      });
      setLoading(false);
    }
  }, [status, session]);
  
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchDishes = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/dishes', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.status === 401) {
            toast.error('Your session has expired. Please log in again.');
            signOut({ redirect: false });
            router.push('/login');
            return;
          }
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.dishes) {
              // Filter today's dishes
              const today = new Date().toISOString().split('T')[0];
              const todayDishes = data.dishes.filter(dish => {
                return new Date(dish.createdAt).toISOString().split('T')[0] === today;
              });
              
              // Format dishes to match the expected structure
              const formattedDishes = todayDishes.map(dish => ({
                id: dish.id,
                dishName: dish.dishName,
                calories: dish.calories
              }));
              
              setDishes(formattedDishes);
            } else {
              setDishes([]);
            }
          } else {
            console.error('Error fetching dishes:', response.statusText);
            toast.error('Failed to load dishes from server');
            setDishes([]);
          }
        } catch (error) {
          console.error('Error fetching dishes:', error);
          toast.error('Failed to load dishes from server');
          setDishes([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchDishes();
      
      const refreshInterval = setInterval(fetchDishes, 60000); // Refresh every minute
      
      return () => clearInterval(refreshInterval);
    }
  }, [status, router]);
  
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchCalorieHistory = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/user/calories', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.status === 401) {
            toast.error('Your session has expired. Please log in again.');
            signOut({ redirect: false });
            router.push('/login');
            return;
          }
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.calorieHistory) {
              setCalorieHistory(data.calorieHistory);
            } else {
              setCalorieHistory([]);
            }
          } else {
            console.error('Error fetching calorie history:', response.statusText);
            toast.error('Failed to load calorie history from server');
            setCalorieHistory([]);
          }
        } catch (error) {
          console.error('Error fetching calorie history:', error);
          toast.error('Failed to load calorie history from server');
          setCalorieHistory([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCalorieHistory();
    }
  }, [status, router]);
  
  const fetchCalorieHistory = async () => {
    try {
      setHistoryLoading(true);
      console.log('Fetching calorie history...');
      
      const response = await fetch('/api/user/calories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      
      if (response.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        signOut({ redirect: false });
        router.push('/login');
        return;
      }
      
      const data = await response.json();
      console.log('Calorie history response:', data);
      
      if (response.ok && data.success) {
        if (data.history && Array.isArray(data.history)) {
          console.log(`Loaded ${data.history.length} calorie history entries`);
          setCalorieHistory(data.history);
        } else {
          console.log('No calorie history entries found or invalid data format');
          setCalorieHistory([]);
        }
      } else {
        console.error('Failed to fetch calorie history:', data.message);
        setCalorieHistory([]);
      }
    } catch (error) {
      console.error('Error fetching calorie history:', error);
      setCalorieHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCalorieHistory();
    }
  }, [status]);
  
  // Calculate user metrics
  const bmi = calculateBMI(userData.weight, userData.height);
  const bmiCategory = getBMICategory(bmi);
  const totalCaloriesNeeded = calculateCalorieNeeds(
    userData.weight, 
    userData.height, 
    userData.gender, 
    userData.activityLevel
  );
  
  const caloriesConsumed = dishes.reduce((total, dish) => total + Number(dish.calories), 0);
  const caloriesRemaining = totalCaloriesNeeded - caloriesConsumed;
  const consumptionPercentage = Math.round((caloriesConsumed / totalCaloriesNeeded) * 100) || 0;
  
  const getCalorieProgressColor = () => {
    if (consumptionPercentage >= 90) return "bg-red-500";
    if (consumptionPercentage >= 80) return "bg-orange-500";
    if (consumptionPercentage >= 50) return "bg-yellow-500";
    return "bg-emerald-500";
  };
  
  const handleAddDish = async () => {
    if (newDishName && newDishCalories) {
      try {
        setLoading(true);
        const response = await fetch('/api/dishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dishName: newDishName,
            calories: parseInt(newDishCalories)
          })
        });
        
        if (response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          signOut({ redirect: false });
          router.push('/login');
          return;
        }
        
        const data = await response.json();
        
        if (response.ok && data.success && data.dish) {
          // Add the new dish to state
          setDishes([...dishes, {
            id: data.dish.id,
            dishName: data.dish.dishName,
            calories: data.dish.calories
          }]);
          toast.success('Dish added successfully!');
          setNewDishName("");
          setNewDishCalories("");
        } else {
          toast.error(data.message || 'Failed to add dish');
        }
      } catch (error) {
        console.error('Error adding dish:', error);
        toast.error('Failed to add dish. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Please enter both dish name and calories');
    }
  };
  
  const handleDeleteDish = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dishes/${id}`, {
        method: 'DELETE',
      });
      
      if (response.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        signOut({ redirect: false });
        router.push('/login');
        return;
      }
      
      const data = await response.json();
      
      if (response.ok) {
        // Remove dish from state
        setDishes(dishes.filter(dish => dish.id !== id));
        toast.success(data.message || 'Dish deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete dish');
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast.error('An error occurred while deleting the dish');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
const handleNewDay = async () => {
  try {
    setLoading(true);
    // Get today's dishes
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch all dishes from today
    const response = await fetch('/api/dishes', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.dishes) {
        const todayDishes = data.dishes.filter(dish => {
          return new Date(dish.createdAt).toISOString().split('T')[0] === today;
        });
        
        const totalCalories = todayDishes.reduce((total, dish) => {
          return total + parseFloat(dish.calories);
        }, 0);
        
        if (totalCalories > 0) {
          try {
            console.log("Saving calorie history:", {
              date: today,
              calories: totalCalories,
              target: totalCaloriesNeeded || 2000
            });
            
            const saveCaloriesResponse = await fetch('/api/user/calories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                date: today,
                calories: Math.round(totalCalories),
                target: Math.round(totalCaloriesNeeded || 2000)
              })
            });
            
            const saveCaloriesData = await saveCaloriesResponse.json();
            
            if (saveCaloriesResponse.ok) {
              console.log('Calorie history saved successfully');
            } else {
              console.error('Failed to save calorie history:', saveCaloriesData.message);
            }
          } catch (error) {
            console.error('Error saving calorie history:', error);
          }
        }
        
        let deletedCount = 0;
        for (const dish of todayDishes) {
          try {
            const deleteResponse = await fetch(`/api/dishes/${dish.id}`, {
              method: 'DELETE'
            });
            
            if (deleteResponse.ok) {
              deletedCount++;
            }
          } catch (err) {
            console.error(`Error deleting dish ${dish.id}:`, err);
          }
        }
        
        setDishes([]);
        
        if (totalCalories > 0) {
          toast.success(`Day complete! ${Math.round(totalCalories)} calories logged.`);
        } else {
          toast.success('Started new day.');
        }
        
        // Optionally refresh the page to ensure UI is in sync
        // window.location.reload();
      } else {
        toast.info('No dishes found for today.');
      }
    } else {
      toast.error('Failed to fetch dishes. Please try again.');
    }
  } catch (error) {
    console.error('Error starting new day:', error);
    toast.error('Failed to reset dishes for a new day');
  } finally {
    setLoading(false);
  }
};
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Render the rest of your dashboard UI (no changes needed here)
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-emerald-50/30 dark:from-background dark:to-emerald-950/10">
      <Toaster position="top-center" reverseOrder={false} />
      
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
                    <AvatarImage  alt={userData.name} />
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{userData.name}</span>
                    <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-red-500" onClick={handleLogout}>
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
              onClick={handleNewDay}
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
                  <p className="text-3xl font-bold">{bmi || 'N/A'}</p>
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

        {/* Calorie History Section */}
        <Card className="border-emerald-100 dark:border-emerald-900/50 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Calorie History</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 text-xs"
                disabled={historyLoading}
                onClick={fetchCalorieHistory}
              >
                {historyLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-3 w-3 mr-2 border-2 border-emerald-500 rounded-full border-t-transparent"></span>
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Refresh
                  </span>
                )}
              </Button>
            </div>
            <CardDescription>Your past 30 days of calorie tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
                </div>
              ) : calorieHistory && calorieHistory.length > 0 ? (
                calorieHistory.map((entry, index) => (
                  <div 
                    key={index}
                    className="flex justify-between p-3 border border-emerald-100 dark:border-emerald-900/50 rounded-md"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(entry.date).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">consumed</p>
                        <p className="font-bold">{entry.calories}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">target</p>
                        <p className="font-bold">{entry.target}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">difference</p>
                        <p className={`font-bold ${entry.calories > entry.target ? 'text-red-500' : 'text-green-500'}`}>
                          {entry.calories <= entry.target 
                            ? `-${entry.target - entry.calories}` 
                            : `+${entry.calories - entry.target}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No history available yet</p>
                  <p className="text-sm">Complete a day to see your progress</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 text-xs"
                    onClick={fetchCalorieHistory}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
