import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/contac")({
  component: ContactRedirect,
});

function ContactRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/contact", replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
      Redirecting to Contact Us…
    </div>
  );
}
