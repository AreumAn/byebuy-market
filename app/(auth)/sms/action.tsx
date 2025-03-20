"use server";

import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import crypto from "crypto";
import getSession from "@/lib/session";
import twilio from "twilio";
const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "en-CA"),
    "Wrong phone format"
  );

async function tokenExists(token: number) {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
    },
  });

  return Boolean(exists);
}

const tokenSchema = z.coerce.number().min(100000).max(999999).refine(tokenExists, "This token doesn't exist");

interface ActionState {
  token: boolean;
}

async function getToken() {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });

  if(exists) {
    return getToken();
  }

  return token;
}


export async function smsLogIn(prevState: ActionState, formData: FormData) {
  const phone = formData.get("phone");
  const token = formData.get("token");
  if (!prevState.token) {
    const result = await phoneSchema.spa(phone);
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      // Delete previous token
      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data,
          }
        },
      });
      // create new token
      // create new user if no user has this phone number
      const token = await getToken();
      await db.sMSToken.create({
        data: {
          token,
          user: {
            connectOrCreate: {
              where: {
                phone: result.data, 
              },
              create: {
                phone: result.data,
                username: crypto.randomBytes(10).toString("hex"),
              }
            }
          }
        }
      })
      // send token to user using twilio
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your byebuy market verification code is ${token}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.MY_PHONE_NUMBER!, // Added my phone number cause it's testing app for study - twilio trial account
      })

      return {
        token: true,
      };
    }
  } else {
    const result = await tokenSchema.spa(token);
    if (!result.success) {
      console.log(result.error.flatten());
      return {
        token: true,
        error: result.error.flatten(),
      };
    } else {
      // get the userId of token
      const token = await db.sMSToken.findUnique({
        where: {
          token: result.data.toString(),
        },
        select: {
          id: true,
          userId: true,
        }
      });

      
      const session = await getSession();
      session.id = token!.userId;
      await session.save();
      await db.sMSToken.delete({
        where: {
          id: token!.id,
        }
      })
      redirect("/profile");
      
      // log the user in
    }
  }
}
