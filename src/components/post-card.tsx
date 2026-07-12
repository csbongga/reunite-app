import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  relativeTime,
} from "@/lib/mock-data";
import { StatusBadge, TypeBadge } from "./badges";

export function PostCard({ post }: { post: any }) {
  const authorName = post.author?.display_name || "ผู้ใช้งาน";
  const authorInitials = authorName.charAt(0).toUpperCase();
  return (
    <Link
      href={"/post/" + post.id}
      className="block bg-surface rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-card)] hover:border-primary/40 hover:-translate-y-0.5 transition"
    >
      <div className="flex gap-3 p-3">
        <div
          className="size-20 shrink-0 rounded-xl flex items-center justify-center text-4xl overflow-hidden bg-surface"
          style={{
            background: post.imageUrl ? 'none' : `oklch(0.94 0.05 ${post.imageHue})`,
          }}
          aria-hidden
        >
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            post.image
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
          </div>
          <h3 className="mt-1.5 font-semibold text-[15px] text-foreground line-clamp-1">
            {post.title}
          </h3>
          <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">
            {CATEGORY_EMOJI[post.category as keyof typeof CATEGORY_EMOJI]} {CATEGORY_LABEL[post.category as keyof typeof CATEGORY_LABEL]}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11.5px] text-muted-foreground">
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{post.location}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="size-3" />
              {relativeTime(post.postedAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="px-3 pb-3 flex items-center justify-between text-[11.5px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-5 rounded-full bg-primary-soft text-primary font-semibold text-[10px] flex items-center justify-center">
            {authorInitials}
          </span>
          {authorName}
        </span>
        <span>{post.distanceKm.toFixed(1)} กม.</span>
      </div>
    </Link>
  );
}
