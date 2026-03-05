import AdminMobileNav from "@/components/AdminMobileNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4.25rem)] bg-black/80">
      <aside className="hidden w-64 border-r border-white/10 bg-black/80 px-5 py-6 text-xs text-white/70 md:block">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-accent">
          Command center
        </p>
        <p className="mt-1 text-[0.7rem] text-white/50">
          CS Signature Celebrations
        </p>
        <nav className="mt-6 space-y-1">
          <a href="/admin" className="block rounded-md bg-white/5 px-3 py-2">
            Overview
          </a>
          <a
            href="/admin/products"
            className="block rounded-md px-3 py-2 hover:bg-white/5"
          >
            Products
          </a>
          <a
            href="/admin/orders"
            className="block rounded-md px-3 py-2 hover:bg-white/5"
          >
            Orders
          </a>
          <a
            href="/admin/inventory"
            className="block rounded-md px-3 py-2 hover:bg-white/5"
          >
            Inventory
          </a>
          <a
            href="/admin/customers"
            className="block rounded-md px-3 py-2 hover:bg-white/5"
          >
            Customers
          </a>
        </nav>
      </aside>
      <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <AdminMobileNav />
        <header className="mb-6 mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end md:mt-0">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-accent">
              Live operations
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Admin dashboard
            </h1>
          </div>
          <div className="glass-surface flex items-center gap-2 px-4 py-2 text-[0.7rem] text-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Monitoring orders, deliveries and inventory across London.
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
