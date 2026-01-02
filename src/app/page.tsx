import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if ((session.user as any).role === "ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect("/dashboard");
    }
  } else {
    redirect("/login");
  }
}
