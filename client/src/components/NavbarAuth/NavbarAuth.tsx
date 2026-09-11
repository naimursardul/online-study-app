import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/Auth-context";
import { toast } from "sonner";
import { client } from "@/utils/utils";
import { getApiErrorMessage } from "@/lib/api-error";
import ThemeToggle from "../theme/toggleMode";
import { Skeleton } from "../ui/skeleton";

export default function NavbarAuth() {
  const { user, userExisted, setUser, authLoader } = useAuth();
  const isMobile = window.innerWidth < 640; // Example breakpoint for mobile devices

  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();
  // LOGOUT
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await client.post(`/auth/logout`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Logout failed."));
    } finally {
      // Local state clears no matter how the request went: a session that
      // can't reach the server (or already expired server-side) is no reason
      // to keep the UI showing the user as logged in.
      setUser(null);
      localStorage.removeItem("userExisted");
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex items-center gap-4 max-sm:gap-2">
      <ThemeToggle />
      {userExisted && authLoader ? (
        <Skeleton className="h-8 w-8 rounded-full bg-background border-background " />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer hover:opacity-90 border-none outline-none">
            <Avatar>
              <AvatarImage src={user?.img} />
              <AvatarFallback className="bg-background font-bold">
                {user?.name?.slice(0, 1).toLocaleUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            className="w-62.5 mr-10 bg-background border border-sidebar rounded-xl p-3"
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.img} alt={user?.name} />
                  <AvatarFallback className="rounded-full ">
                    {user?.name?.slice(0, 1).toLocaleUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.phone}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to={"/dashboard"}>
                <DropdownMenuItem className="cursor-pointer">
                  <LayoutDashboard />
                  Dashboard
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full disabled:opacity-50"
            >
              <DropdownMenuItem className="cursor-pointer">
                <LogOut />
                {loggingOut ? "Logging out…" : "Log out"}
              </DropdownMenuItem>
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex gap-1">
          <Link to={"/signup"} className="max-sm:hidden">
            <Button
              variant={"outline"}
              size={"sm"}
              className="cursor-pointer max-sm:text-xs"
            >
              Signup
            </Button>
          </Link>
          <Link to={"/login"}>
            <Button className="cursor-pointer" size={isMobile ? "xs" : "sm"}>
              Login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
