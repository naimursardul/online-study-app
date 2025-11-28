import { checkAuth } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";
import { RedirectType, redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function ServiceNavbar() {
  type UserType = {
    name: string;
    phone: string;
    avatar: string;
  };

  const user = await checkAuth();
  // console.log(user);
  const userDetails: UserType = {
    name: user?.name,
    phone: user?.phone,
    avatar: "",
  };

  // LOGOUT
  const handleLogout = async () => {
    "use server";
    console.log("logout");
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("connect.sid")?.value || "";
    if (!sessionCookie) {
      return;
    }
    const cookieToSend = `connect.sid=${sessionCookie}`;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/auth/logout`,
        {
          credentials: "include",
          headers: {
            cookies: cookieToSend,
          },
        }
      );

      const data = await response.json();
      if (!data.success) {
        return;
      }

      if (sessionCookie) cookieStore.delete("connect.sid");
    } catch (error) {
      console.log(error);
      return;
    }

    redirect("/login", RedirectType.replace);
  };
  return (
    <div className="w-full flex justify-between items-center ">
      <h2 className="text-2xl max-md:text-xl font-semibold">Question Bank</h2>
      {!user ? (
        <div>Login</div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer hover:opacity-90 border-none outline-none">
            <Avatar>
              <AvatarImage src={userDetails?.avatar} />
              <AvatarFallback className="bg-background font-bold">
                {userDetails?.name.slice(0, 1).toLocaleUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            className="w-[250px] mr-10 bg-background border-1 border-sidebar rounded-xl p-3"
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={userDetails?.avatar}
                    alt={userDetails?.name}
                  />
                  <AvatarFallback className="rounded-lg ">
                    {userDetails?.name.slice(0, 1).toLocaleUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {userDetails?.name}
                  </span>
                  <span className="truncate text-xs">{userDetails.phone}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
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
            <form action={handleLogout}>
              <button className="w-full">
                <DropdownMenuItem className="cursor-pointer">
                  <LogOut />
                  Log out
                </DropdownMenuItem>{" "}
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
