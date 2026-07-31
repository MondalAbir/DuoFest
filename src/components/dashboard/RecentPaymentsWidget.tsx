import { Link } from "react-router";
import { ArrowUpRight, Wallet } from "lucide-react";
import { payments } from "@/data/payments";
import { formatCurrency, formatDate } from "@/utils/format";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Payment } from "@/types";
import type { DataTableColumn } from "@/components/tables/DataTable";
import { DataTable } from "@/components/tables/DataTable";

const columns: DataTableColumn<Payment>[] = [
  {
    key: "college",
    header: "College",
    cell: (payment) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {payment.collegeName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {payment.invoice}
        </p>
      </div>
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
    hideBelow: "md",
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

export function RecentPaymentsWidget() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover">
      <div className="flex items-center justify-between px-6 pt-5">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
            <Wallet className="h-4 w-4 text-primary" />
            Recent Payments
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Latest transactions across colleges
          </p>
        </div>
        <Link
          to="/admin/payments"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={payments.slice(0, 5)}
          rowKey={(payment) => payment.id}
          pageSize={6}
          compact
        />
      </div>
    </div>
  );
}
