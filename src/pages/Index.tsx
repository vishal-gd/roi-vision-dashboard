import { useState } from "react";
import { motion } from "framer-motion";
import { ROICostInput, ROICosts } from "@/components/dashboard/ROICostInput";
import { BundleCard } from "@/components/dashboard/BundleCard";
import { FeatureDetailPanel } from "@/components/dashboard/FeatureDetailPanel";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { BundleName, getBundleTotals, featureConfigs } from "@/data/cloudAccounts";
import { BarChart3, TrendingUp } from "lucide-react";

const bundleOrder: BundleName[] = ["Core", "FinOps", "CloudOps", "SecOps"];

const Index = () => {
  const defaultCosts: ROICosts = {};
  featureConfigs.forEach(f => { defaultCosts[f.key] = 10; });
  const [costs, setCosts] = useState<ROICosts>(defaultCosts);
  const [selectedBundle, setSelectedBundle] = useState<BundleName | null>(null);

  const totalROI = Object.values(costs).reduce((s, v) => s + v, 0);
  const bundleTotals = getBundleTotals();
  const totalFeatureCount = Object.values(bundleTotals).reduce((s, v) => s + v, 0);

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Cloud ROI Dashboard</h1>
              <p className="text-xs text-muted-foreground">Synoptek · Cost Projection Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {totalROI > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-sm font-mono font-semibold">${totalROI.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">Total ROI</span>
              </motion.div>
            )}
            <ROICostInput costs={costs} onSave={setCosts} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Summary Stats */}
        <StatsOverview />

        {/* Cost Overview Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Cost Projection Overview</h2>
              <p className="text-sm text-muted-foreground">
                {totalFeatureCount.toLocaleString()} total feature instances across {bundleOrder.length} bundles.
                Click any bundle to view detailed breakdown.
              </p>
            </div>
            {totalROI > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Investment</p>
                <p className="text-3xl font-mono font-bold gradient-text">${totalROI.toLocaleString()}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bundle Cards */}
        {!selectedBundle ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bundleOrder.map((bundle, i) => (
              <BundleCard
                key={bundle}
                bundle={bundle}
                costs={costs}
                onClick={() => setSelectedBundle(bundle)}
                index={i}
              />
            ))}
          </div>
        ) : (
          <FeatureDetailPanel
            bundle={selectedBundle}
            costs={costs}
            onClose={() => setSelectedBundle(null)}
          />
        )}

      </main>
    </div>
  );
};

export default Index;
