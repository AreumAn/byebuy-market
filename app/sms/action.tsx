"use server";

import { z } from "zod";
import validator from "validator";

const phoneSchema = z.string().trim().refine(validator.isMobilePhone);

const tokenSchema = z.coerce.number().min(100000).max(999999);

export async function smsLogin(prevState: any, formData: FormData) {
  const phone = formData.get("phone");
  const result = phoneSchema.safeParse(phone);
  
}
