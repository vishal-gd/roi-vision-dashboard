import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ROICostInput, ROICosts } from "@/components/dashboard/ROICostInput";
import { BundleCard } from "@/components/dashboard/BundleCard";
import { FeatureDetailPanel } from "@/components/dashboard/FeatureDetailPanel";
import { DashboardFilters, FilterState, filterAccounts } from "@/components/dashboard/DashboardFilters";
import { AccountGovernance } from "@/components/dashboard/AccountGovernance";
import { ReportDownload } from "@/components/dashboard/ReportDownload";
import { BundleName, costFeatureConfigs, getFeatureTotal } from "@/data/cloudAccounts";
import { BarChart3, TrendingUp } from "lucide-react";

const bundleOrder: BundleName[] = ["FinOps", "CloudOps", "SecOps"];

const Index = () => {
  const defaultCosts: ROICosts = {};
  costFeatureConfigs.forEach(f => { defaultCosts[f.key] = 10; });
  const [costs, setCosts] = useState<ROICosts>(defaultCosts);
  const [selectedBundle, setSelectedBundle] = useState<BundleName | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    environment: "all",
    accountMaster: "all",
    month: "all",
  });

  const filteredAccounts = useMemo(() => filterAccounts(filters), [filters]);

  const totalROI = useMemo(() => {
    return costFeatureConfigs.reduce((sum, f) => {
      const count = getFeatureTotal(f.key, filteredAccounts);
      return sum + count * (costs[f.key] || 0);
    }, 0);
  }, [costs, filteredAccounts]);

  const totalFeatureCount = useMemo(() => {
    return costFeatureConfigs.reduce((sum, f) => sum + getFeatureTotal(f.key, filteredAccounts), 0);
  }, [filteredAccounts]);

  const overallReportHeaders = ["Bundle", "Feature", "Count", "Unit Cost ($)", "Projected Cost ($)"];
  const overallReportRows = costFeatureConfigs.map((f) => {
    const count = getFeatureTotal(f.key, filteredAccounts);
    const unitCost = costs[f.key] || 0;
    return [f.bundle, f.label, count, unitCost, count * unitCost];
  });
  const overallSummary = [
    { label: "Total Features", value: String(costFeatureConfigs.length) },
    { label: "Total Instances", value: totalFeatureCount.toLocaleString() },
    { label: "Projected Cost", value: `$${totalROI.toLocaleString()}` },
  ];

  return (
    <div className="min-h-screen bg-background dark">
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
        <DashboardFilters filters={filters} onChange={setFilters} />

        {/* Account Governance & Inventory Details */}
        <AccountGovernance filteredAccounts={filteredAccounts} />

        {/* Cost Projection Overview */}
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
            <div className="flex items-center gap-2">
              <ReportDownload
                title="Cost Projection Overview"
                subtitle="Synoptek · Complete Cost Projection Analysis"
                headers={overallReportHeaders}
                rows={overallReportRows}
                summaryRows={overallSummary}
                filename="cost-projection-overview"
              />
              {totalROI > 0 && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Projected Cost</p>
                  <p className="text-3xl font-mono font-bold gradient-text">${totalROI.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bundle Cards */}
        {!selectedBundle ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {bundleOrder.map((bundle, i) => (
              <BundleCard
                key={bundle}
                bundle={bundle}
                costs={costs}
                onClick={() => setSelectedBundle(bundle)}
                index={i}
                filteredAccounts={filteredAccounts}
              />
            ))}
          </div>
        ) : (
          <FeatureDetailPanel
            bundle={selectedBundle}
            costs={costs}
            onClose={() => setSelectedBundle(null)}
            filteredAccounts={filteredAccounts}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
