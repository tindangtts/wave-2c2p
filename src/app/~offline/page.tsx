import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center bg-background">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <WifiOff className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold text-foreground mb-2">
        You are offline
      </h1>
      <p className="text-sm text-muted-foreground max-w-[280px]">
        Please check your internet connection and try again. Some features
        may be unavailable while offline.
      </p>
    </div>
  );
}
