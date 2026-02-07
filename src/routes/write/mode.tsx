import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useToken } from "@/contexts/token-context";
import { saveWriting } from "@/lib/firestore";
import { callGeneratePrompt, callGradeWriting, isRateLimitError, getRateLimitMessage } from "@/lib/functions";
import { getEstimatedRemaining, formatTokens } from "@/lib/rate-limits";
import { toast } from "sonner";
import { DictionaryPanel } from "@/components/writing/dictionary-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  RefreshCw,
  Lightbulb,
  ArrowLeft,
  Loader2,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { type WritingMode, MODE_LABELS } from "@/types";

export default function WritingPage() {
  const { user, profile } = useAuth();
  const { tokenUsage, refresh: refreshTokenUsage } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode: modeParam } = useParams<{ mode: string }>();
  const mode = modeParam as WritingMode;

  // Accept daily prompt from dashboard navigation state
  const dailyPrompt = (location.state as { dailyPrompt?: { prompt: string; hint: string; recommendedWords: number; exampleJa?: string } })?.dailyPrompt;

  const [prompt, setPrompt] = useState(dailyPrompt?.prompt || "");
  const [hint, setHint] = useState(dailyPrompt?.hint || "");
  const [recommendedWords, setRecommendedWords] = useState(dailyPrompt?.recommendedWords || 80);
  const [exampleJa, setExampleJa] = useState(dailyPrompt?.exampleJa || "");
  const [showExample, setShowExample] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [hobbyTopic, setHobbyTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dictOpen, setDictOpen] = useState(true);

  // Calculate remaining gradings based on token budget
  const tokensRemaining = tokenUsage ? tokenUsage.tokenLimit - tokenUsage.tokensUsed : 0;
  const gradingRemaining = tokenUsage ? getEstimatedRemaining(tokensRemaining, "gradeWriting") : 999;
  const gradingLimitReached = gradingRemaining <= 0;

  const wordCount = userAnswer.trim()
    ? userAnswer.trim().split(/\s+/).length
    : 0;

  const generatePrompt = useCallback(async (topicOverride?: string) => {
    if (!profile) return;
    setGenerating(true);
    setShowExample(false);
    try {
      const result = await callGeneratePrompt(profile, mode, topicOverride);
      setPrompt(result.prompt);
      setHint(result.hint);
      setRecommendedWords(result.recommendedWords);
      setExampleJa(result.exampleJa || "");
    } catch (error) {
      console.error("Failed to generate prompt:", error);
      if (isRateLimitError(error)) {
        toast.error(getRateLimitMessage(error), { duration: 8000 });
      } else {
        toast.error("お題の生成に失敗しました。もう一度お試しください。");
      }
    } finally {
      setGenerating(false);
    }
  }, [profile, mode]);

  useEffect(() => {
    if (profile && mode !== "custom" && mode !== "expression" && !dailyPrompt) {
      generatePrompt();
    }
  }, [profile, mode, generatePrompt, dailyPrompt]);

  const handleCustomSubmit = async () => {
    if (!customInput.trim() || !profile) return;
    setGenerating(true);
    setShowExample(false);
    try {
      const result = await callGeneratePrompt(profile, mode, customInput);
      setPrompt(result.prompt);
      setHint(result.hint);
      setRecommendedWords(result.recommendedWords);
      setExampleJa(result.exampleJa || "");
    } catch (error) {
      console.error("Failed to generate prompt:", error);
      if (mode === "expression") {
        setPrompt(
          `「${customInput}」を使って、自分の経験や考えを英語で書いてください`
        );
        setHint(customInput);
        setRecommendedWords(60);
        setExampleJa("");
      } else {
        setPrompt(customInput);
        setHint("");
        setRecommendedWords(80);
        setExampleJa("");
      }
      toast.error("AI生成に失敗しました。入力したお題をそのまま使用します。");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile || !userAnswer.trim() || !prompt) return;
    setSubmitting(true);

    try {
      const feedback = await callGradeWriting(
        profile,
        prompt,
        userAnswer,
        profile.explanationLang
      );

      const writingId = await saveWriting(user.uid, {
        mode,
        prompt,
        promptHint: hint,
        recommendedWords,
        userAnswer,
        feedback,
        wordCount,
      });

      navigate(`/write/result/${writingId}`);
    } catch (error) {
      console.error("Failed to grade writing:", error);
      if (isRateLimitError(error)) {
        toast.error(getRateLimitMessage(error), { duration: 8000 });
        // Refetch token usage to get updated limits
        refreshTokenUsage();
      } else {
        toast.error("添削に失敗しました。もう一度お試しください。");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Main Writing Area */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            戻る
          </Button>
          <div className="flex-1">
            <h1 className="font-serif text-2xl">{MODE_LABELS[mode]}</h1>
          </div>
          {/* Dictionary toggle (mobile + collapsed) */}
          {!dictOpen && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setDictOpen(true)}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">辞書</span>
            </Button>
          )}
        </div>

        {/* Custom/Expression Input */}
        {(mode === "custom" || mode === "expression") && !prompt && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="font-medium">
                {mode === "expression"
                  ? "練習したい表現を入力してください"
                  : "お題を自由に入力してください"}
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder={
                    mode === "expression"
                      ? '例: "be used to ~ing"'
                      : '例: "来週の出張について上司に報告するメール"'
                  }
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                  maxLength={500}
                />
                <Button
                  onClick={handleCustomSubmit}
                  disabled={!customInput.trim()}
                >
                  決定
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prompt Display */}
        {(prompt || generating) && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    お題
                  </span>
                </div>
                {mode !== "custom" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generatePrompt()}
                    disabled={generating}
                    className="gap-1.5"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`}
                    />
                    別のお題
                  </Button>
                )}
              </div>

              {generating ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  お題を生成中...
                </div>
              ) : (
                <>
                  <p className="font-serif text-xl leading-relaxed">
                    {prompt}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      推奨: {recommendedWords}語
                    </Badge>
                    {hint && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Lightbulb className="h-3.5 w-3.5" />
                        <span className="italic">{hint}</span>
                      </div>
                    )}
                  </div>

                  {/* Japanese Example Toggle */}
                  {exampleJa && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowExample(!showExample)}
                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>例文を{showExample ? "隠す" : "見る"}</span>
                        {showExample ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {showExample && (
                        <div className="mt-2 rounded-lg border border-border/40 bg-muted/30 p-4">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            参考：日本語での例文
                          </p>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                            {exampleJa}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hobby Topic Customization */}
                  {mode === "hobby" && (
                    <div className="mt-4 rounded-lg border border-border/40 bg-muted/30 p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        テーマを指定して再生成（任意）
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder='例: "好きなバンドOasisについて"'
                          value={hobbyTopic}
                          onChange={(e) => setHobbyTopic(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            hobbyTopic.trim() &&
                            generatePrompt(hobbyTopic)
                          }
                          maxLength={500}
                          className="h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0 text-xs"
                          onClick={() => generatePrompt(hobbyTopic)}
                          disabled={generating || !hobbyTopic.trim()}
                        >
                          生成
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Writing Area */}
        {prompt && (
          <div className="space-y-3 relative">
            {/* Grading Overlay */}
            {submitting && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-card/95 backdrop-blur-sm animate-fade-in">
                <div className="flex flex-col items-center gap-4 p-8">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-serif text-lg font-medium grading-pulse">
                      添削中...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      AIがあなたの英文を分析しています
                    </p>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="font-medium">あなたの回答</p>
              <span
                className={`text-sm ${
                  wordCount >= recommendedWords
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {wordCount} / {recommendedWords}語
              </span>
            </div>
            <div className="writing-area rounded-xl">
              <Textarea
                placeholder="英語で回答を入力してください..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={12}
                disabled={submitting}
                maxLength={5000}
                className="min-h-[300px] resize-none border-border/60 bg-card text-base leading-relaxed focus-visible:ring-primary disabled:opacity-50"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              {tokenUsage && (
                <span className="text-xs text-muted-foreground">
                  残り約{gradingRemaining}回（{formatTokens(tokensRemaining)}トークン）
                </span>
              )}
              <Button
                onClick={handleSubmit}
                disabled={submitting || wordCount < 5 || gradingLimitReached}
                className="gap-2 px-8 btn-bounce"
                size="lg"
              >
                {gradingLimitReached ? (
                  <>トークン上限に達しました</>
                ) : submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    添削中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    添削する
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dictionary Side Panel — desktop: sticky side column, mobile: slide-over */}
      {dictOpen && (
        <>
          {/* Mobile overlay backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setDictOpen(false)}
          />

          {/* Panel */}
          <aside
            className={[
              "z-50 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg",
              // Mobile: fixed slide-in from right
              "fixed inset-y-0 right-0 w-[340px] rounded-l-xl rounded-r-none lg:rounded-xl",
              // Desktop: sticky side column
              "lg:relative lg:inset-auto lg:w-[360px] lg:shrink-0 lg:shadow-none",
              "lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)]",
            ].join(" ")}
          >
            <DictionaryPanel onClose={() => setDictOpen(false)} />
          </aside>
        </>
      )}
    </div>
  );
}
