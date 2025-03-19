import { cookies } from 'next/headers';
import getSession from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

interface Routes {
  [key: string]: boolean;
}

const publicOnlyUrls: Routes = {
  "/": true,
  "/create-account": true,
  "/login": true,
  "/sms": true,
}

export default async function middleware(request: NextRequest) {
  const session = await getSession();
  const exists = publicOnlyUrls[request.nextUrl.pathname];
  if(!session.id) {
    if(!exists) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    // User is logged in
    if(exists) {
      // User is logged in and is trying to access a public page
      // return NextResponse.redirect(new URL("/products", request.url));
    }
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
