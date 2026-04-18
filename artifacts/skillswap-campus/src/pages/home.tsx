import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useListSkillPosts, useGetCategoryStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen, Users, Zap, Star } from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  Programming: "💻",
  Design: "🎨",
  Mathematics: "📐",
  Science: "🔬",
  Languages: "🌍",
  Music: "🎵",
  Writing: "✍️",
  Business: "💼",
  Engineering: "⚙️",
  Other: "✨",
};

export default function Home() {
  const { user } = useAuth();
  const { data: posts, isLoading: postsLoading } = useListSkillPosts({ type: "offer" });
  const { data: categoryStats } = useGetCategoryStats();

  const featuredPosts = posts?.slice(0, 6) ?? [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[hsl(280,80%,55%)] to-secondary py-24 md:py-36">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/25 text-sm px-4 py-1.5 font-medium">
              The Campus Skill Exchange
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight tracking-tight">
              Learn More.{" "}
              <span className="text-secondary dark:text-yellow-300">Teach More.</span>
              <br />
              Swap Skills.
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with fellow students to exchange knowledge. Teach what you know, learn what you need — no money, just mutual growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 rounded-full shadow-xl">
                    <Link href="/browse">Browse Skills <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 px-8 rounded-full">
                    <Link href="/create-post">Share a Skill</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-8 rounded-full shadow-xl">
                    <Link href="/signup">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 px-8 rounded-full">
                    <Link href="/browse">Browse Skills</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-card">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-3 gap-6 text-center max-w-2xl mx-auto">
            <div>
              <div className="text-2xl font-display font-bold text-primary">{posts?.length || 0}+</div>
              <div className="text-sm text-muted-foreground">Skill Posts</div>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-primary">{categoryStats?.length || 0}+</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-primary">Free</div>
              <div className="text-sm text-muted-foreground">Always</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How SkillSwap Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Three simple steps to start exchanging knowledge with your campus community.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: <BookOpen className="h-8 w-8" />, step: "01", title: "Post Your Skills", desc: "Share what you can teach — from React to guitar, statistics to Spanish." },
              { icon: <Users className="h-8 w-8" />, step: "02", title: "Find a Match", desc: "Browse posts from other students and find someone whose skills complement yours." },
              { icon: <Zap className="h-8 w-8" />, step: "03", title: "Swap & Learn", desc: "Send a swap request, agree on a schedule, and start learning from each other." },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="inline-flex h-16 w-16 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-primary/50 mb-2 tracking-widest">STEP {item.step}</div>
                <h3 className="text-xl font-display font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categoryStats && categoryStats.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-display font-bold mb-8 text-center">Browse by Category</h2>
            <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
              {categoryStats.map((stat) => (
                <Link key={stat.category} href={`/browse?category=${encodeURIComponent(stat.category)}`}>
                  <Badge variant="secondary" className="text-base px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {CATEGORY_ICONS[stat.category] || "✨"} {stat.category}
                    <span className="ml-2 text-xs opacity-70">{stat.count}</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Skill Offers */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold mb-2">Featured Skills</h2>
              <p className="text-muted-foreground">See what students are offering right now</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex rounded-full">
              <Link href="/browse">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          {postsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-card-border">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredPosts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No skills posted yet</p>
              <p className="text-sm mt-1">Be the first to share your expertise!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="border-card-border hover:border-primary/40 transition-all hover:shadow-lg group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-display font-semibold text-lg group-hover:text-primary transition-colors leading-snug">{post.title}</div>
                      <Badge variant="outline" className="shrink-0 text-xs capitalize border-primary/30 text-primary">{post.skillLevel}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {post.user.avatarInitials}
                      </div>
                      <span className="text-sm text-muted-foreground">{post.user.name} · {post.user.college}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{post.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.availability}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/browse">View all skills</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to start swapping?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">Join hundreds of students already exchanging skills on campus.</p>
          {!user && (
            <Button asChild size="lg" className="rounded-full font-bold px-10">
              <Link href="/signup">Create your account</Link>
            </Button>
          )}
          {user && (
            <Button asChild size="lg" className="rounded-full font-bold px-10">
              <Link href="/create-post">Post a skill</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
