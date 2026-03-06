import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";
import { BundleName, costFeatureConfigs, getFeatureTotal, CloudAccount, FeatureConfig } from "@/data/cloudAccounts";
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
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold">{bundle} Bundle Details</h2>
              <p className="text-sm text-muted-foreground">
                {features.length} features · Click any feature to drill down
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
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
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-25} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                formatter={(value: number, name: string) => {
                  if (name === "cost") return [`$${value.toLocaleString()}`, "Projected Cost"];
                  return [value.toLocaleString(), "Count"];
                }}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]} fill={chartColor} opacity={0.85} name="cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature cards - improved layout */}
        <div className="space-y-2">
          {features.map((feature, i) => {
            const total = getFeatureTotal(feature.key, filteredAccounts);
            const unitCost = costs[feature.key] || 0;
            const projectedCost = total * unitCost;
            const maxCost = Math.max(...chartData.map(d => d.cost), 1);
            const barWidth = (projectedCost / maxCost) * 100;

            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative rounded-lg bg-secondary/40 hover:bg-secondary/60 cursor-pointer transition-all overflow-hidden group"
                onClick={() => setDrilldownFeature(feature)}
              >
                {/* Progress bar bg */}
                <div
                  className="absolute inset-y-0 left-0 opacity-[0.07] transition-all"
                  style={{ width: `${barWidth}%`, background: chartColor }}
                />

                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="font-semibold text-sm">{feature.label}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{feature.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Count pill */}
                      <div className="px-3 py-1.5 rounded-lg bg-secondary/80 text-center min-w-[70px]">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Count</p>
                        <p className="text-base font-mono font-bold leading-none">{total.toLocaleString()}</p>
                      </div>
                      <span className="text-muted-foreground text-xs mx-1">×</span>
                      {/* Unit cost pill */}
                      <div className="px-3 py-1.5 rounded-lg bg-secondary/80 text-center min-w-[60px]">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Unit $</p>
                        <p className="text-base font-mono font-bold leading-none">${unitCost}</p>
                      </div>
                      <span className="text-muted-foreground text-xs mx-1">=</span>
                      {/* Projected cost pill */}
                      <div className="px-3 py-1.5 rounded-lg text-center min-w-[90px]" style={{ background: chartColor + "15" }}>
                        <p className="text-[9px] uppercase tracking-wider leading-none mb-0.5" style={{ color: chartColor }}>Projected</p>
                        <p className="text-base font-mono font-bold leading-none gradient-text">${projectedCost.toLocaleString()}</p>
                      </div>
                      <ChevronIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground ml-2 transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
