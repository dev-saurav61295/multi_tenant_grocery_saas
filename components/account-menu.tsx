import Link from "next/link";
import { MdLogout, MdPerson } from "react-icons/md";
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
        <MdPerson className="text-[16px] leading-none text-brand-green" aria-hidden="true" />
        {session.name}
      </span>
      <button type="submit" className="flex items-center gap-1 text-brand-muted hover:text-brand-orange-deep">
        <MdLogout className="text-[16px] leading-none" aria-hidden="true" />
        Log out
      </button>
    </form>
  );
}
