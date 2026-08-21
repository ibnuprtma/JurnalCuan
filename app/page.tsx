import { redirect } from "next/navigation";

export default function HomePage() {
  // Root redirect ke dashboard — middleware akan menangani proteksi login
  redirect("/dashboard");
}
