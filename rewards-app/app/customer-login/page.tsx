"use client";

// TODO - centre content

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UserLogin() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // NO WAY TO CHANGE BACK - HOW TO DO ACCOUNTS
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-[380px] min-h-screen bg-background shadow-xl p-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">User Login</h2>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    );
  } else router.push("/customer-dashboard");
}
