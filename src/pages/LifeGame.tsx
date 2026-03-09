import { useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Gamepad2, Plus, Trash2, CheckCircle2, RotateCcw, Trophy, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LifeGamePage() {
  const { lifeXp, lifeTasks, addLifeTask, removeLifeTask, completeLifeTask, resetWeeklyTasks } = useFinanceStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskXp, setNewTaskXp] = useState("");

  const level = Math.floor(lifeXp / 100);
  const currentLevel = Math.min(level, 100);
  const progressToNext = lifeXp % 100;
  const isMaxLevel = currentLevel >= 100;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskXp) return;
    addLifeTask(newTaskTitle, parseInt(newTaskXp));
    setNewTaskTitle("");
    setNewTaskXp("");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Gamepad2 className="w-8 h-8 text-primary" />
              LifeGame
            </h1>
            <p className="text-muted-foreground mt-1">Gamifique sua rotina e evolua de nível ganhando experiência.</p>
          </div>
          <Button onClick={resetWeeklyTasks} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Resetar Tarefas
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level Card */}
          <Card className="md:col-span-1 border-primary/20 bg-primary/5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Gamepad2 className="w-32 h-32 text-primary" />
            </div>
            <CardHeader className="text-center pb-2 relative z-10">
              <CardTitle className="flex justify-center mb-2">
                {currentLevel < 30 ? (
                  <Star className="w-16 h-16 text-primary drop-shadow-md" />
                ) : currentLevel < 70 ? (
                  <Medal className="w-16 h-16 text-primary drop-shadow-md" />
                ) : (
                  <Trophy className="w-16 h-16 text-primary drop-shadow-md" />
                )}
              </CardTitle>
              <CardDescription className="text-lg font-medium">Nível Atual</CardDescription>
              <div className="text-6xl font-black text-primary drop-shadow-sm">
                {currentLevel}
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Progresso do Nível</span>
                  <span className="font-bold text-primary">{isMaxLevel ? "MÁXIMO" : `${progressToNext} / 100 XP`}</span>
                </div>
                <Progress value={isMaxLevel ? 100 : progressToNext} className="h-3 shadow-inner" />
                <div className="text-center mt-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">XP TOTAL: {lifeXp}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Card */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Missões Semanais</CardTitle>
              <CardDescription>Cumpra suas missões para ganhar experiência e subir de nível.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAddTask} className="flex gap-2 items-end bg-secondary/30 p-4 rounded-lg border border-border/50">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nova Missão</label>
                  <Input 
                    placeholder="Ex: Ler 20 páginas, Treinar 4x na semana..." 
                    value={newTaskTitle} 
                    onChange={(e) => setNewTaskTitle(e.target.value)} 
                    className="bg-background"
                  />
                </div>
                <div className="w-24 space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">XP</label>
                  <Input 
                    type="number" 
                    placeholder="50" 
                    value={newTaskXp} 
                    onChange={(e) => setNewTaskXp(e.target.value)} 
                    min="1"
                    className="bg-background"
                  />
                </div>
                <Button type="submit" size="icon" className="shadow-sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </form>

              <div className="space-y-3">
                {lifeTasks.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">Nenhuma missão cadastrada.</p>
                    <p className="text-sm">Adicione missões acima para começar a ganhar XP!</p>
                  </div>
                ) : (
                  lifeTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                        task.completedThisWeek 
                          ? "bg-primary/5 border-primary/20" 
                          : "bg-card hover:border-primary/30 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <Button
                          variant={task.completedThisWeek ? "default" : "outline"}
                          size="icon"
                          className={cn(
                            "h-10 w-10 rounded-full transition-all duration-300", 
                            task.completedThisWeek 
                              ? "pointer-events-none scale-110 shadow-md bg-primary text-primary-foreground" 
                              : "hover:border-primary hover:text-primary"
                          )}
                          onClick={() => !task.completedThisWeek && completeLifeTask(task.id)}
                        >
                          <CheckCircle2 className={cn("w-6 h-6", task.completedThisWeek ? "opacity-100" : "opacity-50")} />
                        </Button>
                        <div>
                          <p className={cn(
                            "font-semibold text-base transition-all", 
                            task.completedThisWeek && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </p>
                          <p className={cn(
                            "text-sm font-bold flex items-center gap-1",
                            task.completedThisWeek ? "text-muted-foreground" : "text-primary"
                          )}>
                            +{task.xpReward} XP
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeLifeTask(task.id)} 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}