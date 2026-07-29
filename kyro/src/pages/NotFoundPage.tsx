import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-medium text-violet-300">404</p>
      <h1 className="text-3xl font-semibold text-ink">Nothing here.</h1>
      <Link to="/">
        <Button variant="secondary">Back to KYRO</Button>
      </Link>
    </div>
  );
}
