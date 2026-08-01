import type { Testimonial } from "@/types/landing";
import { UserAvatar } from "@/components/common/UserAvatar";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex gap-1 text-warning" aria-label="5 out of 5 stars">
        {"★★★★★".split("").map((star, index) => (
          <span key={index} className="text-sm">
            {star}
          </span>
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
        "{testimonial.quote}"
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <UserAvatar
          name={testimonial.name}
          color={testimonial.avatarColor}
          size="md"
        />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">
            {testimonial.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {testimonial.role} · {testimonial.college}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
