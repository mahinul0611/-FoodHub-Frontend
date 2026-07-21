import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-neutral-900">
            <span aria-hidden="true">{"\uD83C\uDF5C"}</span> Food
            <span className="text-brand-600">Hub</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-neutral-500">
            Fresh, homemade meals from trusted local providers, delivered right
            to your door.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            <li>
              <Link href="/meals" className="hover:text-brand-600">
                Browse meals
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-brand-600">
                Your cart
              </Link>
            </li>
            <li>
              <Link href="/dashboard/orders" className="hover:text-brand-600">
                Track orders
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">For partners</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            <li>
              <Link href="/register" className="hover:text-brand-600">
                Become a provider
              </Link>
            </li>
            <li>
              <Link href="/provider" className="hover:text-brand-600">
                Provider dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-500">
            <li>support@foodhub.example</li>
            <li>+880 1700-000000</li>
            <li>Dhaka, Bangladesh</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-400">
        {"\u00A9"} {new Date().getFullYear()} FoodHub. All rights reserved.
      </div>
    </footer>
  );
}
