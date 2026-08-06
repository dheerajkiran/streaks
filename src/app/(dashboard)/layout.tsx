import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { TimezoneSync } from "@/components/TimezoneSync";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <TimezoneSync />
      <ServiceWorkerRegister />
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/">Streaks</Link>
            <Link href="/trackers" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              Trackers
            </Link>
            <Link href="/todos" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              To-Do
            </Link>
            <Link href="/finance" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              Finance
            </Link>
            <Link href="/assistant" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              Assistant
            </Link>
          </nav>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
