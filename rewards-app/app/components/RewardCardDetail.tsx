import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface RewardCardDetailProps {
  name: string;
  points: number;
  color: string;
  icon: LucideIcon;
  onClose: () => void;
}

export function RewardCardDetail({ name, points, color, icon: Icon, onClose }: RewardCardDetailProps) {
  return (
    <div 
      className="absolute inset-0 bg-background z-50 flex items-center justify-center overflow-y-auto"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      <div className={`w-full max-w-sm ${color} rounded-lg shadow-lg p-6`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{name}</h2>
            <div className="flex items-center text-lg text-yellow-500">
              <Star className="mr-1" />
              <span>{points} points</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <Icon size={48} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-4 text-center">Rewards Details</h3>
        <ul className="space-y-2 text-center">
          <li>Earn 1 point for every $1 spent</li>
          <li>Double points on weekends</li>
          <li>Special birthday rewards</li>
          <li>Member-exclusive promotions</li>
        </ul>
        
        <div className="mt-6">
          <Button className="w-full" size="lg">
            Claim Points
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
} 