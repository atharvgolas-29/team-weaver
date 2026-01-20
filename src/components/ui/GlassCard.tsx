import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const GlassCard = ({
  children,
  className,
  hover = true,
  gradient = false,
  ...props
}: GlassCardProps) => {
  if (gradient) {
    return (
      <motion.div className="gradient-border" {...props}>
        <div className={cn("gradient-border-inner p-6", className)}>
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(hover ? "glass-card-hover" : "glass-card", "p-6", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
