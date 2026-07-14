import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store";

type VerifyEmailPageProps = Readonly<{
  params: Promise<{ store: string }>;
  searchParams: Promise<{ token?: string }>;
}>;

export default async function VerifyEmailPage({ params, searchParams }: VerifyEmailPageProps) {
  const { store: storeSlug } = await params;
  const { token } = await searchParams;

  const store = await getStoreBySlug(storeSlug);

  if (!store) {
    notFound();
  }

  const normalizedToken = String(token ?? "").trim();
  const now = new Date();

  let status: "success" | "expired" = "expired";

  if (normalizedToken) {
    const user = await prisma.user.findFirst({
      where: {
        storeId: store.id,
        emailVerifyToken: normalizedToken,
      },
      select: {
        id: true,
        emailVerifyExpires: true,
        emailVerifiedAt: true,
      },
    });

    if (user) {
      const isValid = user.emailVerifiedAt || (user.emailVerifyExpires && user.emailVerifyExpires > now);

      if (isValid) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerifiedAt: user.emailVerifiedAt ?? now,
            emailVerifyToken: null,
            emailVerifyExpires: null,
          },
        });

        status = "success";
      }
    }
  }

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-16">
      <section className="w-full max-w-lg rounded-xl border border-brand-border/60 bg-white p-8 shadow-focus">
        <h1 className="text-3xl font-bold text-brand-ink">{status === "success" ? "Email confirmed" : "Link expired"}</h1>
        <p className="mt-3 text-sm text-brand-muted">
          {status === "success"
            ? `Your email is now confirmed for ${store.name}. You can keep using your account normally.`
            : "This confirmation link is invalid or expired. Your account still works, but this link can no longer be used."}
        </p>
        <Link
          href={`/${store.slug}/login`}
          className="mt-6 inline-flex rounded-lg bg-brand-green px-4 py-3 text-sm font-bold text-white"
        >
          Go to Login
        </Link>
      </section>
    </div>
  );
}
