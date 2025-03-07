import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message, User, insertMessageSchema } from "@shared/schema";
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();

  const { data: messages, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm<z.infer<typeof insertMessageSchema>>({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: {
      content: "",
      receiverId: 0,
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertMessageSchema>) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      form.reset();
    },
  });

  const getUser = (id: number) => users?.find((u) => u.id === id);

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {users
                ?.filter((u) => u.id !== user?.id)
                .map((contact) => (
                  <button
                    key={contact.id}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                      form.getValues("receiverId") === contact.id
                        ? "bg-primary/10"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => form.setValue("receiverId", contact.id)}
                  >
                    <Avatar>
                      <AvatarFallback>
                        {contact.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {contact.type}
                      </div>
                    </div>
                  </button>
                ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-20rem)] mb-4">
              <div className="space-y-4">
                {messages?.map((message) => {
                  const isOwn = message.senderId === user?.id;
                  const sender = getUser(message.senderId);
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-2 max-w-[80%] ${
                          isOwn ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar>
                          <AvatarFallback>
                            {sender?.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p>{message.content}</p>
                          <span className="text-xs opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  sendMessageMutation.mutate(data)
                )}
                className="flex gap-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Type your message..."
                          {...field}
                          disabled={!form.getValues("receiverId")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={
                    sendMessageMutation.isPending || !form.getValues("receiverId")
                  }
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
