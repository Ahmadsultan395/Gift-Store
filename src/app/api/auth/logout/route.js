import { ok } from "@/lib/apiResponse";
const CUST_COOKIE = "pansar_customer";
export async function POST() {
  const res = ok(null, "Logged out");
  res.headers.set("Set-Cookie", `${CUST_COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
  return res;
}
