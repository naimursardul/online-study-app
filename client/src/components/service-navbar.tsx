"use client";

import { checkAuth, logOutFn } from "@/lib/helper";
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
import { useEffect, useState } from "react";

export default function ServiceNavbar() {
  type UserType = {
    name: string;
    phone: string;
    avatar: string;
  };

  const [userDetails, setUserDetails] = useState<UserType | null>(null);

  useEffect(() => {
    const getUserDetails = async () => {
      const user = await checkAuth();

      if (user) {
        setUserDetails({
          name: user?.name,
          phone: user?.phone,
          avatar: "",
        });
      }
    };

    getUserDetails();
  }, []);

  // LOGOUT
  const handleLogout = async () => {
    await logOutFn();
  };
  return (
    <div className="w-full flex justify-between items-center ">
      <h2 className="text-2xl max-md:text-xl font-semibold">Question Bank</h2>
      {!userDetails ? (
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
