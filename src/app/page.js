import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/dl-toggle";
import { ArrowRight, PieChart, Target, Utensils, Activity } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b w-full">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-full">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 dark:bg-emerald-600 rounded-md p-1">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">
              Calori<span className="text-emerald-500 dark:text-emerald-400">fy</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/signup">
              <Button className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white">Sign in</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full">
        <section className="w-full px-4 py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-emerald-50 dark:from-background dark:to-emerald-950/20">
          <div className="container mx-auto max-w-[1200px]">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Track your calories <span className="text-emerald-500 dark:text-emerald-400">effortlessly</span>
                </h1>
                <p className="text-muted-foreground text-lg">
                  Maintain a healthy lifestyle by tracking your daily calorie intake. 
                  Set goals, monitor progress, and achieve your fitness objectives.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="flex items-center justify-center border-emerald-500 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="relative h-[350px] rounded-xl overflow-hidden bg-white/50 dark:bg-white/5 border border-emerald-100 dark:border-emerald-900/50 shadow-lg shadow-emerald-100/20 dark:shadow-emerald-900/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 dark:bg-black/50 backdrop-blur-sm p-8 rounded-xl shadow-md">
                    <PieChart className="h-24 w-24 text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full px-4 py-12 md:py-24 border-t border-emerald-100 dark:border-emerald-900/50">
          <div className="container mx-auto max-w-[1200px]">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
              Key <span className="text-emerald-500 dark:text-emerald-400">Features</span>
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card p-6 rounded-lg border border-emerald-100 dark:border-emerald-900/50 shadow-sm hover:shadow-md hover:shadow-emerald-100/20 dark:hover:shadow-emerald-900/10 transition-shadow">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full w-fit mb-4">
                  <Utensils className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Food Logging</h3>
                <p className="text-muted-foreground">
                  Easily log your meals and track your daily calorie intake with our extensive food database.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-emerald-100 dark:border-emerald-900/50 shadow-sm hover:shadow-md hover:shadow-emerald-100/20 dark:hover:shadow-emerald-900/10 transition-shadow">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full w-fit mb-4">
                  <Target className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Goal Setting</h3>
                <p className="text-muted-foreground">
                  Set personalized calorie and nutrition goals based on your weight and fitness objectives.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-emerald-100 dark:border-emerald-900/50 shadow-sm hover:shadow-md hover:shadow-emerald-100/20 dark:hover:shadow-emerald-900/10 transition-shadow">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full w-fit mb-4">
                  <Activity className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Visualize your progress with detailed charts and statistics to stay motivated.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100 dark:border-emerald-900/50 py-6 md:py-8 w-full bg-background">
        <div className="container mx-auto px-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-[1200px]">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 dark:bg-emerald-600 rounded-md p-1">
              <Utensils className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">
              Calori<span className="text-emerald-500 dark:text-emerald-400">fy</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Calorify. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}