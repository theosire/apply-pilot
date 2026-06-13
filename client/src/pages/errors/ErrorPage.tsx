import { Link } from "react-router-dom";

type ErrorPageProps = {
  code: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
};

export const ErrorPage = ({
  code,
  title,
  message,
  actionLabel = "Go back home",
  actionTo = "/login",
}: ErrorPageProps) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md rounded-lg border bg-white p-6 text-center shadow-sm">
        <h1 className="text-5xl font-bold">{code}</h1>
        <p className="mt-2 text-lg font-semibold">{title}</p>
        <p className="mt-2 text-sm text-gray-500">{message}</p>

        <Link
          to={actionTo}
          className="mt-6 inline-block rounded bg-black px-4 py-2 text-white"
        >
          {actionLabel}
        </Link>
      </div>
    </main>
  );
};