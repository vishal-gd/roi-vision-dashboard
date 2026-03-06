import { motion } from "framer-motion";
import { BundleName, bundleColors, costFeatureConfigs, getFeatureTotal, CloudAccount } from "@/data/cloudAccounts";
import { ROICosts } from "./ROICostInput";
import { Box, DollarSign, Shield, Cloud, ChevronRight } from "lucide-react";

const bundleIcons: Record<BundleName, React.ReactNode> = {
  Core: <Box className="h-5 w-5" />,
  FinOps: <DollarSign className="h-5 w-5" />,
  CloudOps: <Cloud className="h-5 w-5" />,
  SecOps: <Shield className="h-5 w-5" />,
};

const bundleAccentColors: Record<BundleName, string> = {
  Core: "#3b82f6",
  FinOps: "#22c55e",
  CloudOps: "#f59e0b",
  SecOps: "#a855f7",
};

interface BundleCardProps {
  bundle: BundleName;
  costs: ROICosts;
  onClick: () => void;
  index: number;
  filteredAccounts: CloudAccount[];
}

export function BundleCard({ bundle, costs, onClick, index, filteredAccounts }: BundleCardProps) {
  const features = costFeatureConfigs.filter((f) => f.bundle === bundle);
  if (features.length === 0) return null;

  const totalCost = features.reduce((s, f) => {
    const count = getFeatureTotal(f.key, filteredAccounts);
    return s + count * (costs[f.key] || 0);
  }, 0);
  const totalCount = features.reduce((s, f) => s + getFeatureTotal(f.key, filteredAccounts), 0);
  const accent = bundleAccentColors[bundle];
  const colorClass = bundleColors[bundle];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="glass-card rounded-xl p-5 cursor-pointer hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
    >
      {/* Accent top border */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl" style={{ background: accent }} />

      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg`} style={{ background: accent + "15", color: accent }}>
          {bundleIcons[bundle]}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <h3 className="text-base font-bold mb-0.5">{bundle}</h3>
      <p className="text-2xl font-mono font-bold gradient-text mb-0.5">${totalCost.toLocaleString()}</p>
      <p className="text-[11px] text-muted-foreground mb-3">{features.length} features · {totalCount.toLocaleString()} instances</p>
      <div className="space-y-1.5">
        {features.slice(0, 4).map((f) => {
          const count = getFeatureTotal(f.key, filteredAccounts);
          const unitCost = costs[f.key] || 0;
          return (
            <div key={f.key} className="flex justify-between text-[11px] items-center">
              <span className="text-muted-foreground truncate mr-2">{f.label}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono px-1.5 py-0.5 rounded bg-secondary/60 text-[10px]">{count.toLocaleString()}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono font-semibold text-[11px]">${(count * unitCost).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
        {features.length > 4 && (
          <p className="text-[10px] text-muted-foreground">+{features.length - 4} more</p>
        )}
      </div>
    </motion.div>
  );
}
