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
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export default function ServiceNavbar() {
  interface IUser {
    name: string;
    phone: string;
    avatar: string;
  }

  const user: IUser = { name: "John Doe", phone: "123-456-7890", avatar: "" };
  console.log(user);

  // LOGOUT
  // const handleLogout = async () => {
  //   "use server";
  //   console.log("logout");
  //   const cookieStore = await cookies();
  //   const sessionCookie = cookieStore.get("connect.sid")?.value || "";
  //   if (!sessionCookie) {
  //     return;
  //   }
  //   const cookieToSend = `connect.sid=${sessionCookie}`;
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/auth/logout`,
  //       {
  //         credentials: "include",
  //         headers: {
  //           cookies: cookieToSend,
  //         },
  //       }
  //     );

  //     const data = await response.json();
  //     if (!data.success) {
  //       return;
  //     }

  //     if (sessionCookie) cookieStore.delete("connect.sid");
  //   } catch (error) {
  //     console.log(error);
  //     return;
  //   }

  //   redirect("/login", RedirectType.replace);
  // };
  return (
    <div className="w-full flex justify-between items-center gap-2">
      <h2 className="text-2xl max-md:text-xl font-semibold">Question Bank</h2>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer hover:opacity-90 border-none outline-none">
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-background font-bold">
                {user?.name.slice(0, 1).toLocaleUpperCase()}
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
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="rounded-full ">
                    {user?.name.slice(0, 1).toLocaleUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user.phone}</span>
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
            <form>
              <button className="w-full">
                <DropdownMenuItem className="cursor-pointer">
                  <LogOut />
                  Log out
                </DropdownMenuItem>{" "}
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex gap-1">
          <Link to={"/signup"}>
            <Button variant={"outline"} size={"sm"} className="cursor-pointer">
              Signup
            </Button>
          </Link>
          <Link to={"/login"}>
            <Button className="cursor-pointer" size={"sm"}>
              Login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
