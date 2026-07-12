import { STATUS_LABEL, type PostStatus, type PostType } from "@/lib/mock-data";

export function StatusBadge({ status }: { status: PostStatus }) {
  const styles: Record<PostStatus, string> = {
    searching: "bg-primary-soft text-primary",
    arranging: "bg-accent/30 text-accent-foreground",
    closed: "bg-muted text-muted-foreground line-through-none",
  };
  const dot: Record<PostStatus, string> = {
    searching: "bg-primary",
    arranging: "bg-accent",
    closed: "bg-muted-foreground",
  };
  return (
    <span className={`chip ${styles[status]} font-medium`}>
      <span className={`size-1.5 rounded-full ${dot[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function TypeBadge({ type }: { type: PostType }) {
  if (type === "lost") {
    return (
      <span className="chip bg-destructive/10 text-destructive font-semibold uppercase tracking-wide">
        ของหาย
      </span>
    );
  }
  return (
    <span className="chip bg-primary text-primary-foreground font-semibold uppercase tracking-wide">
      เจอของ
    </span>
  );
}
