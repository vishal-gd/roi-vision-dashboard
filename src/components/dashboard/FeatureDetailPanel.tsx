import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Users, ArrowLeft } from "lucide-react";
import { BundleName, costFeatureConfigs, getFeatureTotal, getTopTenantsByFeature, CloudAccount, FeatureConfig } from "@/data/cloudAccounts";
import { ROICosts } from "./ROICostInput";
import { ReportDownload } from "./ReportDownload";
import { FeatureDrilldown } from "./FeatureDrilldown";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const bundleChartColors: Record<BundleName, string> = {
  Core: "#3b82f6",
  FinOps: "#22c55e",
  CloudOps: "#f59e0b",
  SecOps: "#a855f7",
};

interface FeatureDetailPanelProps {
  bundle: BundleName;
  costs: ROICosts;
  onClose: () => void;
  filteredAccounts: CloudAccount[];
}

export function FeatureDetailPanel({ bundle, costs, onClose, filteredAccounts }: FeatureDetailPanelProps) {
  const [drilldownFeature, setDrilldownFeature] = useState<FeatureConfig | null>(null);
  const features = costFeatureConfigs.filter((f) => f.bundle === bundle);
  const chartColor = bundleChartColors[bundle];

  if (drilldownFeature) {
    return (
      <FeatureDrilldown
        feature={drilldownFeature}
        costs={costs}
        filteredAccounts={filteredAccounts}
        onClose={() => setDrilldownFeature(null)}
      />
    );
  }

  const chartData = features.map((f) => {
    const count = getFeatureTotal(f.key, filteredAccounts);
    const unitCost = costs[f.key] || 0;
    return { name: f.label, count, cost: count * unitCost };
  });

  const bundleTotal = chartData.reduce((s, d) => s + d.cost, 0);
  const bundleCount = chartData.reduce((s, d) => s + d.count, 0);
  const reportHeaders = ["Feature", "Count", "Unit Cost ($)", "Projected Cost ($)"];
  const reportRows = features.map((f) => {
    const count = getFeatureTotal(f.key, filteredAccounts);
    const unitCost = costs[f.key] || 0;
    return [f.label, count, unitCost, count * unitCost];
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold">{bundle} Bundle Details</h2>
              <p className="text-sm text-muted-foreground">
                {features.length} features · Click any feature to drill down
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ReportDownload
              title={`${bundle} Bundle Report`}
              subtitle={`Cost Projection Analysis · ${features.length} Features`}
              headers={reportHeaders}
              rows={reportRows}
              filename={`${bundle.toLowerCase()}-bundle-report`}
              summaryRows={[
                { label: "Total Features", value: String(features.length) },
                { label: "Total Count", value: bundleCount.toLocaleString() },
                { label: "Projected Cost", value: `$${bundleTotal.toLocaleString()}` },
              ]}
            />
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Cost projection chart */}
        <div className="mb-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => {
                  if (name === "cost") return [`$${value.toLocaleString()}`, "Cost Projection"];
                  return [value.toLocaleString(), "Count"];
                }}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]} fill={chartColor} opacity={0.85} name="cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature detail cards - clickable for drilldown */}
        <div className="space-y-2">
          {features.map((feature, i) => {
            const total = getFeatureTotal(feature.key, filteredAccounts);
            const unitCost = costs[feature.key] || 0;
            const projectedCost = total * unitCost;
            const topTenants = getTopTenantsByFeature(feature.key, 5, filteredAccounts);
            const accountsWithFeature = filteredAccounts.filter(
              (a) => Number(a[feature.key]) > 0
            ).length;

            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg bg-secondary/50 p-4 cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => setDrilldownFeature(feature)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{feature.label}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Count</p>
                        <p className="text-lg font-mono font-bold">{total.toLocaleString()}</p>
                      </div>
                      <div className="text-muted-foreground">×</div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unit Cost</p>
                        <p className="text-lg font-mono font-bold">${unitCost}</p>
                      </div>
                      <div className="text-muted-foreground">=</div>
                      <div>
                        <p className="text-xs text-muted-foreground">Projected</p>
                        <p className="text-lg font-mono font-bold gradient-text">${projectedCost.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {accountsWithFeature} accounts
                  </span>
                  {topTenants.length > 0 && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Top: {topTenants[0]?.name} ({topTenants[0]?.value.toLocaleString()})
                    </span>
                  )}
                  <span className="ml-auto text-primary text-xs">Click to drill down →</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
