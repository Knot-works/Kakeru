import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Sparkles,
  Crown,
  ArrowLeft,
  Zap,
  BookOpen,
  BarChart3,
  Infinity,
  X,
} from "lucide-react";

const FREE_FEATURES = [
  { text: "月間10,000トークン", included: true },
  { text: "添削 約3回/月（体験版）", included: true },
  { text: "標準モデルで添削", included: true },
  { text: "学習履歴 7日間", included: true },
  { text: "単語帳 50件まで", included: true },
  { text: "詳細な文法解析", included: false },
  { text: "表現の代替案提示", included: false },
];

const PRO_FEATURES = [
  { icon: Infinity, text: "月間2,000,000トークン", highlight: true },
  { icon: Zap, text: "高精度モデル（GPT-4o）で添削", highlight: true },
  { icon: BookOpen, text: "学習履歴 無制限" },
  { icon: BookOpen, text: "単語帳 無制限" },
  { icon: BarChart3, text: "詳細な文法解析", highlight: true },
  { icon: Sparkles, text: "表現の代替案を提示", highlight: true },
];

export default function PricingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const currentPlan = profile?.plan || "free";
  const isFreePlan = currentPlan === "free";

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const monthlyPrice = 980;
  const yearlyPrice = 9400;
  const yearlyMonthlyEquivalent = Math.floor(yearlyPrice / 12);

  const handleSelectPro = () => {
    // TODO: Implement Stripe checkout
    console.log("Selected Pro plan with billing:", billingCycle);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl">
            シンプルな料金プラン
          </h1>
          <p className="mt-3 text-muted-foreground">
            無料で始めて、必要に応じてアップグレード
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mb-10 flex justify-center gap-2">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            月ごと
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`relative rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              billingCycle === "yearly"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            年ごと
            <span className="absolute -right-2 -top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
              -20%
            </span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Free Plan */}
          <Card className={`relative flex flex-col ${!isFreePlan ? "" : "ring-2 ring-primary/20"}`}>
            <CardContent className="flex flex-1 flex-col p-6">
              <div className="mb-4">
                <h2 className="font-serif text-xl">無料プラン</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  まずは気軽に始めたい方へ
                </p>
              </div>

              <div className="mb-6">
                <span className="font-serif text-4xl font-medium">¥0</span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {FREE_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    {feature.included ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/50">
                        <X className="h-3 w-3" />
                      </div>
                    )}
                    <span className={`text-sm ${!feature.included ? "text-muted-foreground/60" : ""}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                disabled={isFreePlan}
                className="w-full"
              >
                {isFreePlan ? "現在のプラン" : "無料プランに変更"}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`relative flex flex-col border-primary/40 shadow-lg shadow-primary/5 ${currentPlan === "pro" ? "ring-2 ring-primary/20" : ""}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                おすすめ
              </Badge>
            </div>

            <CardContent className="flex flex-1 flex-col p-6 pt-8">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h2 className="font-serif text-xl">Pro</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  本格的に英語力を伸ばしたい方へ
                </p>
              </div>

              <div className="mb-6">
                {billingCycle === "yearly" ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-4xl font-medium">
                        ¥{yearlyMonthlyEquivalent.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/ 月</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ¥{yearlyPrice.toLocaleString()} 年払い
                      <span className="ml-2 text-accent line-through">
                        ¥{(monthlyPrice * 12).toLocaleString()}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-4xl font-medium">
                        ¥{monthlyPrice.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/ 月</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      毎月の請求
                    </p>
                  </>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {PRO_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        feature.highlight
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <feature.icon className="h-3 w-3" />
                    </div>
                    <span className={`text-sm ${feature.highlight ? "font-medium" : ""}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleSelectPro}
                disabled={currentPlan === "pro"}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {currentPlan === "pro" ? (
                  "現在のプラン"
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    Proプランをはじめる
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="mb-8 text-center font-serif text-2xl">
            よくある質問
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h3 className="mb-2 font-medium">いつでも解約できますか？</h3>
              <p className="text-sm text-muted-foreground">
                はい、いつでも解約可能です。解約後も期間終了まではご利用いただけます。
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h3 className="mb-2 font-medium">
                トークンとは何ですか？
              </h3>
              <p className="text-sm text-muted-foreground">
                AIが処理するテキストの単位です。添削1回で約2,500トークン、お題生成で約1,100トークンを消費します。
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h3 className="mb-2 font-medium">
                無料プランでも添削の品質は同じですか？
              </h3>
              <p className="text-sm text-muted-foreground">
                無料プランでは標準モデルを使用しています。Proプランでは最新のGPT-4oモデルによる、より精度の高いフィードバックを受けられます。
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h3 className="mb-2 font-medium">
                支払い方法は？
              </h3>
              <p className="text-sm text-muted-foreground">
                クレジットカード（Visa、Mastercard、American Express、JCB）に対応しています。
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        {!user && (
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 p-8 text-center">
            <h2 className="font-serif text-2xl">
              まずは無料で始めてみませんか？
            </h2>
            <p className="mt-2 text-muted-foreground">
              アカウント登録は30秒で完了します
            </p>
            <Link to="/login">
              <Button size="lg" className="mt-6 gap-2">
                <Sparkles className="h-4 w-4" />
                無料で始める
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
