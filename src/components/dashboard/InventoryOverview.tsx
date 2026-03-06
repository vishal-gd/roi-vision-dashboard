import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CloudAccount } from "@/data/cloudAccounts";
import { Package, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportDownload } from "./ReportDownload";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface InventoryOverviewProps {
  filteredAccounts: CloudAccount[];
}

// Derive resource type from cloud account name
function deriveResourceType(accountName: string): string {
  const lower = accountName.toLowerCase();
  if (lower.includes("aws")) return "AWS";
  if (lower.includes("azure") || lower.includes("azureplan") || lower.includes("azurea") || lower.includes("_az")) return "Azure";
  if (lower.includes("gcp") || lower.includes("google")) return "GCP";
  if (lower.includes("prod")) return "Production";
  if (lower.includes("dev")) return "Development";
  if (lower.includes("hub")) return "Hub";
  return "Other";
}

export function InventoryOverview({ filteredAccounts }: InventoryOverviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [resourceFilter, setResourceFilter] = useState("all");

  const resourceTypes = useMemo(() => {
    const types = new Set(filteredAccounts.map((a) => deriveResourceType(a.cloudAccountName)));
    return Array.from(types).sort();
  }, [filteredAccounts]);

  const displayAccounts = useMemo(() => {
    let accounts = filteredAccounts.filter((a) => a.inventoryCount > 0);
    if (resourceFilter !== "all") {
      accounts = accounts.filter((a) => deriveResourceType(a.cloudAccountName) === resourceFilter);
    }
    return accounts.sort((a, b) => b.inventoryCount - a.inventoryCount);
  }, [filteredAccounts, resourceFilter]);

  const totalInventory = displayAccounts.reduce((s, a) => s + a.inventoryCount, 0);
  const accountsWithInventory = displayAccounts.length;

  // Chart data - top 10
  const chartData = displayAccounts.slice(0, 10).map((a) => ({
    name: a.cloudAccountName.length > 20 ? a.cloudAccountName.slice(0, 18) + "…" : a.cloudAccountName,
    count: a.inventoryCount,
  }));

  const reportHeaders = ["Tenant", "Cloud Account", "Resource Type", "Inventory Count"];
  const reportRows = displayAccounts.map((a) => [
    a.tenantName,
    a.cloudAccountName,
    deriveResourceType(a.cloudAccountName),
    a.inventoryCount,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5"
    >
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold">Inventory</h2>
          <p className="text-xs text-muted-foreground">
            {totalInventory.toLocaleString()} total resources · {accountsWithInventory} accounts
          </p>
        </div>
        <div className="text-right mr-3">
          <p className="text-3xl font-mono font-bold gradient-text">{totalInventory.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Resources</p>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-5 space-y-4"
        >
          {/* Filters and report */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[160px] h-8 bg-secondary border-border text-xs">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {resourceTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ReportDownload
              title="Inventory Report"
              headers={reportHeaders}
              rows={reportRows}
              filename="inventory-report"
            />
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    angle={-30}
                    textAnchor="end"
                    height={55}
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
                    formatter={(value: number) => [value.toLocaleString(), "Inventory"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          <div className="overflow-auto max-h-[300px] rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary sticky top-0">
                <tr>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Tenant</th>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Cloud Account</th>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-right p-2 text-xs font-medium text-muted-foreground">Count</th>
                </tr>
              </thead>
              <tbody>
                {displayAccounts.map((a, i) => (
                  <tr key={i} className="border-t border-border/50 hover:bg-secondary/30">
                    <td className="p-2 truncate max-w-[150px]">{a.tenantName}</td>
                    <td className="p-2 truncate max-w-[200px] text-muted-foreground">{a.cloudAccountName}</td>
                    <td className="p-2 text-xs">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {deriveResourceType(a.cloudAccountName)}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono">{a.inventoryCount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
