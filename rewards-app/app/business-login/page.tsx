"use client";

import { useState } from "react";
import { Card } from "@/components/ui/button-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Coffee, Share, Plus, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BusinessLogin() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push("/");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-[380px] min-h-screen bg-background shadow-xl p-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Business Login</h2>
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
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-[380px] min-h-screen bg-background shadow-xl p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Business Card</h2>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <Card className="p-6 bg-amber-100 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <Coffee size={32} className="text-primary" />
            <div className="text-sm font-medium">Business Card</div>
          </div>
          <h3 className="text-xl font-semibold">Star Coffee</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Premium Coffee Shop
          </p>
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-sm font-medium">Reward System</p>
            <p className="text-xs text-muted-foreground">
              1 point per $1 spent
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-14 space-x-2"
            onClick={() => {}}
          >
            <Share size={20} />
            <span>Share Card</span>
          </Button>
          <Button className="h-14 space-x-2" onClick={() => {}}>
            <Plus size={20} />
            <span>Give Points</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
