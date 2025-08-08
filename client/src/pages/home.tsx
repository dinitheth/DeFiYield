import React from "react";
import { Link } from "wouter";
import { PlusCircle, Search, Shield, Cpu, Coins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background to-muted py-16 lg:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzE0YjhhNiIgZmlsbC1vcGFjaXR5PSIwLjAzIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPgo8L2c+CjwvZz4KPC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-foreground">Private Trade</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Intents
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Create and fulfill decentralized trade intents using Anoma-style logic with complete privacy via Namada's shielded transfers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/create">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Intent
                </Button>
              </Link>
              
              <Link href="/explore">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto text-lg px-8 py-4"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Explore Intents
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center animate-slide-up">
                <div className="text-3xl font-bold text-primary mb-2">156</div>
                <div className="text-sm text-muted-foreground">Active Intents</div>
              </div>
              <div className="text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="text-3xl font-bold text-primary mb-2">$2.1M</div>
                <div className="text-sm text-muted-foreground">Volume Matched</div>
              </div>
              <div className="text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Shielded Transfers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Anoma-Style Intent Architecture
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              70% local-first logic, 30% Namada execution. Complete privacy with MASP shielded transfers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-border hover:border-primary/50 transition-colors duration-200">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Privacy-First</h3>
                <p className="text-muted-foreground">
                  All trades executed via Namada's MASP for complete transaction privacy and asset protection.
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="border-border hover:border-primary/50 transition-colors duration-200">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Local-First Logic</h3>
                <p className="text-muted-foreground">
                  Intent matching and solver logic runs entirely client-side with no backend dependencies.
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 3 */}
            <Card className="border-border hover:border-primary/50 transition-colors duration-200">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Multi-Asset Support</h3>
                <p className="text-muted-foreground">
                  Trade NAM, ATOM, OSMO, USDC and other IBC assets on Namada mainnet.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple, secure, and completely private
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-primary-foreground font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Create Intent</h3>
              <p className="text-muted-foreground">
                Define your trade parameters and store locally with expiry.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-primary-foreground font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Find Matches</h3>
              <p className="text-muted-foreground">
                Client-side solver finds compatible trading pairs automatically.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-primary-foreground font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Sign & Execute</h3>
              <p className="text-muted-foreground">
                Approve via Namada Keychain for shielded settlement.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-primary-foreground font-bold text-xl">4</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Private Settlement</h3>
              <p className="text-muted-foreground">
                Assets transferred via MASP with complete privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Trading Privately?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the privacy-first trading revolution on Namada mainnet
          </p>
          <Link href="/create">
            <Button size="lg" className="text-lg px-8 py-4">
              Create Your First Intent
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
