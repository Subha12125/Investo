import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const { user } = useAuth();

  const { data: suggestedUsers } = useQuery<User[]>({
    queryKey: [`/api/users?type=${user?.type === "entrepreneur" ? "investor" : "entrepreneur"}`],
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome, {user?.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestedUsers?.map((suggestedUser) => (
          <Card key={suggestedUser.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {suggestedUser.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {suggestedUser.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {suggestedUser.bio}
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                {suggestedUser.interests?.map((interest) => (
                  <span
                    key={interest}
                    className="bg-primary/10 text-primary text-sm px-2 py-1 rounded"
                  >
                    {interest}
                  </span>
                ))}
              </div>
              <Link href="/messages">
                <Button className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
