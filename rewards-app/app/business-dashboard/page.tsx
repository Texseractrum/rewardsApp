"use client";

import { Coffee, Share, Plus, LogOut } from "lucide-react";
import { Card } from "@/components/ui/button-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQRCode } from "next-qrcode";

export default function BusinessDashboard() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [points, setPoints] = useState(0);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const { Canvas } = useQRCode();

  const handleLogout = () => {
    router.push("/");
  };

  const handleGivePoints = () => {
    setShowPopup(true);
  };

  const handleConfirmPoints = async () => {
    // Use fixed shop_id and customer_id as requested
    const shop_id = 2;
    const pointsToAward = points;
    const code_id = Math.random().toString(36).substring(2, 15);

    const currenturl = new URL("https://09aa-144-82-8-189.ngrok-free.app");
    currenturl.pathname += "/api/newtransaction";

    try {
      // Send POST request to backend
      const response = await fetch(currenturl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shop_id,
          points: pointsToAward,
          code_id, // Use the generated code_id for the transaction
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Transaction recorded successfully:", data);

        // Use the same code_id for the QR code that was sent to the backend
        setQrCode(code_id);
        setExpiryTime(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes from now
      } else {
        console.error("Error recording transaction:", data.error);
        alert("Failed to record transaction. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Failed to connect to the backend. Please try again.");
    }

    setShowPopup(false);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Check for QR code expiry
  useEffect(() => {
    if (expiryTime) {
      const timer = setTimeout(() => {
        setQrCode(null);
        setExpiryTime(null);
      }, expiryTime.getTime() - Date.now());

      return () => clearTimeout(timer);
    }
  }, [expiryTime]);

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
          {qrCode && (
            <div className="mt-4">
              <Canvas
                text={qrCode}
                options={{
                  margin: 3,
                  scale: 4,
                  width: 128,
                  color: {
                    dark: "#000000",
                    light: "#FFFFFF",
                  },
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Expires in 5 minutes
              </p>
            </div>
          )}
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
          <Button className="h-14 space-x-2" onClick={handleGivePoints}>
            <Plus size={20} />
            <span>Give Points</span>
          </Button>
        </div>

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Enter Points</h3>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="mb-4"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClosePopup}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmPoints}>Confirm</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
