export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <header className="mb-10 animate-ink-drop text-center">
          <h1 className="font-display text-4xl tracking-tight text-ink-black">
            Sumi
          </h1>
          <div className="mx-auto mt-2 flex max-w-48 items-center gap-3">
            <div className="h-px flex-1 animate-brush-reveal bg-gradient-to-r from-transparent via-accent-vermillion/60 to-transparent" />
          </div>
        </header>

        <main id="main-content">{children}</main>
      </div>
    </div>
  );
}
