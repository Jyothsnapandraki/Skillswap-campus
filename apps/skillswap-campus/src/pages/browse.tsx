import { useState } from "react";
import { useSearch } from "wouter";
import { useListSkillPosts, useCreateSwapRequest } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, ArrowUpDown, Loader2, Send } from "lucide-react";
import { Link, useLocation } from "wouter";

const CATEGORIES = ["Programming", "Design", "Mathematics", "Science", "Languages", "Music", "Writing", "Business", "Engineering", "Other"];

export default function Browse() {
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [type, setType] = useState("all");
  const [selectedPost, setSelectedPost] = useState<{ id: number; receiverId: number; title: string } | null>(null);
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const swapMutation = useCreateSwapRequest();

  const { data: posts, isLoading } = useListSkillPosts({
    search: search || undefined,
    category: category === "all" ? undefined : category,
    type: type === "all" ? undefined : (type as "offer" | "request"),
  });

  const handleSwapRequest = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    if (!selectedPost) return;

    try {
      await swapMutation.mutateAsync({
        data: {
          receiverId: selectedPost.receiverId,
          skillPostId: selectedPost.id,
          message: message || undefined,
        },
      });
      toast.success("Swap request sent successfully!");
      setSelectedPost(null);
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send request");
    }
  };

  const filteredPosts = posts ?? [];

  return (
    <div className="container mx-auto px-4 md:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold mb-2">Browse Skills</h1>
        <p className="text-muted-foreground">Discover what your campus community can teach you</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="offer">Offering</SelectItem>
            <SelectItem value="request">Requesting</SelectItem>
          </SelectContent>
        </Select>
        {(search || category !== "all" || type !== "all") && (
          <Button variant="ghost" onClick={() => { setSearch(""); setCategory("all"); setType("all"); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="border-card-border">
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-24">
          <ArrowUpDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2">No skills found</h3>
          <p className="text-muted-foreground text-sm">Try different search terms or filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{filteredPosts.length} skill{filteredPosts.length !== 1 ? "s" : ""} found</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="border-card-border hover:border-primary/40 hover:shadow-lg transition-all flex flex-col group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display font-semibold text-base leading-snug group-hover:text-primary transition-colors">{post.title}</div>
                    <Badge
                      variant={post.type === "offer" ? "default" : "secondary"}
                      className="shrink-0 text-xs capitalize"
                    >
                      {post.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {post.user.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium truncate">{post.user.name}</span>
                      <span className="text-xs text-muted-foreground block truncate">{post.user.college}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <p className="text-muted-foreground text-sm line-clamp-3 flex-1 mb-4">{post.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{post.skillLevel}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{post.availability}</span>
                  </div>
                  {user?.id !== post.userId && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (!user) { setLocation("/login"); return; }
                        setSelectedPost({ id: post.id, receiverId: post.userId, title: post.title });
                      }}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      Request Swap
                    </Button>
                  )}
                  {!user && (
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <Link href="/login">Sign in to request</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Swap Request Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Send Swap Request</DialogTitle>
            <DialogDescription>
              You're requesting to swap skills for: <strong>{selectedPost?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Introduce yourself and describe what you can offer in return..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPost(null)}>Cancel</Button>
            <Button onClick={handleSwapRequest} disabled={swapMutation.isPending}>
              {swapMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
