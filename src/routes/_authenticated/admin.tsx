import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useMyRoles } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Gram Seva" }] }),
  component: AdminGuard,
});

function AdminGuard() {
  const { isSuperAdmin, loading } = useMyRoles();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-sm text-muted-foreground">{t("Loading…")}</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold">{t("Access Denied", "యాక్సెస్ నిరాకరించబడింది")}</h2>
            <p className="mt-2 text-muted-foreground">
              {t("Super Admin access required", "సూపర్ అడ్మిన్ యాక్సెస్ అవసరం")}
            </p>
            <Button asChild className="mt-4" variant="outline" size="sm">
              <Link to="/dashboard">{t("Go home")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}
