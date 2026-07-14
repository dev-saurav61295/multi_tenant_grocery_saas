import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { logout } from "@/app/actions/auth";
import type { SessionPayload } from "@/lib/session";

type AccountMenuProps = {
  storeSlug: string;
  session: SessionPayload | null;
};

export function AccountMenu({ storeSlug, session }: AccountMenuProps) {
  if (!session) {
    return (
      <Link href={`/${storeSlug}/login`} className="text-sm font-semibold text-brand-green hover:text-brand-orange-deep">
        Login
      </Link>
    );
  }

  return (
    <form action={logout.bind(null, storeSlug)} className="flex items-center gap-3 text-sm font-semibold text-brand-ink">
      <span className="hidden items-center gap-1 sm:flex">
        <UserRound className="h-4 w-4 text-brand-green" />
        {session.name}
      </span>
      <button type="submit" className="flex items-center gap-1 text-brand-muted hover:text-brand-orange-deep">
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </form>
  );
}
