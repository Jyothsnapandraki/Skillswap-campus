import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useCreateSkillPost } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

const CATEGORIES = ["Programming", "Design", "Mathematics", "Science", "Languages", "Music", "Writing", "Business", "Engineering", "Other"];

const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  type: z.enum(["offer", "request"]),
  availability: z.string().min(1, "Please describe your availability"),
});

type PostForm = z.infer<typeof postSchema>;

export default function CreatePost() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const createMutation = useCreateSkillPost();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      type: "offer",
      skillLevel: "beginner",
    },
  });

  const onSubmit = async (data: PostForm) => {
    try {
      await createMutation.mutateAsync({ data });
      toast.success("Skill post created successfully!");
      setLocation("/browse");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 max-w-2xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/browse"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse</Link>
        </Button>
        <h1 className="text-3xl font-display font-bold">Create a Skill Post</h1>
        <p className="text-muted-foreground mt-1">Share what you can offer or what you need help with</p>
      </div>

      <Card className="border-card-border shadow-lg">
        <CardHeader>
          <CardTitle className="font-display">Post Details</CardTitle>
          <CardDescription>Fill in the details about the skill you're offering or requesting</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Post Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["offer", "request"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue("type", t)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      watch("type") === t
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="font-semibold capitalize">{t === "offer" ? "Offering" : "Requesting"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t === "offer" ? "I can teach this skill" : "I want to learn this skill"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder={watch("type") === "offer" ? 'e.g. "Can teach React basics"' : 'e.g. "Need help with DSA"'}
                {...register("title")}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe the skill, your experience level, and what you hope to achieve or teach..."
                {...register("description")}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            {/* Category + Skill Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Skill Level</Label>
                <Select defaultValue="beginner" onValueChange={(v) => setValue("skillLevel", v as "beginner" | "intermediate" | "advanced")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                placeholder='e.g. "Weekends & evenings", "Flexible", "Weekday afternoons"'
                {...register("availability")}
                className={errors.availability ? "border-destructive" : ""}
              />
              {errors.availability && <p className="text-xs text-destructive">{errors.availability.message}</p>}
            </div>

            <Button type="submit" className="w-full font-semibold" size="lg" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating post...</>
              ) : (
                "Create Post"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
