import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useGetDashboardStats, useListSkillPosts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, TrendingUp, Send, Inbox, Clock, CheckCircle, Plus } from "lucide-react";

function StatCard({ title, value, icon, color }: { title: string; value: number | undefined; icon: React.ReactNode; color: string }) {
  return (
    <Card className="border-card-border">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {value === undefined ? (
              <Skeleton className="h-8 w-12 mt-1" />
            ) : (
              <p className={`text-3xl font-display font-bold mt-1 ${color}`}>{value}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-xl ${color.replace("text-", "bg-").replace("primary", "primary/10").replace("secondary", "secondary/10").replace("yellow", "yellow/10").replace("green", "green/10")} flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { enabled: !!user },
  });

  const { data: myPosts, isLoading: postsLoading } = useListSkillPosts(
    { userId: user?.id },
    { query: { enabled: !!user?.id } }
  );

  if (authLoading || !user) return null;

  const recentPosts = myPosts?.slice(0, 3) ?? [];

  return (
    <div className="container mx-auto px-4 md:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Good day, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">{user.college} · {user.department}</p>
        </div>
        <Button asChild className="rounded-full font-semibold hidden md:flex">
          <Link href="/create-post"><Plus className="mr-2 h-4 w-4" /> Post a Skill</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="My Posts" value={stats?.totalPosts} icon={<BookOpen className="h-5 w-5" />} color="text-primary" />
        <StatCard title="Skills Offered" value={stats?.offeredSkills} icon={<TrendingUp className="h-5 w-5" />} color="text-primary" />
        <StatCard title="Requests Sent" value={stats?.sentRequests} icon={<Send className="h-5 w-5" />} color="text-secondary" />
        <StatCard title="Requests Received" value={stats?.receivedRequests} icon={<Inbox className="h-5 w-5" />} color="text-secondary" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard title="Pending" value={stats?.pendingRequests} icon={<Clock className="h-5 w-5" />} color="text-yellow-600 dark:text-yellow-400" />
        <StatCard title="Accepted" value={stats?.acceptedRequests} icon={<CheckCircle className="h-5 w-5" />} color="text-green-600 dark:text-green-400" />
        <StatCard title="Skills Wanted" value={stats?.requestedSkills} icon={<BookOpen className="h-5 w-5" />} color="text-primary" />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <Link href="/browse">
          <Card className="border-card-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="font-semibold">Browse Skills</div>
              <p className="text-sm text-muted-foreground mt-1">Find skills to learn</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/requests">
          <Card className="border-card-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all">
                <Inbox className="h-6 w-6" />
              </div>
              <div className="font-semibold">My Requests</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.pendingRequests ? `${stats.pendingRequests} pending` : "Manage swap requests"}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/create-post">
          <Card className="border-card-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-all">
                <Plus className="h-6 w-6" />
              </div>
              <div className="font-semibold">Post a Skill</div>
              <p className="text-sm text-muted-foreground mt-1">Share your expertise</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-semibold">My Recent Posts</h2>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href="/profile">View all</Link>
          </Button>
        </div>

        {postsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : recentPosts.length === 0 ? (
          <Card className="border-card-border border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground font-medium">No posts yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Start sharing your skills with the campus community</p>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/create-post">Create your first post</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Card key={post.id} className="border-card-border hover:border-primary/30 transition-all">
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{post.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{post.description}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={post.type === "offer" ? "default" : "secondary"} className="capitalize text-xs">
                      {post.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">{post.skillLevel}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
