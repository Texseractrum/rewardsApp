"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/button-card";
import { Button } from "@/components/ui/button";
import { Star, Coffee, Pizza, ShoppingBag, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { RewardCardDetail } from "@/app/components/RewardCardDetail";

export default function CustomerDashboard() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(180);
  const [activeIndex, setActiveIndex] = useState(7);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCard, setSelectedCard] = useState<null | number>(null);

  const demoCards = [
    { name: "Star Coffee", icon: Coffee, points: 150, color: "bg-amber-100" },
    { name: "Pizza Palace", icon: Pizza, points: 75, color: "bg-red-100" },
    { name: "Fashion Store", icon: ShoppingBag, points: 200, color: "bg-blue-100" },
    { name: "Star Coffee 2", icon: Coffee, points: 90, color: "bg-amber-100" },
    { name: "Pizza Palace 2", icon: Pizza, points: 45, color: "bg-red-100" },
  ];

  // Triple the cards for infinite effect
  const loopedCards = [...demoCards, ...demoCards, ...demoCards];

  const getCardTransform = (index: number) => {
    const totalCards = loopedCards.length;
    const angleStep = (360 / totalCards);
    const angle = (index * angleStep) + rotation + 180;
    const radius = 300;

    // Convert angle to radians for position calculation
    const angleRad = (angle * Math.PI) / 180;
    const x = Math.sin(angleRad) * radius;
    const y = Math.cos(angleRad) * radius - 240;

    // Calculate if card is in visible arc (front 120 degrees)
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const isInVisibleArc = normalizedAngle >= 300 || normalizedAngle <= 60;
    
    // Calculate distance from center of visible arc (0 degrees)
    const distanceFromCenter = Math.abs(normalizedAngle > 180 ? 360 - normalizedAngle : normalizedAngle);
    
    // More aggressive scale reduction for distant cards
    const scale = isInVisibleArc 
      ? Math.max(0.4, 1 - (distanceFromCenter / 60)) 
      : 0;
    
    // More aggressive opacity reduction for distant cards
    const opacity = isInVisibleArc 
      ? Math.max(0.2, 1 - (distanceFromCenter / 45))
      : 0;

    // Rotate cards to face outward, with center card straight
    const cardRotation = ((angle - 90) % 360 + 360) % 360 - 180;

    const style: React.CSSProperties = {
      transform: `translate(${x}px, ${y}px) rotate(${cardRotation}deg) scale(${scale})`,
      opacity,
      pointerEvents: isInVisibleArc ? 'auto' : 'none',
      zIndex: Math.floor(100 - distanceFromCenter)
    };

    return style;
  };

  const handleCardClick = (index: number) => {
    if (index === activeIndex) {
      setSelectedCard(index);
    } else {
      rotateToIndex(index);
    }
  };

  const rotateToIndex = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const anglePerCard = 360 / loopedCards.length;
    const targetRotation = (-index * anglePerCard) + 180;
    
    // Normalize rotation to prevent large angle accumulation
    const normalizedRotation = ((targetRotation % 360) + 360) % 360;
    setRotation(normalizedRotation);
    setActiveIndex(index);
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[380px] mx-auto h-screen bg-background shadow-xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Your Reward Cards</h2>
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center -mt-40"
            style={{ perspective: "1200px" }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {loopedCards.map((card, index) => {
                const style = getCardTransform(index);
                const isActive = index === activeIndex;

                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                      ...style
                    }}
                  >
                    <Card
                      className={`${card.color} cursor-pointer p-4 transition-shadow hover:shadow-lg ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      style={{
                        width: "38.4vh",
                        height: "calc(38.4vh / 1.75)",
                        transformOrigin: "center center",
                      }}
                      onClick={() => handleCardClick(index)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <card.icon size={32} className="text-primary" />
                        <div className="flex items-center">
                          <Star size={24} className="text-yellow-500 mr-2" />
                          <span className="font-semibold text-xl">{card.points}</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-semibold mb-2">{card.name}</h3>
                      <p className="text-base text-muted-foreground">
                        Tap to view details
                      </p>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedCard !== null && (
        <RewardCardDetail
          name={loopedCards[selectedCard].name}
          points={loopedCards[selectedCard].points}
          color={loopedCards[selectedCard].color}
          icon={loopedCards[selectedCard].icon}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
