"use client";

import { useState } from "react";
import { UserService } from "@/services/user-service";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { UserProfile, UserBank } from "@/types/user";

interface UserAuthProps {
  onAuthenticated: (user: UserProfile, bank: UserBank) => void;
}

export function UserAuth({ onAuthenticated }: UserAuthProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("1000");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    setLoading(true);

    try {
      if (!name.trim()) {
        setError("Please enter your name");
        setLoading(false);
        return;
      }

      const result = UserService.login(name.trim());
      if (!result) {
        setError("User not found. Please sign up first.");
        setLoading(false);
        return;
      }

      onAuthenticated(result.user, result.bank);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    setError("");
    setLoading(true);

    try {
      if (!name.trim()) {
        setError("Please enter your name");
        setLoading(false);
        return;
      }

      const balance = parseFloat(initialBalance);
      if (isNaN(balance) || balance < 0) {
        setError("Please enter a valid initial balance");
        setLoading(false);
        return;
      }

      if (balance < 10) {
        setError("Initial balance must be at least $10");
        setLoading(false);
        return;
      }

      const result = UserService.createUser(name.trim(), balance);
      onAuthenticated(result.user, result.bank);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-500 rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-500 mb-2">
            🃏 BLACKJACK 🃏
          </h1>
          <p className="text-gray-400">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="bg-black text-white border-gray-700"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  mode === "login" ? handleLogin() : handleSignup();
                }
              }}
              autoFocus
            />
          </div>

          {mode === "signup" && (
            <div>
              <Label htmlFor="balance" className="text-white">
                Initial Balance
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <Input
                  id="balance"
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="1000"
                  className="bg-black text-white border-gray-700 pl-7"
                  min="10"
                  step="10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum $10 required</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={mode === "login" ? handleLogin : handleSignup}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Sign Up"}
          </Button>

          <div className="text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-green-500 hover:text-green-400 text-sm"
            >
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-green-500 font-semibold mb-2">How it works:</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Your account and balance are saved locally</li>
            <li>• Play across multiple sessions</li>
            <li>• Track your stats and history</li>
            <li>• Deposit or withdraw anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
