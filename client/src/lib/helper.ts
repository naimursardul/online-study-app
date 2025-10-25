import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("connect.sid")?.value || "";

  console.log(sessionCookie);
  if (!sessionCookie) {
    return null;
  }

  const cookieToSend = `connect.sid=${sessionCookie}`;

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
