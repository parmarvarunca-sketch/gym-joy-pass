import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dumbbell, Zap, Users, Award } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="container relative mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Welcome to FitLife Gym</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-7xl">
              Transform Your Body,
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Transform Your Life
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Join thousands of members achieving their fitness goals with our state-of-the-art facilities,
              expert trainers, and flexible membership plans.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Premium Equipment</h3>
              <p className="text-muted-foreground">
                State-of-the-art machines and free weights for every fitness level
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Expert Trainers</h3>
              <p className="text-muted-foreground">
                Certified professionals to guide you every step of the way
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Flexible Plans</h3>
              <p className="text-muted-foreground">
                Choose from multiple membership options that fit your lifestyle
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
