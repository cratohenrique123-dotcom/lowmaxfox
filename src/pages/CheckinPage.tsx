import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { Check, Droplets, Smile, Activity, Moon, Dumbbell, Sparkles, Calendar } from "lucide-react";
import { toast } from "sonner";

const habits = [
  { id: "mewing", label: "Mewing", icon: Smile, color: "text-purple-400", bgColor: "bg-purple-500/20" },
  { id: "skincare", label: "Skincare", icon: Sparkles, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  { id: "posture", label: "Postura", icon: Activity, color: "text-green-400", bgColor: "bg-green-500/20" },
  { id: "water", label: "Água (2L+)", icon: Droplets, color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
  { id: "sleep", label: "Sono (7h+)", icon: Moon, color: "text-indigo-400", bgColor: "bg-indigo-500/20" },
  { id: "exercise", label: "Exercício Facial", icon: Dumbbell, color: "text-orange-400", bgColor: "bg-orange-500/20" },
];

export default function CheckinPage() {
  const { userData, addCheckin } = useApp();
  const today = new Date().toISOString().split("T")[0];
  const [selectedHabits, setSelectedHabits] = useState<string[]>(
    userData.checkins[today] || []
  );
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Calculate streak
    let currentStreak = 0;
    const dates = Object.keys(userData.checkins).sort().reverse();
    for (const date of dates) {
      if (userData.checkins[date].length > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [userData.checkins]);

  const toggleHabit = (habitId: string) => {
    setSelectedHabits((prev) =>
      prev.includes(habitId)
        ? prev.filter((h) => h !== habitId)
        : [...prev, habitId]
    );
  };

  const handleSave = () => {
    addCheckin(today, selectedHabits);
    toast.success("Check-in salvo!");
  };

  const completionPercentage = Math.round((selectedHabits.length / habits.length) * 100);

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  }).reverse();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-40 px-6 py-4">
        <h1 className="font-bold text-lg text-center">Check-in Diário</h1>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card variant="neon" className="p-4 text-center">
            <p className="text-3xl font-extrabold text-primary">{streak}</p>
            <p className="text-xs text-muted-foreground">Dias seguidos</p>
          </Card>
          <Card variant="glass" className="p-4 text-center">
            <p className="text-3xl font-extrabold">{completionPercentage}%</p>
            <p className="text-xs text-muted-foreground">Completo hoje</p>
          </Card>
        </div>

        {/* Week View */}
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Últimos 7 dias</span>
          </div>
          <div className="flex justify-between">
            {last7Days.map((date) => {
              const hasCheckin = userData.checkins[date]?.length > 0;
              const isToday = date === today;
              const dayName = new Date(date).toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
              return (
                <div key={date} className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">{dayName}</p>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      hasCheckin
                        ? "bg-primary text-primary-foreground"
                        : isToday
                        ? "border-2 border-primary"
                        : "bg-secondary"
                    }`}
                  >
                    {hasCheckin && <Check className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Habits */}
        <div className="space-y-3">
          <h3 className="font-semibold">Hábitos de Hoje</h3>
          {habits.map((habit) => {
            const isSelected = selectedHabits.includes(habit.id);
            return (
              <Card
                key={habit.id}
                variant={isSelected ? "neon" : "default"}
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  isSelected ? "scale-[1.02]" : ""
                }`}
                onClick={() => toggleHabit(habit.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${habit.bgColor} rounded-xl flex items-center justify-center`}>
                    <habit.icon className={`w-6 h-6 ${habit.color}`} />
                  </div>
                  <span className="flex-1 font-medium">{habit.label}</span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Save Button */}
        <Button variant="neon" size="lg" className="w-full" onClick={handleSave}>
          Salvar Check-in
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
