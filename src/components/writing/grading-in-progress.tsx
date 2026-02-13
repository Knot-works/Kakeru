import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Sparkles, BookOpen, PenLine, Lightbulb } from "lucide-react";

// Progress stages with icons and labels
const STAGES = [
  { id: "grammar", label: "文法をチェック", icon: PenLine },
  { id: "vocabulary", label: "語彙を分析", icon: BookOpen },
  { id: "structure", label: "構成を評価", icon: Sparkles },
  { id: "feedback", label: "フィードバックを作成", icon: Lightbulb },
] as const;

export function GradingInProgress() {
  const [currentStage, setCurrentStage] = useState(0);

  // Progress through stages
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev; // Stay on last stage
      });
    }, 2200);

    return () => clearInterval(stageInterval);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
      {/* Progress Stages - Centered */}
      <div className="w-full max-w-sm">
        <Card className="w-full border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent animate-scale-in">
          <CardContent className="p-8">
            <div className="space-y-6">
              {STAGES.map((stage, index) => {
                const Icon = stage.icon;
                const isComplete = index < currentStage;
                const isCurrent = index === currentStage;

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-4 transition-opacity duration-300 ${
                      index > currentStage ? "opacity-30" : ""
                    }`}
                  >
                    {/* Icon container */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${
                        isComplete
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                          ? "bg-primary/15 text-primary stage-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <Check className="h-5 w-5 animate-scale-in" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isCurrent ? "animate-pulse" : ""}`} />
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1">
                      <span
                        className={`text-base font-medium transition-colors duration-300 ${
                          isComplete
                            ? "text-primary"
                            : isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {stage.label}
                      </span>
                      {isCurrent && (
                        <span className="ml-2 inline-flex gap-0.5 align-middle">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
