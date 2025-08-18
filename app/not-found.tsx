import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-600">
        Sorry, we couldn’t find the page you were looking for.
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
