import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-6xl" aria-hidden="true">
        {"\uD83C\uDF7D\uFE0F"}
      </p>
      <h1 className="mt-4 text-2xl font-bold text-neutral-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        Back to home
      </Link>
    </div>
  );
}
