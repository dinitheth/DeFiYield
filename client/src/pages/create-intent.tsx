import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpDown, ShieldCheck, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/components/wallet-provider";
import { useIntents } from "@/hooks/use-intents";
import { createIntentSchema, SUPPORTED_TOKENS } from "@shared/schema";
import { useLocation } from "wouter";
import { z } from "zod";

const formSchema = createIntentSchema;

type FormData = z.infer<typeof formSchema>;

export default function CreateIntent() {
  const { toast } = useToast();
  const { isConnected, address } = useWalletContext();
  const { createIntent } = useIntents();
  const [, setLocation] = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromToken: "",
      fromAmount: "",
      toToken: "",
      toAmount: "",
      expiry: "24h",
      creatorAddress: address || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Namada Keychain wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate expiry date
      const now = new Date();
      const expiryDate = new Date(now);
      
      switch (data.expiry) {
        case "1h":
          expiryDate.setHours(now.getHours() + 1);
          break;
        case "6h":
          expiryDate.setHours(now.getHours() + 6);
          break;
        case "24h":
          expiryDate.setDate(now.getDate() + 1);
          break;
        case "7d":
          expiryDate.setDate(now.getDate() + 7);
          break;
        case "30d":
          expiryDate.setDate(now.getDate() + 30);
          break;
        default:
          expiryDate.setDate(now.getDate() + 1);
      }

      const intentData = {
        ...data,
        expiry: expiryDate.toISOString(),
        creatorAddress: address,
      };

      await createIntent(intentData);
      
      // Reset form
      form.reset();
      
      // Redirect to explore page
      setTimeout(() => {
        setLocation("/explore");
      }, 1000);
      
    } catch (error) {
      console.error("Failed to create intent:", error);
    }
  };

  const swapTokens = () => {
    const fromToken = form.getValues("fromToken");
    const fromAmount = form.getValues("fromAmount");
    const toToken = form.getValues("toToken");
    const toAmount = form.getValues("toAmount");

    form.setValue("fromToken", toToken);
    form.setValue("fromAmount", toAmount);
    form.setValue("toToken", fromToken);
    form.setValue("toAmount", fromAmount);
  };

  const setMaxAmount = () => {
    // TODO: Get actual balance from wallet
    const mockBalance = "1250.50";
    form.setValue("fromAmount", mockBalance);
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Card>
          <CardContent className="p-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-muted-foreground mb-8">
              Please connect your Namada Keychain wallet to create trade intents.
            </p>
            <Button>Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Create Trade Intent
        </h1>
        <p className="text-lg text-muted-foreground">
          Define your trade parameters. Intent will be stored locally and matched with compatible trades.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-8">
              {/* From Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">You're Trading</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fromToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUPPORTED_TOKENS.map((token) => (
                              <SelectItem key={token.symbol} value={token.symbol}>
                                {token.symbol} - {token.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fromAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.000001"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                            onClick={setMaxAmount}
                          >
                            MAX
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Balance: <span className="font-mono">1,250.50 NAM</span>
                  </span>
                </div>
              </div>

              {/* Swap Arrow */}
              <div className="flex justify-center mb-6">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={swapTokens}
                  className="rounded-full"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>

              {/* To Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">For</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="toToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUPPORTED_TOKENS.map((token) => (
                              <SelectItem key={token.symbol} value={token.symbol}>
                                {token.symbol} - {token.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            step="0.000001"
                            min="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Advanced Options */}
              <div className="border-t border-border pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1h">1 Hour</SelectItem>
                            <SelectItem value="6h">6 Hours</SelectItem>
                            <SelectItem value="24h">24 Hours</SelectItem>
                            <SelectItem value="7d">7 Days</SelectItem>
                            <SelectItem value="30d">30 Days</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Privacy Mode</FormLabel>
                    <div className="flex items-center space-x-3 px-4 py-3 bg-accent rounded-lg border">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-accent-foreground">
                        Shielded (MASP)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intent Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Intent Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trade:</span>
                  <span className="text-foreground font-mono">
                    {form.watch("fromAmount") || "0"} {form.watch("fromToken") || "TOKEN"} → {form.watch("toAmount") || "0"} {form.watch("toToken") || "TOKEN"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="text-foreground">
                    {form.watch("expiry") === "1h" && "In 1 hour"}
                    {form.watch("expiry") === "6h" && "In 6 hours"}
                    {form.watch("expiry") === "24h" && "In 24 hours"}
                    {form.watch("expiry") === "7d" && "In 7 days"}
                    {form.watch("expiry") === "30d" && "In 30 days"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage:</span>
                  <span className="text-primary">Local (IndexedDB)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Privacy:</span>
                  <span className="text-primary flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Shielded</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="lg"
            className="w-full text-lg"
            disabled={!form.formState.isValid}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Intent
          </Button>
        </form>
      </Form>
    </div>
  );
}
