import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

interface SessionContent {
  id?: number;
}

export default async function getSession() {
  return getIronSession<SessionContent>(cookies(), {
    cookieName: "byebuy",
    password: process.env.COOKIE_PASSWORD!,
  });
}
