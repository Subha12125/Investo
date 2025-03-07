import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Newspaper, User, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <Home className="mr-2 h-4 w-4" />
                  Investo
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/messages">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/blog">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <Newspaper className="mr-2 h-4 w-4" />
                  Blog & Forum
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Link href="/profile">
            <Button variant="ghost">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}