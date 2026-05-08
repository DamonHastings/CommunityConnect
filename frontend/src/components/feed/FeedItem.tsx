import { Link } from "react-router-dom";
import {
  Briefcase,
  BookOpen,
  Megaphone,
  CheckCircle,
  Handshake,
  ArrowRightLeft,
  Building2,
} from "lucide-react";
import type { FeedItem as FeedItemType } from "../../hooks/useFeed";
import { formatDate } from "../../lib/utils";

const TYPE_META: Record<
  FeedItemType["type"],
  { icon: React.ElementType; label: string; color: string }
> = {
  new_opportunity: {
    icon: Briefcase,
    label: "New Opportunity",
    color: "text-primary bg-primary-subtle",
  },
  new_program: { icon: BookOpen, label: "New Program", color: "text-violet-600 bg-violet-50" },
  announcement: {
    icon: Megaphone,
    label: "Announcement",
    color: "text-warning-text bg-warning-subtle",
  },
  application_update: {
    icon: CheckCircle,
    label: "Application",
    color: "text-success-text bg-success-subtle",
  },
  partner_request: { icon: Handshake, label: "Partner Request", color: "text-sky-600 bg-sky-50" },
  referral: { icon: ArrowRightLeft, label: "Referral", color: "text-danger-text bg-danger-subtle" },
};

const TAG_LABELS: Record<string, string> = {
  yours: "For you",
  your_org: "Your org",
  partner: "Partner",
};

const TAG_COLORS: Record<string, string> = {
  yours: "bg-primary-subtle text-primary",
  your_org: "bg-success-subtle text-success-text",
  partner: "bg-sky-100 text-sky-700",
};

interface Props {
  item: FeedItemType;
}

export function FeedItem({ item }: Props) {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  return (
    <Link
      to={item.url}
      className="group flex gap-4 rounded-card border border-border bg-surface p-4 shadow-card transition hover:border-primary hover:shadow-dropdown"
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.color}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted uppercase tracking-wide">
            {meta.label}
          </span>
          {item.tag && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TAG_COLORS[item.tag]}`}
            >
              {TAG_LABELS[item.tag]}
            </span>
          )}
          <span className="ml-auto text-xs text-muted">{formatDate(item.created_at)}</span>
        </div>

        <h3 className="mt-0.5 text-sm font-semibold text-heading group-hover:text-primary leading-snug">
          {item.title}
        </h3>

        {item.body && <p className="mt-0.5 text-sm text-secondary line-clamp-2">{item.body}</p>}

        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
          <Building2 className="h-3 w-3" />
          <span>{item.org_name}</span>
        </div>
      </div>
    </Link>
  );
}
