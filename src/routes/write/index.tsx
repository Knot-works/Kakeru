import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Heart,
  MessageSquareText,
  PencilRuler,
  Briefcase,
  Coffee,
  Globe,
  Sparkles,
  User,
  BookOpen,
} from "lucide-react";
import { type WritingMode, MODE_LABELS } from "@/types";

interface ModeOption {
  mode: WritingMode;
  icon: React.ReactNode;
  description: string;
  wordRange: string;
  color: string;
}

interface ModeCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  modes: ModeOption[];
}

const categories: ModeCategory[] = [
  {
    title: "パーソナライズ",
    description: "あなたに合わせたお題",
    icon: <User className="h-4 w-4" />,
    modes: [
      {
        mode: "goal",
        icon: <Target className="h-6 w-6" />,
        description: "あなたの目標に合わせたお題をAIが出題",
        wordRange: "80〜120語",
        color: "from-blue-500 to-cyan-500",
      },
      {
        mode: "hobby",
        icon: <Heart className="h-6 w-6" />,
        description: "趣味・興味に基づいたお題で楽しく練習",
        wordRange: "60〜100語",
        color: "from-pink-500 to-rose-500",
      },
    ],
  },
  {
    title: "トピック別",
    description: "シーン・場面で選ぶ",
    icon: <BookOpen className="h-4 w-4" />,
    modes: [
      {
        mode: "business",
        icon: <Briefcase className="h-6 w-6" />,
        description: "会議、報告、提案などビジネスシーンの実践練習",
        wordRange: "150〜250語",
        color: "from-slate-600 to-slate-800",
      },
      {
        mode: "daily",
        icon: <Coffee className="h-6 w-6" />,
        description: "日常会話、旅行、買い物など身近なトピック",
        wordRange: "80〜120語",
        color: "from-amber-500 to-orange-500",
      },
      {
        mode: "social",
        icon: <Globe className="h-6 w-6" />,
        description: "環境、教育、テクノロジーなど社会的なテーマ",
        wordRange: "200〜300語",
        color: "from-emerald-500 to-teal-500",
      },
    ],
  },
  {
    title: "カスタム",
    description: "自分で決める",
    icon: <Sparkles className="h-4 w-4" />,
    modes: [
      {
        mode: "expression",
        icon: <MessageSquareText className="h-6 w-6" />,
        description: "学びたい表現を指定してピンポイント練習",
        wordRange: "60〜80語",
        color: "from-violet-500 to-purple-500",
      },
      {
        mode: "custom",
        icon: <PencilRuler className="h-6 w-6" />,
        description: "キーワードを入力するとAIがお題を作成",
        wordRange: "自由",
        color: "from-gray-500 to-gray-700",
      },
    ],
  },
];

function ModeCard({ mode, icon, description, wordRange, color }: ModeOption) {
  return (
    <Link to={`/write/${mode}`}>
      <Card className="group relative h-full overflow-hidden cursor-pointer border-border/50 hover:border-primary/30 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="relative p-5 space-y-3">
          {/* Icon */}
          <div
            className={`
              flex h-12 w-12 items-center justify-center rounded-xl
              bg-gradient-to-br ${color} text-white
              transition-transform duration-300 ease-out
              group-hover:scale-105
            `}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium">
                {MODE_LABELS[mode]}
              </h3>
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full">
                {wordRange}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function WriteModePage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-medium">ライティングモード</h1>
        <p className="text-muted-foreground">
          練習スタイルを選んで英作文を始めましょう
        </p>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <section key={category.title} className="space-y-4">
          {/* Category Header */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {category.icon}
            </div>
            <div>
              <h2 className="font-medium text-base">{category.title}</h2>
              <p className="text-xs text-muted-foreground">
                {category.description}
              </p>
            </div>
          </div>

          {/* Mode Cards */}
          <div className={`grid gap-4 ${
            category.modes.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}>
            {category.modes.map((m) => (
              <ModeCard key={m.mode} {...m} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
