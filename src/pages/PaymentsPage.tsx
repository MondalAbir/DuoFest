import { useMemo, useState } from "react";
import { Download, Wallet } from "lucide-react";
import { useTransactions } from "@/lib/hooks";
import { adaptPayment } from "@/lib/adapters";
import type { DashboardStat, Payment } from "@/types";
import { searchInArray, filterByStatus } from "@/utils/filter";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { TableToolbar } from "@/components/common/TableToolbar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";

const columns: DataTableColumn<Payment>[] = [
  {
    key: "invoice",
    header: "Invoice",
    cell: (payment) => (
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{payment.invoice}</p>
        <p className="truncate text-xs text-muted-foreground">
          {payment.method}
        </p>
      </div>
    ),
  },
  {
    key: "college",
    header: "College",
    hideBelow: "md",
    cell: (payment) => (
      <span className="text-sm text-foreground">{payment.collegeName}</span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    sortable: true,
    sortValue: (payment) => payment.amount,
    cell: (payment) => (
      <span className="text-sm font-semibold text-foreground">
        {formatCurrency(payment.amount)}
      </span>
    ),
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    sortValue: (payment) => new Date(payment.date).getTime(),
    hideBelow: "lg",
    cell: (payment) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(payment.date)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (payment) => <StatusBadge status={payment.status} dot />,
  },
];

export default function PaymentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useTransactions({ perPage: 100 });
  const payments = (data?.items ?? []).map(adaptPayment);

  const stats = useMemo<DashboardStat[]>(() => {
    const collected = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pending = payments
      .filter((p) => p.status === "pending")
      .reduce((sum, payment) => sum + payment.amount, 0);
    return [
      {
        id: "pay-collected",
        title: "Collected",
        value: collected,
        prefix: "$",
        delta: { value: 9.4, direction: "up", label: "vs last month" },
        icon: "dollar",
        tint: "success",
      },
      {
        id: "pay-pending",
        title: "Pending Amount",
        value: pending,
        prefix: "$",
        delta: { value: 2.3, direction: "down", label: "vs last month" },
        icon: "sparkles",
        tint: "warning",
      },
      {
        id: "pay-count",
        title: "Transactions",
        value: payments.length,
        delta: { value: 6.8, direction: "up", label: "vs last month" },
        icon: "wallet",
        tint: "primary",
      },
      {
        id: "pay-failed",
        title: "Failed",
        value: payments.filter((p) => p.status === "failed").length,
        delta: { value: 0.7, direction: "down", label: "vs last month" },
        icon: "ticket",
        tint: "danger",
      },
    ];
  }, [payments]);

  const filtered = useMemo(() => {
    const searched = searchInArray(payments, query, [
      "invoice",
      "collegeName",
      "method",
    ]);
    return filterByStatus(searched, "status", status);
  }, [query, status, payments]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Monitor billing, payouts and transaction health"
        actions={
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Ledger
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-muted-foreground">
        <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <p>
          Next payout run scheduled for{" "}
          <span className="font-medium text-foreground">August 5, 2026</span>.
          {formatDateTime("2026-07-31T09:00:00")} payout of the current cycle
          has been reconciled successfully.
        </p>
      </div>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search invoice, college or method…"
        filterValue={status}
        onFilterChange={setStatus}
        filterOptions={[
          { value: "all", label: "All statuses" },
          { value: "paid", label: "Paid" },
          { value: "pending", label: "Pending" },
          { value: "failed", label: "Failed" },
        ]}
        total={filtered.length}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(payment) => payment.id}
        pageSize={8}
        loading={isLoading}
        emptyMessage="No payments found"
      />
    </div>
  );
}
