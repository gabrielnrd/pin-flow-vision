import { HabitsWheel } from "@/components/HabitsWheel";
import { Brain } from "lucide-react";

export default function HabitosPage() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/15 text-primary">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hábitos</h1>
            <p className="text-sm text-muted-foreground">
              Gire a roda, complete hábitos diários e fortaleça sua reconstrução.
            </p>
          </div>
        </div>

        <HabitsWheel />
      </main>
    </div>
  );
}
