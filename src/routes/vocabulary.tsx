import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getVocabulary, deleteVocab, saveVocab } from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  MessageSquareText,
  Search,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { VocabEntry, VocabType } from "@/types";

export default function VocabularyPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "word" | "expression">(
    "all"
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vocabType, setVocabType] = useState<VocabType>("word");
  const [vocabTerm, setVocabTerm] = useState("");
  const [vocabMeaning, setVocabMeaning] = useState("");
  const [vocabExample, setVocabExample] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const data = await getVocabulary(user.uid);
        setEntries(data);
      } catch {
        const stored = localStorage.getItem("kakeru-vocab");
        if (stored) {
          const parsed = JSON.parse(stored);
          setEntries(
            parsed.map((e: Record<string, unknown>) => ({
              ...e,
              createdAt: new Date(e.createdAt as string),
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    try {
      await deleteVocab(user.uid, entryId);
    } catch {
      // Fallback: remove from localStorage
      const stored = JSON.parse(
        localStorage.getItem("kakeru-vocab") || "[]"
      );
      const filtered = stored.filter(
        (e: { id: string }) => e.id !== entryId
      );
      localStorage.setItem("kakeru-vocab", JSON.stringify(filtered));
    }
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  const handleAdd = async () => {
    if (!user || !vocabTerm.trim()) return;
    setSaving(true);
    try {
      const id = await saveVocab(user.uid, {
        type: vocabType,
        term: vocabTerm,
        meaning: vocabMeaning,
        example: vocabExample,
        tags: [],
      });
      setEntries((prev) => [
        {
          id,
          userId: user.uid,
          type: vocabType,
          term: vocabTerm,
          meaning: vocabMeaning,
          example: vocabExample,
          tags: [],
          reviewCount: 0,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    } catch {
      // Fallback to localStorage
      const newEntry = {
        id: `local-${Date.now()}`,
        userId: user.uid,
        type: vocabType,
        term: vocabTerm,
        meaning: vocabMeaning,
        example: vocabExample,
        tags: [],
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
      const stored = JSON.parse(
        localStorage.getItem("kakeru-vocab") || "[]"
      );
      stored.unshift(newEntry);
      localStorage.setItem("kakeru-vocab", JSON.stringify(stored));
      setEntries((prev) => [
        { ...newEntry, createdAt: new Date() } as VocabEntry,
        ...prev,
      ]);
    } finally {
      setSaving(false);
      setDialogOpen(false);
      setVocabTerm("");
      setVocabMeaning("");
      setVocabExample("");
    }
  };

  const filtered = entries.filter((e) => {
    const matchesTab =
      activeTab === "all" || e.type === activeTab;
    const matchesSearch =
      !searchQuery ||
      e.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const wordCount = entries.filter((e) => e.type === "word").length;
  const expressionCount = entries.filter((e) => e.type === "expression").length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl">単語帳</h1>
          <p className="text-muted-foreground">
            学習した単語や表現をまとめて管理
          </p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          追加
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">単語</p>
              <p className="font-serif text-xl font-bold">{wordCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <MessageSquareText className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">表現</p>
              <p className="font-serif text-xl font-bold">{expressionCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">合計</p>
              <p className="font-serif text-xl font-bold">{entries.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Tabs */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="単語や表現を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "all" | "word" | "expression")
          }
        >
          <TabsList>
            <TabsTrigger value="all">すべて ({entries.length})</TabsTrigger>
            <TabsTrigger value="word">単語 ({wordCount})</TabsTrigger>
            <TabsTrigger value="expression">
              表現 ({expressionCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium">
                {searchQuery
                  ? "該当する単語・表現が見つかりません"
                  : "まだ単語・表現が登録されていません"}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "検索条件を変更してください"
                  : "添削結果から単語を登録したり、自分で追加できます"}
              </p>
            </div>
            {!searchQuery && (
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                最初の単語を追加
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <Card
              key={entry.id}
              className="group transition-shadow hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          entry.type === "word"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-accent/10 text-accent border-accent/20"
                        }
                      >
                        {entry.type === "word" ? "単語" : "表現"}
                      </Badge>
                      <span className="font-medium font-mono">
                        {entry.term}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.meaning}
                    </p>
                    {entry.example && (
                      <p className="text-sm italic text-muted-foreground/70">
                        {entry.example}
                      </p>
                    )}
                    {entry.source && (
                      <p className="text-xs text-muted-foreground/50">
                        出典: {entry.source}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">単語・表現を追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={vocabType === "word" ? "default" : "outline"}
                size="sm"
                onClick={() => setVocabType("word")}
              >
                単語
              </Button>
              <Button
                variant={vocabType === "expression" ? "default" : "outline"}
                size="sm"
                onClick={() => setVocabType("expression")}
              >
                表現
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {vocabType === "word" ? "単語" : "表現"}
              </label>
              <Input
                value={vocabTerm}
                onChange={(e) => setVocabTerm(e.target.value)}
                placeholder={
                  vocabType === "word"
                    ? "e.g., information"
                    : "e.g., In my opinion..."
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">意味・解説</label>
              <Input
                value={vocabMeaning}
                onChange={(e) => setVocabMeaning(e.target.value)}
                placeholder="日本語で意味や使い方を記入"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">例文（任意）</label>
              <Textarea
                value={vocabExample}
                onChange={(e) => setVocabExample(e.target.value)}
                placeholder="例文を入力"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                キャンセル
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!vocabTerm.trim() || saving}
              >
                {saving ? "保存中..." : "登録する"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
