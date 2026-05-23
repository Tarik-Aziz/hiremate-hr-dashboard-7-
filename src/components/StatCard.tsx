import { TrendingUp, TrendingDown } from "lucide-react";
import { StatCardProps } from "../types";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export function StatCard({ title, value, label, growth, icon, iconBgColor, iconColor }: StatCardProps) {
  const isPositive = growth > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-2xl border border-gray-50 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          <p className="text-xs text-gray-400 mt-1">{label}</p>
        </div>
        <div className={cn("p-2 rounded-xl", iconBgColor)}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-rose-500" />
        )}
        <span className={cn("text-sm font-semibold", isPositive ? "text-emerald-500" : "text-rose-500")}>
          {isPositive ? "+" : ""}{growth}%
        </span>
      </div>
    </motion.div>
  );
}
