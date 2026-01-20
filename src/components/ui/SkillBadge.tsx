import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  skill: string;
  level?: "expert" | "good" | "basic";
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const levelColors = {
  expert: "border-primary/50 bg-primary/10 text-primary",
  good: "border-accent/50 bg-accent/10 text-accent",
  basic: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
};

export const SkillBadge = ({
  skill,
  level = "basic",
  removable = false,
  onRemove,
  className,
}: SkillBadgeProps) => {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
        levelColors[level],
        className
      )}
    >
      {skill}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 w-4 h-4 rounded-full bg-current/20 flex items-center justify-center hover:bg-current/30 transition-colors"
        >
          <span className="text-xs">×</span>
        </button>
      )}
    </motion.span>
  );
};

export default SkillBadge;
