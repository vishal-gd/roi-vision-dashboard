import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CloudAccount, TenantSummary, cloudAccounts, tenantSummaries } from "@/data/cloudAccounts";
import { ArrowLeft, Building2, Server, Shield, ChevronRight, Search, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportDownload } from "./ReportDownload";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AccountGovernanceProps {
  filteredAccounts: CloudAccount[];
}

const CLOUD_COLORS: Record<string, string> = {
  AWS: "#f59e0b",
  Azure: "#3b82f6",
  GCP: "#22c55e",
  OCI: "#ef4444",
  Other: "#6b7280",
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#ec4899"];

function deriveCloudType(accountName: string): string {
  const lower = accountName.toLowerCase();
  if (lower.includes("aws") || lower.match(/\d{12}/)) return "AWS";
  if (lower.includes("azure") || lower.includes("azureplan") || lower.includes("azureea") || lower.includes("_az") || lower.includes("csp") || lower.includes("sub-")) return "Azure";
  if (lower.includes("gcp") || lower.includes("google")) return "GCP";
  if (lower.includes("oci") || lower.includes("oracle")) return "OCI";
  return "Other";
}

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

type DrillLevel = "tenants" | "cloudAccounts" | "inventory" | "resourceDetail";

export function AccountGovernance({ filteredAccounts }: AccountGovernanceProps) {
  const [level, setLevel] = useState<DrillLevel>("tenants");
  const [selectedTenant, setSelectedTenant] = useState<TenantSummary | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<CloudAccount | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const totalAccounts = tenantSummaries.reduce((s, t) => s + t.totalCloudAccounts, 0);
  const totalActive = tenantSummaries.reduce((s, t) => s + t.active, 0);
  const totalInactive = tenantSummaries.reduce((s, t) => s + t.inactive, 0);
  const totalNotOnboarded = tenantSummaries.reduce((s, t) => s + t.notOnboarded, 0);
  const totalInventory = filteredAccounts.reduce((s, a) => s + a.inventoryCount, 0);

  // Tenant list filtered
  const filteredTenants = useMemo(() => {
    if (!searchTerm) return [...tenantSummaries].sort((a, b) => b.totalCloudAccounts - a.totalCloudAccounts);
    return tenantSummaries
      .filter((t) => t.tenantName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.totalCloudAccounts - a.totalCloudAccounts);
  }, [searchTerm]);

  // Cloud accounts for selected tenant
  const tenantCloudAccounts = useMemo(() => {
    if (!selectedTenant) return [];
    return filteredAccounts.filter((a) => a.tenantName === selectedTenant.tenantName);
  }, [selectedTenant, filteredAccounts]);

  // Status distribution data for pie chart
  const statusData = [
    { name: "Active", value: totalActive, fill: "#22c55e" },
    { name: "Inactive", value: totalInactive, fill: "#ef4444" },
    { name: "Not Onboarded", value: totalNotOnboarded, fill: "#f59e0b" },
  ].filter((d) => d.value > 0);

  // Top tenants bar chart
  const topTenants = [...tenantSummaries]
    .sort((a, b) => b.totalCloudAccounts - a.totalCloudAccounts)
    .slice(0, 8)
    .map((t) => ({ name: t.tenantName.length > 15 ? t.tenantName.slice(0, 13) + "…" : t.tenantName, accounts: t.totalCloudAccounts, active: t.active }));

  const goBack = () => {
    if (level === "resourceDetail") { setLevel("inventory"); setCategoryFilter("all"); }
    else if (level === "inventory") { setLevel("cloudAccounts"); setSelectedAccount(null); }
    else if (level === "cloudAccounts") { setLevel("tenants"); setSelectedTenant(null); }
  };

  // ===== RESOURCE DETAIL DRILLDOWN =====
  if (level === "resourceDetail" && selectedAccount) {
    const categories = deriveProductCategories(selectedAccount);
    const filtered = categoryFilter === "all" ? categories : categories.filter((c) => c.category === categoryFilter);
    const cloud = deriveCloudType(selectedAccount.cloudAccountName);

    return (
      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><ArrowLeft className="h-4 w-4" /></button>
            <div>
              <h2 className="text-lg font-bold">Resource Details</h2>
              <p className="text-xs text-muted-foreground">{selectedAccount.tenantName} · {selectedAccount.cloudAccountName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: CLOUD_COLORS[cloud] + "20", color: CLOUD_COLORS[cloud] }}>{cloud}</span>
            <ReportDownload
              title={`Resource Details - ${selectedAccount.cloudAccountName}`}
              subtitle={`${selectedAccount.tenantName} · ${cloud}`}
              headers={["Product Category", "Resource Count", "% of Total"]}
              rows={filtered.map((c) => [c.category, c.count, ((c.count / selectedAccount.inventoryCount) * 100).toFixed(1) + "%"])}
              filename={`resource-details-${selectedAccount.tenantName.toLowerCase().replace(/\s+/g, "-")}`}
              summaryRows={[
                { label: "Cloud Provider", value: cloud },
                { label: "Total Resources", value: selectedAccount.inventoryCount.toLocaleString() },
                { label: "Categories", value: String(categories.length) },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Resources</p>
            <p className="text-xl font-mono font-bold">{selectedAccount.inventoryCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Provider</p>
            <p className="text-xl font-bold" style={{ color: CLOUD_COLORS[cloud] }}>{cloud}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Categories</p>
            <p className="text-xl font-mono font-bold">{categories.length}</p>
          </div>
        </div>

        <div className="mb-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-7 bg-secondary border-border text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (<SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div>
            <h3 className="text-xs font-semibold mb-2">By Category</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filtered} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} angle={-20} textAnchor="end" height={45} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} formatter={(v: number) => [v.toLocaleString(), "Resources"]} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={CLOUD_COLORS[cloud]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold mb-2">Distribution</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={filtered} cx="50%" cy="50%" outerRadius={80} dataKey="count"
                    label={({ category, percent }) => `${category?.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "hsl(var(--muted-foreground))" }}>
                    {filtered.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} formatter={(v: number) => [v.toLocaleString(), "Resources"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[220px] rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary sticky top-0">
              <tr>
                <th className="text-left p-2 text-xs font-medium text-muted-foreground">Category</th>
                <th className="text-right p-2 text-xs font-medium text-muted-foreground">Count</th>
                <th className="text-right p-2 text-xs font-medium text-muted-foreground">%</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="p-2 font-medium">{c.category}</td>
                  <td className="p-2 text-right font-mono">{c.count.toLocaleString()}</td>
                  <td className="p-2 text-right font-mono text-muted-foreground">{((c.count / selectedAccount.inventoryCount) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }

  // ===== INVENTORY / CLOUD ACCOUNT DETAIL =====
  if (level === "inventory" && selectedAccount) {
    const cloud = deriveCloudType(selectedAccount.cloudAccountName);
    const categories = deriveProductCategories(selectedAccount);

    return (
      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><ArrowLeft className="h-4 w-4" /></button>
            <div>
              <h2 className="text-lg font-bold">{selectedAccount.cloudAccountName}</h2>
              <p className="text-xs text-muted-foreground">{selectedAccount.tenantName} · Inventory Overview</p>
            </div>
          </div>
          <ReportDownload
            title={`Inventory - ${selectedAccount.cloudAccountName}`}
            subtitle={`${selectedAccount.tenantName} · ${cloud}`}
            headers={["Category", "Count", "% of Total"]}
            rows={categories.map((c) => [c.category, c.count, ((c.count / selectedAccount.inventoryCount) * 100).toFixed(1) + "%"])}
            filename={`inventory-${selectedAccount.cloudAccountName.toLowerCase().replace(/\s+/g, "-")}`}
            summaryRows={[
              { label: "Provider", value: cloud },
              { label: "Total Resources", value: selectedAccount.inventoryCount.toLocaleString() },
              { label: "Status", value: selectedAccount.status },
            ]}
          />
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Resources</p>
            <p className="text-xl font-mono font-bold">{selectedAccount.inventoryCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Provider</p>
            <p className="text-lg font-bold" style={{ color: CLOUD_COLORS[cloud] }}>{cloud}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
            <Badge variant={selectedAccount.status === "active" ? "default" : "secondary"} className="text-[10px] mt-1">{selectedAccount.status}</Badge>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Categories</p>
            <p className="text-xl font-mono font-bold">{categories.length}</p>
          </div>
        </div>

        {/* Resource categories - clickable for further drill */}
        <h3 className="text-sm font-semibold mb-3">Product Categories</h3>
        <div className="space-y-1.5">
          {categories.map((c, i) => (
            <div
              key={i}
              onClick={() => { setLevel("resourceDetail"); }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 hover:bg-secondary/70 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{c.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm">{c.count.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{((c.count / selectedAccount.inventoryCount) * 100).toFixed(1)}%</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // ===== CLOUD ACCOUNTS FOR A TENANT =====
  if (level === "cloudAccounts" && selectedTenant) {
    const tenantInventory = tenantCloudAccounts.reduce((s, a) => s + a.inventoryCount, 0);
    const cloudDist = new Map<string, number>();
    tenantCloudAccounts.forEach((a) => {
      const c = deriveCloudType(a.cloudAccountName);
      cloudDist.set(c, (cloudDist.get(c) || 0) + 1);
    });
    const cloudDistData = Array.from(cloudDist.entries()).map(([name, value]) => ({ name, value }));

    return (
      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><ArrowLeft className="h-4 w-4" /></button>
            <div>
              <h2 className="text-lg font-bold">{selectedTenant.tenantName}</h2>
              <p className="text-xs text-muted-foreground">Cloud Accounts · {tenantCloudAccounts.length} onboarded</p>
            </div>
          </div>
          <ReportDownload
            title={`${selectedTenant.tenantName} - Cloud Accounts`}
            subtitle="Account Governance & Inventory Details"
            headers={["Cloud Account", "Provider", "Status", "Inventory"]}
            rows={tenantCloudAccounts.map((a) => [a.cloudAccountName, deriveCloudType(a.cloudAccountName), a.status, a.inventoryCount])}
            filename={`${selectedTenant.tenantName.toLowerCase().replace(/\s+/g, "-")}-accounts`}
            summaryRows={[
              { label: "Total Accounts", value: String(selectedTenant.totalCloudAccounts) },
              { label: "Active", value: String(selectedTenant.active) },
              { label: "Total Inventory", value: tenantInventory.toLocaleString() },
            ]}
          />
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {[
            { label: "Total", value: selectedTenant.totalCloudAccounts, color: "text-foreground" },
            { label: "Active", value: selectedTenant.active, color: "text-success" },
            { label: "Inactive", value: selectedTenant.inactive, color: "text-destructive" },
            { label: "Not Onboarded", value: selectedTenant.notOnboarded, color: "text-warning" },
            { label: "Inventory", value: tenantInventory, color: "text-primary" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg bg-secondary/50 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <p className={`text-lg font-mono font-bold ${kpi.color}`}>{kpi.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Cloud distribution mini chart */}
        {cloudDistData.length > 1 && (
          <div className="mb-5 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cloudDistData} cx="50%" cy="50%" outerRadius={50} dataKey="value"
                  label={({ name, value }) => `${name} (${value})`} labelLine={{ stroke: "hsl(var(--muted-foreground))" }}>
                  {cloudDistData.map((d, i) => (<Cell key={i} fill={CLOUD_COLORS[d.name] || "#6b7280"} />))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Account rows */}
        <div className="space-y-1.5">
          {tenantCloudAccounts.map((a, i) => {
            const cloud = deriveCloudType(a.cloudAccountName);
            return (
              <div
                key={i}
                onClick={() => { setSelectedAccount(a); setLevel("inventory"); }}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 hover:bg-secondary/70 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Server className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.cloudAccountName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: CLOUD_COLORS[cloud] + "20", color: CLOUD_COLORS[cloud] }}>{cloud}</span>
                      <Badge variant={a.status === "active" ? "default" : "secondary"} className="text-[9px] h-4">{a.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Inventory</p>
                    <p className="font-mono text-sm font-semibold">{a.inventoryCount.toLocaleString()}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ===== MAIN TENANT LIST VIEW =====
  const reportHeaders = ["Tenant", "Total Accounts", "Active", "Inactive", "Not Onboarded", "Status"];
  const reportRows = tenantSummaries.map((t) => [t.tenantName, t.totalCloudAccounts, t.active, t.inactive, t.notOnboarded, t.status]);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Account Governance & Inventory Details</h2>
            <p className="text-xs text-muted-foreground">
              {tenantSummaries.length} tenants · {totalAccounts.toLocaleString()} cloud accounts · {totalInventory.toLocaleString()} resources
            </p>
          </div>
        </div>
        <ReportDownload
          title="Account Governance Report"
          subtitle="Synoptek · Tenant & Cloud Account Overview"
          headers={reportHeaders}
          rows={reportRows}
          filename="account-governance-report"
          summaryRows={[
            { label: "Total Tenants", value: String(tenantSummaries.length) },
            { label: "Cloud Accounts", value: totalAccounts.toLocaleString() },
            { label: "Active Accounts", value: totalActive.toLocaleString() },
            { label: "Total Inventory", value: totalInventory.toLocaleString() },
          ]}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { label: "Tenants", value: tenantSummaries.length, icon: Building2, color: "bg-primary/10 text-primary" },
          { label: "Cloud Accounts", value: totalAccounts, icon: Server, color: "bg-info/10 text-info" },
          { label: "Active", value: totalActive, icon: Shield, color: "bg-success/10 text-success" },
          { label: "Inactive", value: totalInactive, icon: Shield, color: "bg-destructive/10 text-destructive" },
          { label: "Not Onboarded", value: totalNotOnboarded, icon: Shield, color: "bg-warning/10 text-warning" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1 rounded ${kpi.color}`}>
                <kpi.icon className="h-3 w-3" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="text-xl font-mono font-bold">{kpi.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div>
          <h3 className="text-xs font-semibold mb-2">Top Tenants by Accounts</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTenants} margin={{ top: 5, right: 5, bottom: 35, left: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} angle={-25} textAnchor="end" height={50} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="accounts" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" opacity={0.85} name="Total" />
                <Bar dataKey="active" radius={[4, 4, 0, 0]} fill="hsl(var(--success))" opacity={0.85} name="Active" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold mb-2">Account Status Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "hsl(var(--muted-foreground))" }}>
                  {statusData.map((d, i) => (<Cell key={i} fill={d.fill} />))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search tenants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-8 bg-secondary border-border text-xs"
        />
      </div>

      {/* Tenant rows - clickable */}
      <div className="space-y-1">
        {filteredTenants.map((tenant) => (
          <div
            key={tenant.tenantName}
            onClick={() => { setSelectedTenant(tenant); setLevel("cloudAccounts"); }}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{tenant.tenantName}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-success">{tenant.active} active</span>
                  {tenant.inactive > 0 && <span className="text-[10px] text-destructive">{tenant.inactive} inactive</span>}
                  {tenant.notOnboarded > 0 && <span className="text-[10px] text-warning">{tenant.notOnboarded} not onboarded</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-mono text-sm font-bold">{tenant.totalCloudAccounts}</p>
                <p className="text-[10px] text-muted-foreground">accounts</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
