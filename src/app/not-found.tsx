import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-[0px_8px_30px_rgba(0,77,64,0.08)]">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-secondary">
          404
        </p>

        <h1 className="text-3xl font-bold text-primary">Page Not Found</h1>

        <p className="mt-4 leading-7 text-muted-foreground">
          The page you are looking for does not exist.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            href="/en"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}