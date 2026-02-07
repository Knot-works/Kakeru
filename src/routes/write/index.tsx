import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Heart,
  MessageSquareText,
  PencilRuler,
} from "lucide-react";
import { type WritingMode, MODE_LABELS } from "@/types";

interface ModeOption {
  mode: WritingMode;
  icon: React.ReactNode;
  description: string;
}

const modes: ModeOption[] = [
  {
    mode: "goal",
    icon: <Target className="h-7 w-7" />,
    description: "あなたの目標に合わせたお題をAIが出題します",
  },
  {
    mode: "hobby",
    icon: <Heart className="h-7 w-7" />,
    description: "趣味・興味に基づいたお題で楽しく練習",
  },
  {
    mode: "expression",
    icon: <MessageSquareText className="h-7 w-7" />,
    description: "学びたい表現を指定してピンポイント練習",
  },
  {
    mode: "custom",
    icon: <PencilRuler className="h-7 w-7" />,
    description: "自分でお題を自由に入力して練習",
  },
];

export default function WriteModePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl">ライティングモード</h1>
        <p className="text-muted-foreground">
          練習スタイルを選んで英作文を始めましょう
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modes.map((m) => (
          <Link key={m.mode} to={`/write/${m.mode}`}>
            <Card className="group relative overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:border-primary/30">
              <CardContent className="p-6 space-y-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition-colors bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  {m.icon}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium">
                    {MODE_LABELS[m.mode]}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
