import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { useUpdateUser, useListSkillPosts, useDeleteSkillPost } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey, getListSkillPostsQueryKey } from "@workspace/api-client-react";
import { Pencil, Loader2, Trash2, BookOpen, GraduationCap } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  college: z.string().min(2, "College name is required"),
  department: z.string().min(2, "Department is required"),
  bio: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [editing, setEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const updateUser = useUpdateUser();
  const deletePost = useDeleteSkillPost();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: myPosts, isLoading: postsLoading } = useListSkillPosts(
    { userId: user?.id },
    { query: { enabled: !!user?.id } }
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      college: user?.college || "",
      department: user?.department || "",
      bio: user?.bio || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        college: user.college,
        department: user.department,
        bio: user.bio ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    try {
      await updateUser.mutateAsync({ id: user.id, data });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleDeletePost = async (postId: number) => {
    setDeletingId(postId);
    try {
      await deletePost.mutateAsync({ id: postId });
      queryClient.invalidateQueries({ queryKey: getListSkillPostsQueryKey() });
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || !user) return null;

  const offeredPosts = myPosts?.filter((p) => p.type === "offer") ?? [];
  const requestedPosts = myPosts?.filter((p) => p.type === "request") ?? [];

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-8">My Profile</h1>

      {/* Profile Card */}
      <Card className="border-card-border mb-8 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary via-purple-500 to-secondary" />
        <CardContent className="pt-0 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {user.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <Button
              variant={editing ? "outline" : "default"}
              size="sm"
              onClick={() => setEditing(!editing)}
              className="rounded-full"
            >
              {editing ? "Cancel" : <><Pencil className="mr-2 h-3.5 w-3.5" /> Edit Profile</>}
            </Button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input {...register("name")} className={errors.name ? "border-destructive" : ""} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>College</Label>
                  <Input {...register("college")} className={errors.college ? "border-destructive" : ""} />
                  {errors.college && <p className="text-xs text-destructive">{errors.college.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Input {...register("department")} className={errors.department ? "border-destructive" : ""} />
                  {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <Textarea
                  rows={3}
                  placeholder="Tell others a bit about yourself..."
                  {...register("bio")}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 font-semibold" disabled={updateUser.isPending}>
                  {updateUser.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-2xl font-display font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> {user.college}</span>
                <span>·</span>
                <span>{user.department}</span>
              </div>
              {user.bio && (
                <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{user.bio}</p>
              )}
              <div className="flex gap-3 mt-4 text-sm">
                <div className="text-center">
                  <div className="font-display font-bold text-lg text-primary">{myPosts?.length ?? 0}</div>
                  <div className="text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-lg text-primary">{offeredPosts.length}</div>
                  <div className="text-muted-foreground">Offering</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-lg text-primary">{requestedPosts.length}</div>
                  <div className="text-muted-foreground">Seeking</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skill Posts */}
      <div className="space-y-6">
        {/* Offering */}
        <div>
          <CardTitle className="flex items-center gap-2 mb-4 text-lg font-display">
            <BookOpen className="h-5 w-5 text-primary" />
            Skills I'm Offering ({offeredPosts.length})
          </CardTitle>
          {postsLoading ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : offeredPosts.length === 0 ? (
            <Card className="border-card-border border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                <p>No skills offered yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {offeredPosts.map((post) => (
                <Card key={post.id} className="border-card-border">
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{post.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{post.description}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{post.category}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{post.skillLevel}</Badge>
                        <span className="text-xs text-muted-foreground">{post.availability}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletingId === post.id}
                    >
                      {deletingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Requesting */}
        <div>
          <CardTitle className="flex items-center gap-2 mb-4 text-lg font-display">
            <BookOpen className="h-5 w-5 text-secondary" />
            Skills I'm Seeking ({requestedPosts.length})
          </CardTitle>
          {postsLoading ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : requestedPosts.length === 0 ? (
            <Card className="border-card-border border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                <p>No skill requests yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {requestedPosts.map((post) => (
                <Card key={post.id} className="border-card-border">
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{post.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{post.description}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                        <span className="text-xs text-muted-foreground">{post.availability}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletingId === post.id}
                    >
                      {deletingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
