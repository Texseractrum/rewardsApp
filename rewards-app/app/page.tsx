"use client";

import { Building2, User } from "lucide-react";
import { Card } from "@/components/ui/button-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
      <div className="w-full max-w-[380px] min-h-screen bg-background shadow-xl flex flex-col items-center justify-center space-y-4 p-4">
        <Card className="group hover:shadow-lg transition-all duration-300 w-full">
          <Button
            variant="ghost"
            className="w-full h-40 flex flex-col items-center justify-center space-y-4"
            onClick={() => router.push("/customer-login")}
          >
            <User
              size={48}
              className="text-primary group-hover:scale-110 transition-transform duration-300"
            />
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Personal Account</h2>
              <p className="text-sm text-muted-foreground">
                Sign in to your personal account
              </p>
            </div>
          </Button>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 w-full">
          <Button
            variant="ghost"
            className="w-full h-40 flex flex-col items-center justify-center space-y-4"
            onClick={() => router.push("/business-login")}
          >
            <Building2
              size={48}
              className="text-primary group-hover:scale-110 transition-transform duration-300"
            />
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Business Account</h2>
              <p className="text-sm text-muted-foreground">
                Sign in to your business account
              </p>
            </div>
          </Button>
        </Card>
      </div>
    </div>
  );
}
