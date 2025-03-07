import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Briefcase } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  const { user } = useAuth();

  const { data: suggestedUsers } = useQuery<User[]>({
    queryKey: [`/api/users?type=${user?.type === "entrepreneur" ? "investor" : "entrepreneur"}`],
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-2">
          {user?.type === "entrepreneur" 
            ? "Connect with investors who match your interests"
            : "Discover promising entrepreneurs in your field"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestedUsers?.map((suggestedUser) => (
          <Card key={suggestedUser.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg">
                      {suggestedUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{suggestedUser.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {suggestedUser.type}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-sm text-muted-foreground mb-4">
                {suggestedUser.bio || "No bio provided"}
              </p>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Areas of Interest</h3>
                <div className="flex gap-2 flex-wrap">
                  {suggestedUser.interests?.map((interest) => (
                    <span
                      key={interest}
                      className="bg-primary/10 text-primary text-sm px-2 py-1 rounded"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {suggestedUser.type === "investor" && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Expertise</h3>
                  <div className="flex gap-2 flex-wrap">
                    {suggestedUser.expertise?.map((item) => (
                      <span
                        key={item}
                        className="bg-secondary/50 text-secondary-foreground text-sm px-2 py-1 rounded"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4">
                <Link href="/messages">
                  <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}