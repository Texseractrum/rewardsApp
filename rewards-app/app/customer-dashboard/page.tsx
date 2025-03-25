"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/button-card";
import { Button } from "@/components/ui/button";
import {
  Star,
  Coffee,
  Pizza,
  ShoppingBag,
  LogOut,
  Camera,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { RewardCardDetail } from "@/app/components/RewardCardDetail";
import { useQRCode } from "next-qrcode";
import dynamic from "next/dynamic";

// Dynamically import the QRCodeScanner with SSR disabled
const QRCodeScanner = dynamic(() => import("@/app/components/QRCodeScanner"), {
  ssr: false,
});

export default function CustomerDashboard() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(180);
  const [activeIndex, setActiveIndex] = useState(7);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCard, setSelectedCard] = useState<null | number>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // This effect runs once after component mounts on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Triple the cards for infinite effect
  const loopedCards = [...demoCards, ...demoCards, ...demoCards];

  const getCardTransform = (index: number) => {
    const totalCards = loopedCards.length;
    const angleStep = 360 / totalCards;
    const angle = index * angleStep + rotation + 180;
    const radius = 300;

    // Convert angle to radians for position calculation
    const angleRad = (angle * Math.PI) / 180;
    const x = Math.sin(angleRad) * radius;
    const y = Math.cos(angleRad) * radius - 240;

    // Calculate if card is in visible arc (front 120 degrees)
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const isInVisibleArc = normalizedAngle >= 300 || normalizedAngle <= 60;

    // Calculate distance from center of visible arc (0 degrees)
    const distanceFromCenter = Math.abs(
      normalizedAngle > 180 ? 360 - normalizedAngle : normalizedAngle
    );

    // More aggressive scale reduction for distant cards
    const scale = isInVisibleArc
      ? Math.max(0.4, 1 - distanceFromCenter / 60)
      : 0;

    // More aggressive opacity reduction for distant cards
    const opacity = isInVisibleArc
      ? Math.max(0.2, 1 - distanceFromCenter / 45)
      : 0;

    // Rotate cards to face outward, with center card straight
    const cardRotation = ((((angle - 90) % 360) + 360) % 360) - 180;

    const style: React.CSSProperties = {
      transform: `translate(${x}px, ${y}px) rotate(${cardRotation}deg) scale(${scale})`,
      opacity,
      pointerEvents: isInVisibleArc ? "auto" : "none",
      zIndex: Math.floor(100 - distanceFromCenter),
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
    const targetRotation = -index * anglePerCard + 180;

    // Normalize rotation to prevent large angle accumulation
    const normalizedRotation = ((targetRotation % 360) + 360) % 360;
    setRotation(normalizedRotation);
    setActiveIndex(index);

    setTimeout(() => setIsAnimating(false), 500);
  };

  // Handle touch start to track the starting Y position
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only register touch start if we're not already in scanning mode
    if (!isScannerOpen) {
      setTouchStartY(e.touches[0].clientY);
      setSwipeDistance(0);
    }
  };

  // Handle touch move to detect swipe down gesture
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null || isScannerOpen) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY;

    // Update the swipe distance for visual feedback
    if (deltaY > 0) {
      setSwipeDistance(Math.min(deltaY, 100)); // Cap at 100px for visual effect
    }

    // If swiped down more than 70px, open the scanner
    if (deltaY > 70 && !isScannerOpen) {
      setIsScannerOpen(true);
      setTouchStartY(null);
      setSwipeDistance(0);
    }
  };

  // Handle touch end to reset starting position
  const handleTouchEnd = () => {
    setTouchStartY(null);
    setSwipeDistance(0); // Reset swipe distance
  };

  // Handle successful QR code scan
  const handleQrCodeScan = async (result: string) => {
    console.log("QR Code scanned:", result);

    try {
      const response = await fetch(
        "https://09aa-144-82-8-189.ngrok-free.app/api/validatetransaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          mode: "cors",
          body: JSON.stringify({
            customer_id: 1,
            code_id: result,
          }),
        }
      );

      // Log the response status and headers for debugging
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        alert("Transaction validated successfully!");
        // Refresh the cards or update points here if needed
      } else {
        alert(
          "Failed to validate transaction: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error validating transaction:", error);

      // More specific error handling
      if (error instanceof TypeError) {
        if (error.message.includes("Failed to fetch")) {
          alert(
            "Network error: Unable to connect to the server. Please check your internet connection."
          );
        } else if (error.message.includes("CORS")) {
          alert(
            "CORS error: Unable to access the server. Please try again later."
          );
        } else {
          alert(
            "Connection error: Please check your internet connection and try again."
          );
        }
      } else {
        alert("Failed to validate transaction. Please try again later.");
      }
    } finally {
      // Always close the scanner after attempting validation
      setIsScannerOpen(false);
    }
  };

  // Only render the full UI on the client side
  if (!isMounted) {
    // Render a simple loading placeholder that matches the server-rendered structure
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[380px] mx-auto h-screen bg-background shadow-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">Your Reward Cards</h2>
            <div className="w-8 h-8" /> {/* Placeholder for button */}
          </div>
          <div className="flex-1 relative overflow-hidden">
            {/* Loading placeholder */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background"
      ref={pageRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isMounted ? `translateY(${swipeDistance * 0.3}px)` : "none", // Only apply transform on client
        transition: touchStartY ? "none" : "transform 0.3s ease-out",
      }}
    >
      <div className="w-full max-w-[380px] mx-auto h-screen bg-background shadow-xl p-4 flex flex-col">
        {!isScannerOpen ? (
          // Normal dashboard view
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold">Your Reward Cards</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
              >
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
                          ...style,
                        }}
                      >
                        <Card
                          className={`${card.color} cursor-pointer p-4 transition-shadow hover:shadow-lg ${isActive ? "ring-2 ring-primary ring-offset-2" : ""}`}
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
                              <Star
                                size={24}
                                className="text-yellow-500 mr-2"
                              />
                              <span className="font-semibold text-xl">
                                {card.points}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-2xl font-semibold mb-2">
                            {card.name}
                          </h3>
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

            <div className="py-2 text-center text-sm text-muted-foreground">
              <p>Swipe down to scan a QR code</p>
              <Button
                variant="ghost"
                size="sm"
                className="mx-auto mt-2 flex items-center gap-2"
                onClick={() => setIsScannerOpen(true)}
              >
                <Camera className="h-4 w-4" />
                <span>Open Scanner</span>
              </Button>
            </div>
          </>
        ) : (
          // QR Scanner view - only render this on client side
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Scan Reward QR Code</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsScannerOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-[300px] aspect-square mb-4">
                <QRCodeScanner onScan={handleQrCodeScan} />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Position the QR code within the frame to scan
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedCard !== null && typeof selectedCard === "number" && (
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
