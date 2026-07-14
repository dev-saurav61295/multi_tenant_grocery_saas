import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-background px-6 py-20 text-brand-ink">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-8">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-brand-green">Bhagwandas Traders SaaS</p>
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight md:text-6xl">
          Multi-store grocery operations for independent local markets.
        </h1>
        <p className="max-w-2xl text-lg text-brand-muted">
          Each store gets its own storefront, staff tools, and isolated data under a shared app.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white">
            Create a store
          </Link>
        </div>
      </div>
    </main>
  );
}
