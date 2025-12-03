import { Zap } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse" />
        <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-[0_0_20px_hsl(200,100%,50%/0.5)]">
          <Zap className={`${iconSizes[size]} text-background fill-background`} />
        </div>
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-extrabold tracking-tight`}>
          <span className="text-foreground">Low</span>
          <span className="text-primary">Max</span>
        </span>
      )}
    </div>
  );
}
