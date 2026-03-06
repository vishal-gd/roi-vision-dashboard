import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CloudAccount } from "@/data/cloudAccounts";
import { Package, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportDownload } from "./ReportDownload";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface InventoryOverviewProps {
  filteredAccounts: CloudAccount[];
}

const CLOUD_TYPES = ["AWS", "Azure", "GCP", "OCI"] as const;
const CLOUD_COLORS: Record<string, string> = {
  AWS: "#f59e0b",
  Azure: "#3b82f6",
  GCP: "#22c55e",
  OCI: "#ef4444",
  Other: "#6b7280",
};

// Derive cloud provider only
function deriveCloudType(accountName: string): string {
  const lower = accountName.toLowerCase();
  if (lower.includes("aws") || lower.match(/\d{12}/)) return "AWS";
  if (lower.includes("azure") || lower.includes("azureplan") || lower.includes("azureea") || lower.includes("_az") || lower.includes("csp") || lower.includes("sub-")) return "Azure";
  if (lower.includes("gcp") || lower.includes("google")) return "GCP";
  if (lower.includes("oci") || lower.includes("oracle")) return "OCI";
  return "Other";
}

// Simulated product categories for drilldown
function deriveProductCategories(account: CloudAccount): { category: string; count: number }[] {
  const inv = account.inventoryCount;
  if (inv === 0) return [];
  const cloud = deriveCloudType(account.cloudAccountName);
  
  if (cloud === "AWS") {
    return [
      { category: "EC2 Instances", count: Math.round(inv * 0.3) },
      { category: "S3 Buckets", count: Math.round(inv * 0.15) },
      { category: "RDS Databases", count: Math.round(inv * 0.1) },
      { category: "Lambda Functions", count: Math.round(inv * 0.12) },
      { category: "VPC Resources", count: Math.round(inv * 0.08) },
      { category: "IAM Resources", count: Math.round(inv * 0.1) },
      { category: "Other", count: Math.round(inv * 0.15) },
    ].filter((c) => c.count > 0);
  }
  if (cloud === "Azure") {
    return [
      { category: "Virtual Machines", count: Math.round(inv * 0.25) },
      { category: "Storage Accounts", count: Math.round(inv * 0.15) },
      { category: "SQL Databases", count: Math.round(inv * 0.08) },
      { category: "App Services", count: Math.round(inv * 0.12) },
      { category: "Network Resources", count: Math.round(inv * 0.14) },
      { category: "Key Vaults", count: Math.round(inv * 0.06) },
      { category: "Other", count: Math.round(inv * 0.2) },
    ].filter((c) => c.count > 0);
  }
  return [
    { category: "Compute", count: Math.round(inv * 0.35) },
    { category: "Storage", count: Math.round(inv * 0.2) },
    { category: "Networking", count: Math.round(inv * 0.15) },
    { category: "Database", count: Math.round(inv * 0.1) },
    { category: "Other", count: Math.round(inv * 0.2) },
  ].filter((c) => c.count > 0);
}

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#ec4899"];

