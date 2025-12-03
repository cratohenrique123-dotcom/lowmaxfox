interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
}

export function ScoreBar({ label, score, maxScore = 100 }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;
  
  const getColor = (score: number) => {
    if (score >= 80) return "from-[hsl(150,100%,40%)] to-[hsl(160,100%,50%)]";
    if (score >= 65) return "from-[hsl(200,100%,50%)] to-[hsl(210,100%,60%)]";
    return "from-[hsl(35,100%,50%)] to-[hsl(45,100%,55%)]";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-lg font-bold text-primary">{score}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor(score)} rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_hsl(200,100%,50%/0.5)]`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
