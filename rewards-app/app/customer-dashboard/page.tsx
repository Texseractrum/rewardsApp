"use client";

import { useState } from "react";
import { Card } from "@/components/ui/button-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, Coffee, Pizza, ShoppingBag, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();
  const handleLogout = () => {
    router.push("/");
  };

  const demoCards = [
    { name: "Star Coffee", icon: Coffee, points: 150, color: "bg-amber-100" },
    { name: "Pizza Palace", icon: Pizza, points: 75, color: "bg-red-100" },
    {
      name: "Fashion Store",
      icon: ShoppingBag,
      points: 200,
      color: "bg-blue-100",
    },
    { name: "Star Coffee 2", icon: Coffee, points: 90, color: "bg-amber-100" },
    { name: "Pizza Palace 2", icon: Pizza, points: 45, color: "bg-red-100" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[380px] mx-auto h-screen bg-background shadow-xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Reward Cards</h2>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center">
          <div className="overflow-x-auto w-full">
            <div
              className="flex gap-4"
              style={{ width: "max-content", paddingRight: "1rem" }}
            >
              {demoCards.map((card, index) => (
                <div
                  key={index}
                  className="flex-none"
                  style={{ width: "214px" }}
                >
                  <Card
                    className={`${card.color} transition-all duration-300 hover:shadow-lg transform rotate-90 h-[336px] cursor-pointer p-6`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <card.icon size={24} className="text-primary" />
                      <div className="flex items-center">
                        <Star size={14} className="text-yellow-500 mr-1" />
                        <span className="font-semibold">{card.points}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{card.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Tap to view details
                    </p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
