import { useMemo, useState } from "react";
import {
  Award,
  CheckCheck,
  Download,
  Eye,
  FileCheck2,
  MailCheck,
  Send,
} from "lucide-react";
import {
  collegeCertificates,
  type CollegeCertificate,
} from "@/data/college/certificates";
import { searchInArray } from "@/utils/filter";
import { formatDate } from "@/utils/format";
import { PageHeader } from "@/components/common/PageHeader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const buildColumns: (
  onPreview: (certificate: CollegeCertificate) => void,
) => DataTableColumn<CollegeCertificate>[] = (onPreview) => [
  {
    key: "student",
    header: "Student",
    cell: (certificate) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={certificate.studentName}
          color={certificate.avatarColor}
          size="sm"
        />
        <span className="truncate text-sm font-medium text-foreground">
          {certificate.studentName}
        </span>
      </div>
    ),
  },
  {
    key: "event",
    header: "Event",
    hideBelow: "md",
    cell: (certificate) => (
      <span className="text-sm text-foreground">{certificate.eventName}</span>
    ),
  },
  {
    key: "attendance",
    header: "Attendance",
    sortable: true,
    sortValue: (certificate) => certificate.attendance,
    hideBelow: "sm",
    cell: (certificate) => (
      <span className="text-sm font-medium text-foreground">
        {certificate.attendance}%
      </span>
    ),
  },
  {
    key: "certificateStatus",
    header: "Certificate",
    cell: (certificate) => (
      <StatusBadge status={certificate.certificateStatus} dot />
    ),
  },
  {
    key: "emailStatus",
    header: "Email",
    hideBelow: "md",
    cell: (certificate) => (
      <StatusBadge status={certificate.emailStatus} dot />
    ),
  },
  {
    key: "issuedOn",
    header: "Issued On",
    sortable: true,
    sortValue: (certificate) => new Date(certificate.issuedOn).getTime(),
    hideBelow: "lg",
    cell: (certificate) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(certificate.issuedOn)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    cell: (certificate) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => onPreview(certificate)}
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>
    ),
  },
];

function CertificatePreview({
  certificate,
  onClose,
}: {
  certificate: CollegeCertificate;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Certificate preview</DialogTitle>
        </DialogHeader>
        <div
          className="relative overflow-hidden rounded-2xl border border-border"
          style={{
            backgroundImage: `linear-gradient(135deg, ${certificate.avatarColor}1A 0%, ${certificate.avatarColor}0D 100%)`,
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary via-info to-success" />
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <Award className="h-10 w-10 text-primary" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Certificate of Participation
            </p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {certificate.studentName}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              has successfully participated in{" "}
              <span className="font-semibold text-foreground">
                {certificate.eventName}
              </span>{" "}
              with {certificate.attendance}% attendance.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              Issued on {formatDate(certificate.issuedOn)} · ID {certificate.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            className="flex-1 gap-2"
            disabled={certificate.emailStatus === "sent"}
            onClick={onClose}
          >
            <Send className="h-4 w-4" />
            {certificate.emailStatus === "sent" ? "Already Sent" : "Send by Email"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CollegeCertificatesPage() {
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("all");
  const [preview, setPreview] = useState<CollegeCertificate | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const events = useMemo(
    () =>
      Array.from(
        new Set(collegeCertificates.map((certificate) => certificate.eventName)),
      ),
    [],
  );

  const filtered = useMemo(() => {
    const searched = searchInArray(collegeCertificates, query, [
      "studentName",
      "eventName",
    ]);
    return searched.filter(
      (certificate) =>
        (eventFilter === "all" || certificate.eventName === eventFilter) &&
        (statusFilter === "all" ||
          certificate.certificateStatus === statusFilter) &&
        (emailFilter === "all" || certificate.emailStatus === emailFilter),
    );
  }, [query, eventFilter, statusFilter, emailFilter]);

  const stats = useMemo(
    () => [
      {
        label: "Eligible",
        value: collegeCertificates.filter(
          (certificate) => certificate.certificateStatus === "eligible",
        ).length,
        icon: FileCheck2,
        tint: "text-info",
      },
      {
        label: "Generated",
        value: collegeCertificates.filter(
          (certificate) => certificate.certificateStatus === "generated",
        ).length,
        icon: Award,
        tint: "text-warning",
      },
      {
        label: "Sent",
        value: collegeCertificates.filter(
          (certificate) => certificate.certificateStatus === "sent",
        ).length,
        icon: Send,
        tint: "text-primary",
      },
      {
        label: "Downloaded",
        value: collegeCertificates.filter(
          (certificate) => certificate.certificateStatus === "downloaded",
        ).length,
        icon: CheckCheck,
        tint: "text-success",
      },
    ],
    [],
  );

  const columns = useMemo(() => buildColumns(setPreview), []);

  const toggleSelect = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((current) => {
      const next = new Set(current);
      const allIds = filtered.map((certificate) => certificate.id);
      const allSelected = allIds.every((id) => next.has(id));
      allIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        subtitle="Generate, email and track certificates"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              disabled={selected.size === 0}
              onClick={() => setSelected(new Set())}
            >
              <FileCheck2 className="h-4 w-4" />
              Generate ({selected.size})
            </Button>
            <Button className="gap-2" disabled={selected.size === 0}>
              <MailCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Send by Email</span>
              <span className="sm:hidden">Send ({selected.size})</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className={`h-5 w-5 ${stat.tint}`} />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student or event…"
            className="h-10 rounded-xl pl-9"
            aria-label="Search certificates"
          />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-52" aria-label="Filter by event">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event} value={event}>
                {event}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-40" aria-label="Filter by certificate status">
            <SelectValue placeholder="All certificates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All certificates</SelectItem>
            <SelectItem value="eligible">Eligible</SelectItem>
            <SelectItem value="generated">Generated</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="downloaded">Downloaded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={emailFilter} onValueChange={setEmailFilter}>
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-40" aria-label="Filter by email status">
            <SelectValue placeholder="All emails" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All emails</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(certificate) => certificate.id}
        pageSize={8}
        emptyMessage="No certificates found"
        selection={{
          selectedKeys: selected,
          onSelectionChange: toggleSelect,
          onSelectAll: toggleAll,
        }}
      />

      {preview && (
        <CertificatePreview
          certificate={preview}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
