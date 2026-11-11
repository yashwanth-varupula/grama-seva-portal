import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilePlus2, Search, MapPin, Calendar, ChevronRight, X } from "lucide-react";
import { CATEGORIES, type Complaint, type Category, type Status } from "@/lib/complaints";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/_authenticated/complaints/")({
  head: () => ({ meta: [{ title: "Complaints — Gram Seva Portal" }] }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const { t, tCategory, tStatus, formatDate } = useLanguage();

  const { data = [], isLoading } = useQuery({
    queryKey: ["complaints", cat, status],
    queryFn: async () => {
      let qb = supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (cat !== "all") qb = qb.eq("category", cat);
      if (status !== "all") qb = qb.eq("status", status);
      const { data, error } = await qb;
      if (error) throw error;
      return data as Complaint[];
    },
  });

  const rows = data.filter((c) =>
    q
      ? (c.title + " " + c.complaint_code + " " + (c.location ?? ""))
          .toLowerCase()
          .includes(q.toLowerCase())
      : true,
  );

  const hasActiveFilters = q || cat !== "all" || status !== "all";
  const clearFilters = () => {
    setQ("");
    setCat("all");
    setStatus("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Grievances")}
          </div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t("All Complaints")}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {rows.length} {t("records visible.", "రికార్డులు కనిపిస్తున్నాయి.")}
          </p>
        </div>
        <Button asChild size="sm" className="h-9">
          <Link to="/complaints/new">
            <FilePlus2 className="mr-1.5 h-4 w-4" />
            {t("Raise Grievance")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-2 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search by title, code or location…")}
              className="h-10 pl-9 text-base sm:h-9 sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Select value={cat} onValueChange={(v) => setCat(v as Category | "all")}>
              <SelectTrigger className="h-10 w-full text-base sm:h-9 sm:w-[170px] sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All categories")}</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {tCategory(c.value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as Status | "all")}>
              <SelectTrigger className="h-10 w-full text-base sm:h-9 sm:w-[170px] sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All statuses")}</SelectItem>
                {(
                  [
                    "submitted",
                    "assigned",
                    "in_review",
                    "work_in_progress",
                    "resolved",
                    "closed",
                    "reopened",
                    "escalated",
                    "rejected",
                  ] as Status[]
                ).map((s) => (
                  <SelectItem key={s} value={s}>
                    {tStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="col-span-2 h-9 text-xs text-muted-foreground sm:col-span-1"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                {t("Clear filters", "ఫిల్టర్లు క్లియర్ చేయండి")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {/* Mobile phone card list (<768px) */}
          <div className="divide-y md:hidden">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">{t("Loading…")}</div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t("No complaints match these filters.")}
              </div>
            ) : (
              rows.map((c) => (
                <Link
                  key={c.id}
                  to="/complaints/$id"
                  params={{ id: c.id }}
                  className="block p-4 transition-colors hover:bg-muted/40 active:bg-muted/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-mono font-semibold text-primary">
                          {c.complaint_code}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-foreground/80">
                          {tCategory(c.category)}
                        </span>
                      </div>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
                        {c.title}
                      </h3>
                      {c.location && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">{c.location}</span>
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {formatDate(c.created_at)}
                        </span>
                        <span className="flex items-center gap-0.5 font-medium text-primary">
                          {t("Details", "వివరాలు")}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Desktop/Tablet table (>=768px) */}
          <div className="hidden overflow-x-auto md:block">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-9 w-[110px] text-[11px] uppercase tracking-wider">
                    {t("Code")}
                  </TableHead>
                  <TableHead className="h-9 text-[11px] uppercase tracking-wider">
                    {t("Title")}
                  </TableHead>
                  <TableHead className="hidden h-9 w-[110px] text-[11px] uppercase tracking-wider md:table-cell">
                    {t("Category")}
                  </TableHead>
                  <TableHead className="hidden h-9 w-[100px] text-[11px] uppercase tracking-wider sm:table-cell">
                    {t("Priority")}
                  </TableHead>
                  <TableHead className="h-9 w-[130px] text-[11px] uppercase tracking-wider">
                    {t("Status")}
                  </TableHead>
                  <TableHead className="hidden h-9 w-[100px] text-[11px] uppercase tracking-wider md:table-cell">
                    {t("Created")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      {t("Loading…")}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      {t("No complaints match these filters.")}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer">
                      <TableCell className="py-2">
                        <Link
                          to="/complaints/$id"
                          params={{ id: c.id }}
                          className="font-mono text-[11px] text-primary hover:underline"
                        >
                          {c.complaint_code}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link
                          to="/complaints/$id"
                          params={{ id: c.id }}
                          className="block font-medium hover:underline"
                        >
                          <span className="line-clamp-1">{c.title}</span>
                          <span className="mt-0.5 line-clamp-1 text-[11px] font-normal text-muted-foreground sm:hidden">
                            {tCategory(c.category)} • {formatDate(c.created_at)}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden py-2 text-muted-foreground md:table-cell">
                        {tCategory(c.category)}
                      </TableCell>
                      <TableCell className="hidden py-2 sm:table-cell">
                        <PriorityBadge priority={c.priority} />
                      </TableCell>
                      <TableCell className="py-2">
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="hidden py-2 text-xs text-muted-foreground md:table-cell">
                        {formatDate(c.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
