import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { CloudAccount, FeatureConfig } from "@/data/cloudAccounts";
import { ROICosts } from "./ROICostInput";
import { ReportDownload } from "./ReportDownload";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6"];

interface FeatureDrilldownProps {
  feature: FeatureConfig;
  costs: ROICosts;
  filteredAccounts: CloudAccount[];
  onClose: () => void;
}

export function FeatureDrilldown({ feature, costs, filteredAccounts, onClose }: FeatureDrilldownProps) {
  const unitCost = costs[feature.key] || 0;

  // Account-level breakdown
  const accountData = filteredAccounts
    .map((a) => ({
      tenant: a.tenantName,
      account: a.cloudAccountName,
      count: Number(a[feature.key]) || 0,
      cost: (Number(a[feature.key]) || 0) * unitCost,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  // Tenant-level aggregation for pie chart
  const tenantMap = new Map<string, number>();
  accountData.forEach((d) => {
    tenantMap.set(d.tenant, (tenantMap.get(d.tenant) || 0) + d.count);
  });
  const tenantData = Array.from(tenantMap.entries())
    .map(([name, value]) => ({ name, value, cost: value * unitCost }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const totalCount = accountData.reduce((s, d) => s + d.count, 0);
  const totalCost = totalCount * unitCost;

  const reportHeaders = ["Tenant", "Cloud Account", "Count", "Cost ($)"];
  const reportRows = accountData.map((d) => [d.tenant, d.account, d.count, d.cost]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold">{feature.label} Drilldown</h2>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        </div>
        <ReportDownload
          title={`${feature.label} Report`}
          headers={reportHeaders}
          rows={reportRows}
          filename={`${feature.label.toLowerCase().replace(/\s+/g, "-")}-report`}
        />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg bg-secondary/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Count</p>
          <p className="text-2xl font-mono font-bold">{totalCount.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">Unit Cost</p>
          <p className="text-2xl font-mono font-bold">${unitCost}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">Projected Cost</p>
          <p className="text-2xl font-mono font-bold gradient-text">${totalCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart - top accounts */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Top Accounts by Count</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accountData.slice(0, 10)} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                <XAxis
                  dataKey="account"
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "cost") return [`$${value.toLocaleString()}`, "Cost"];
                    return [value.toLocaleString(), "Count"];
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#3b82f6" opacity={0.85} name="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart - tenant distribution */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Distribution by Tenant</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tenantData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name.slice(0, 12)}${name.length > 12 ? "…" : ""} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                >
                  {tenantData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [value.toLocaleString(), "Count"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Account detail table */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Account Details ({accountData.length} accounts)</h3>
        <div className="overflow-auto max-h-[300px] rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary sticky top-0">
              <tr>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Tenant</th>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Cloud Account</th>
                <th className="text-right p-2 text-xs font-medium text-muted-foreground">Count</th>
                <th className="text-right p-2 text-xs font-medium text-muted-foreground">Cost</th>
              </tr>
            </thead>
            <tbody>
              {accountData.map((d, i) => (
                <tr key={i} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="p-2 truncate max-w-[150px]">{d.tenant}</td>
                  <td className="p-2 truncate max-w-[200px] text-muted-foreground">{d.account}</td>
                  <td className="p-2 text-right font-mono">{d.count.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono font-semibold">${d.cost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
