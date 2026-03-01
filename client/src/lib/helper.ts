"use server";

import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

export async function getDataForOptions(tag: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/${tag}`
    );

    const data: {
      message: string;
      success: boolean;
      data: [];
    } = await response.json();

    if (!data.success) {
      console.error(data.message);
      return [];
    }
    // console.log(data?.data);
    return data?.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export const checkAuth = async () => {
  console.log("checkauth hit");
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("connect.sid")?.value || "";

  console.log(sessionCookie);
  if (!sessionCookie) {
    return null;
  }

  const cookieToSend = `connect.sid=${sessionCookie}`;
  console.log("cookieToSend :", cookieToSend);

  console.log(cookieToSend);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/auth/check-auth`,
      {
        headers: {
          cookie: cookieToSend,
        },
      }
    );

    const data = await res.json();

    if (!data.success) {
      console.error(data.message);
      return null;
    }
    return data.user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("connect.sid");
}

export const logOutFn = async () => {
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