export function InventoryOverview({ filteredAccounts }: InventoryOverviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [cloudFilter, setCloudFilter] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState<CloudAccount | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const cloudTypes = useMemo(() => {
    const types = new Set(filteredAccounts.map((a) => deriveCloudType(a.cloudAccountName)));
    return Array.from(types).sort();
  }, [filteredAccounts]);

  const displayAccounts = useMemo(() => {
    let accounts = filteredAccounts.filter((a) => a.inventoryCount > 0);
    if (cloudFilter !== "all") {
      accounts = accounts.filter((a) => deriveCloudType(a.cloudAccountName) === cloudFilter);
    }
    return accounts.sort((a, b) => b.inventoryCount - a.inventoryCount);
  }, [filteredAccounts, cloudFilter]);

  const totalInventory = displayAccounts.reduce((s, a) => s + a.inventoryCount, 0);
  const accountsWithInventory = displayAccounts.length;

  // Cloud distribution for pie chart
  const cloudDistribution = useMemo(() => {
    const map = new Map<string, number>();
    displayAccounts.forEach((a) => {
      const type = deriveCloudType(a.cloudAccountName);
      map.set(type, (map.get(type) || 0) + a.inventoryCount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [displayAccounts]);

  const chartData = displayAccounts.slice(0, 10).map((a) => ({
    name: a.cloudAccountName.length > 20 ? a.cloudAccountName.slice(0, 18) + "…" : a.cloudAccountName,
    count: a.inventoryCount,
    fill: CLOUD_COLORS[deriveCloudType(a.cloudAccountName)] || "#6b7280",
  }));

  const reportHeaders = ["Tenant", "Cloud Account", "Cloud Provider", "Inventory Count"];
  const reportRows = displayAccounts.map((a) => [
    a.tenantName, a.cloudAccountName, deriveCloudType(a.cloudAccountName), a.inventoryCount,
  ]);

  // Drilldown view
  if (selectedAccount) {
    const categories = deriveProductCategories(selectedAccount);
    const filteredCategories = categoryFilter === "all"
      ? categories
      : categories.filter((c) => c.category === categoryFilter);
    const drilldownTotal = filteredCategories.reduce((s, c) => s + c.count, 0);
    const cloud = deriveCloudType(selectedAccount.cloudAccountName);

    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelectedAccount(null); setCategoryFilter("all"); }} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold">Resource Details</h2>
              <p className="text-sm text-muted-foreground">
                {selectedAccount.tenantName} · {selectedAccount.cloudAccountName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: CLOUD_COLORS[cloud] + "20", color: CLOUD_COLORS[cloud] }}>
              {cloud}
            </span>
            <ReportDownload
              title={`Resource Details - ${selectedAccount.cloudAccountName}`}
              subtitle={`${selectedAccount.tenantName} · ${cloud}`}
              headers={["Product Category", "Resource Count", "% of Total"]}
              rows={filteredCategories.map((c) => [c.category, c.count, ((c.count / selectedAccount.inventoryCount) * 100).toFixed(1) + "%"])}
              filename={`resource-details-${selectedAccount.tenantName.toLowerCase().replace(/\s+/g, "-")}`}
              summaryRows={[
                { label: "Cloud Provider", value: cloud },
                { label: "Total Resources", value: selectedAccount.inventoryCount.toLocaleString() },
                { label: "Categories", value: String(categories.length) },
              ]}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Resources</p>
            <p className="text-2xl font-mono font-bold">{selectedAccount.inventoryCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Cloud Provider</p>
            <p className="text-2xl font-bold" style={{ color: CLOUD_COLORS[cloud] }}>{cloud}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Product Categories</p>
            <p className="text-2xl font-mono font-bold">{categories.length}</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] h-8 bg-secondary border-border text-xs">
              <SelectValue placeholder="Product Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Resources by Category</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredCategories} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number) => [value.toLocaleString(), "Resources"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={CLOUD_COLORS[cloud]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Category Distribution</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={filteredCategories} cx="50%" cy="50%" outerRadius={85} dataKey="count"
                    label={({ category, percent }) => `${category.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "hsl(var(--muted-foreground))" }}>
                    {filteredCategories.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number) => [value.toLocaleString(), "Resources"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category table */}
        <div className="overflow-auto max-h-[250px] rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary sticky top-0">
              <tr>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Product Category</th>
                <th className="text-right p-2 text-xs font-medium text-muted-foreground">Count</th>
                <th className="text-right p-2 text-xs font-medium text-muted-foreground">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((c, i) => (
                <tr key={i} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="p-2 font-medium">{c.category}</td>
                  <td className="p-2 text-right font-mono">{c.count.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono text-muted-foreground">
                    {((c.count / selectedAccount.inventoryCount) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
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
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-5 space-y-4">
          {/* Filters and report */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={cloudFilter} onValueChange={setCloudFilter}>
              <SelectTrigger className="w-[160px] h-8 bg-secondary border-border text-xs">
                <SelectValue placeholder="Cloud Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {cloudTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: CLOUD_COLORS[t] }} />
                      {t}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ReportDownload
              title="Inventory Report"
              subtitle="Cloud Resource Inventory Overview"
              headers={reportHeaders}
              rows={reportRows}
              filename="inventory-report"
              summaryRows={[
                { label: "Total Resources", value: totalInventory.toLocaleString() },
                { label: "Accounts", value: String(accountsWithInventory) },
                { label: "Cloud Providers", value: String(cloudTypes.length) },
              ]}
            />
          </div>

          {/* Charts side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar chart */}
            {chartData.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Top Accounts</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" height={55} interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(value: number) => [value.toLocaleString(), "Inventory"]} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} opacity={0.85}>
                        {chartData.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            {/* Cloud distribution pie */}
            {cloudDistribution.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Cloud Distribution</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={cloudDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "hsl(var(--muted-foreground))" }}>
                        {cloudDistribution.map((d, i) => (
                          <Cell key={i} fill={CLOUD_COLORS[d.name] || "#6b7280"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(value: number) => [value.toLocaleString(), "Resources"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Table - clickable rows */}
          <div className="overflow-auto max-h-[300px] rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary sticky top-0">
                <tr>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Tenant</th>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Cloud Account</th>
                  <th className="text-left p-2 text-xs font-medium text-muted-foreground">Provider</th>
                  <th className="text-right p-2 text-xs font-medium text-muted-foreground">Count</th>
                </tr>
              </thead>
              <tbody>
                {displayAccounts.map((a, i) => {
                  const cloud = deriveCloudType(a.cloudAccountName);
                  return (
                    <tr key={i} className="border-t border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedAccount(a)}>
                      <td className="p-2 truncate max-w-[150px]">{a.tenantName}</td>
                      <td className="p-2 truncate max-w-[200px] text-muted-foreground">{a.cloudAccountName}</td>
                      <td className="p-2 text-xs">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: CLOUD_COLORS[cloud] + "20", color: CLOUD_COLORS[cloud] }}>
                          {cloud}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono">{a.inventoryCount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center">Click any row to drill down into resource details</p>
        </motion.div>
      )}
    </motion.div>
  );
}
