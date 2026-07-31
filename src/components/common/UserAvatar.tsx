import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/utils/format";
import { cn } from "@/utils/cn";

interface UserAvatarProps {
  name: string;
  color: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function UserAvatar({
  name,
  color,
  className,
  size = "md",
}: UserAvatarProps) {
  return (
    <Avatar className={cn(SIZES[size], className)}>
      <AvatarFallback style={{ backgroundColor: color }}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
