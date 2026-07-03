import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 font-semibold text-foreground">SymbioMarket</h3>
            <p className="text-sm text-muted-foreground">
              Settlement infrastructure for the open creator stack.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Built with</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Arc testnet</li>
              <li>x402 payment protocol</li>
              <li>USDC</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/creators" className="text-primary hover:opacity-80">
                  Registry
                </Link>
              </li>
              <li>
                <Link href="/swarm" className="text-primary hover:opacity-80">
                  Live demo
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-primary hover:opacity-80">
                  Get started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>
            Per-use payments for feeds and articles · Settlement on Arc testnet ·{" "}
            <a
              href="https://github.com/JoshHellix/Symbiomarket"
              className="underline hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              Open source
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
