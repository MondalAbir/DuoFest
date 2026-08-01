import { trustedColleges } from "@/data/landing/colleges";

export function CollegeMarquee() {
  const row = [...trustedColleges, ...trustedColleges];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div className="flex w-max items-center gap-4 animate-marquee">
        {row.map((college, index) => (
          <div
            key={`${college.name}-${index}`}
            className="flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3.5 shadow-card"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ backgroundColor: college.color }}
            >
              {college.short}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">
                {college.name}
              </p>
              <p className="text-xs text-muted-foreground">{college.city}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
