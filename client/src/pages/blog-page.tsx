import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Post, User, insertPostSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const coverImages = [
  "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3",
  "https://images.unsplash.com/photo-1455849318743-b2233052fcff",
  "https://images.unsplash.com/photo-1504805572947-34fad45aed93",
  "https://images.unsplash.com/photo-1472289065668-ce650ac443d2",
];

export default function BlogPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: blogPosts, isLoading: loadingBlogs } = useQuery<Post[]>({
    queryKey: ["/api/posts?type=blog"],
  });

  const { data: forumPosts, isLoading: loadingForum } = useQuery<Post[]>({
    queryKey: ["/api/posts?type=forum"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<z.infer<typeof insertPostSchema>>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "blog",
      tags: [],
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertPostSchema>) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts?type=${variables.type}`] });
      form.reset();
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
    },
  });

  const getUser = (id: number) => users?.find((u) => u.id === id);

  if (loadingBlogs || loadingForum) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                createPostMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Type</FormLabel>
                    <Tabs
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="blog">Blog Post</TabsTrigger>
                        <TabsTrigger value="forum">Forum Discussion</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[200px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value?.join(", ") || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={createPostMutation.isPending}
              >
                Publish Post
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Tabs defaultValue="blog">
        <TabsList className="w-full">
          <TabsTrigger value="blog" className="flex-1">Blog Posts</TabsTrigger>
          <TabsTrigger value="forum" className="flex-1">Forum Discussions</TabsTrigger>
        </TabsList>

        <TabsContent value="blog">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts?.map((post, index) => {
              const author = getUser(post.authorId);
              return (
                <Card key={post.id}>
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${
                        coverImages[index % coverImages.length]
                      })`,
                    }}
                  />
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar>
                        <AvatarFallback>
                          {author?.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{author?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <CardTitle>{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {post.content.slice(0, 200)}...
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {post.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-primary/10 text-primary text-sm px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="forum">
          <div className="space-y-6">
            {forumPosts?.map((post) => {
              const author = getUser(post.authorId);
              return (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar>
                        <AvatarFallback>
                          {author?.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{author?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <CardTitle>{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap mb-4">
                      {post.content}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {post.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-primary/10 text-primary text-sm px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
