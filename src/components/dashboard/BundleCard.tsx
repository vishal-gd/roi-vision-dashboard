import { motion } from "framer-motion";
import { BundleName, bundleColors, costFeatureConfigs, getFeatureTotal, CloudAccount } from "@/data/cloudAccounts";
import { ROICosts } from "./ROICostInput";
import { Box, DollarSign, Shield, Cloud, BarChart3 } from "lucide-react";

const bundleIcons: Record<BundleName, React.ReactNode> = {
  Core: <Box className="h-5 w-5" />,
  FinOps: <DollarSign className="h-5 w-5" />,
  CloudOps: <Cloud className="h-5 w-5" />,
  SecOps: <Shield className="h-5 w-5" />,
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
    const unitCost = costs[f.key] || 0;
    return s + count * unitCost;
  }, 0);
  const totalCount = features.reduce((s, f) => s + getFeatureTotal(f.key, filteredAccounts), 0);
  const colorClass = bundleColors[bundle];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="glass-card rounded-xl p-5 cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg bg-${colorClass}/10 text-${colorClass}`}>
          {bundleIcons[bundle]}
        </div>
        <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <h3 className="text-lg font-bold mb-1">{bundle}</h3>
      <p className="text-3xl font-mono font-bold mb-1 gradient-text">${totalCost.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground mb-3">{features.length} features · {totalCount.toLocaleString()} instances</p>
      <div className="mt-3 space-y-1.5">
        {features.slice(0, 3).map((f) => {
          const count = getFeatureTotal(f.key, filteredAccounts);
          const unitCost = costs[f.key] || 0;
          return (
            <div key={f.key} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="font-mono font-medium">${(count * unitCost).toLocaleString()}</span>
            </div>
          );
        })}
        {features.length > 3 && (
          <p className="text-xs text-muted-foreground">+{features.length - 3} more</p>
        )}
      </div>
    </motion.div>
  );
}
