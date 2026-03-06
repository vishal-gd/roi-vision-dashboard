import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudAccount, TenantSummary, cloudAccounts, tenantSummaries, featureConfigs } from "@/data/cloudAccounts";
import { ArrowLeft, Building2, Server, Shield, ChevronRight, ChevronDown, Search, Package, Layers, Activity, AlertTriangle, Bug, FileCheck, Zap, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6"];

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
  let all: { category: string; count: number }[];
  if (cloud === "AWS") {
    all = [
      { category: "EC2 Instances", count: Math.round(inv * 0.28) },
      { category: "S3 Buckets", count: Math.round(inv * 0.14) },
      { category: "Lambda Functions", count: Math.round(inv * 0.11) },
      { category: "RDS Databases", count: Math.round(inv * 0.09) },
      { category: "IAM Resources", count: Math.round(inv * 0.09) },
      { category: "VPC Resources", count: Math.round(inv * 0.07) },
      { category: "CloudWatch", count: Math.round(inv * 0.06) },
      { category: "SNS/SQS", count: Math.round(inv * 0.05) },
      { category: "ELB/ALB", count: Math.round(inv * 0.04) },
      { category: "Other", count: Math.round(inv * 0.07) },
    ];
  } else if (cloud === "Azure") {
    all = [
      { category: "Virtual Machines", count: Math.round(inv * 0.22) },
      { category: "Storage Accounts", count: Math.round(inv * 0.14) },
      { category: "Network Resources", count: Math.round(inv * 0.12) },
      { category: "App Services", count: Math.round(inv * 0.10) },
      { category: "SQL Databases", count: Math.round(inv * 0.08) },
      { category: "Key Vaults", count: Math.round(inv * 0.06) },
      { category: "Load Balancers", count: Math.round(inv * 0.05) },
      { category: "DNS Zones", count: Math.round(inv * 0.05) },
      { category: "Monitor Resources", count: Math.round(inv * 0.04) },
      { category: "Other", count: Math.round(inv * 0.14) },
    ];
  } else if (cloud === "GCP") {
    all = [
      { category: "Compute Engine", count: Math.round(inv * 0.30) },
      { category: "Cloud Storage", count: Math.round(inv * 0.18) },
      { category: "BigQuery", count: Math.round(inv * 0.12) },
      { category: "Cloud Functions", count: Math.round(inv * 0.10) },
      { category: "VPC Network", count: Math.round(inv * 0.08) },
      { category: "Cloud SQL", count: Math.round(inv * 0.07) },
      { category: "Pub/Sub", count: Math.round(inv * 0.05) },
      { category: "Other", count: Math.round(inv * 0.10) },
    ];
  } else if (cloud === "OCI") {
    all = [
      { category: "Compute", count: Math.round(inv * 0.30) },
      { category: "Block Storage", count: Math.round(inv * 0.18) },
      { category: "Object Storage", count: Math.round(inv * 0.12) },
      { category: "VCN Resources", count: Math.round(inv * 0.10) },
      { category: "Database", count: Math.round(inv * 0.08) },
      { category: "Load Balancers", count: Math.round(inv * 0.06) },
      { category: "Other", count: Math.round(inv * 0.16) },
    ];
  } else {
    all = [
      { category: "Compute", count: Math.round(inv * 0.30) },
      { category: "Storage", count: Math.round(inv * 0.20) },
      { category: "Networking", count: Math.round(inv * 0.15) },
      { category: "Database", count: Math.round(inv * 0.10) },
      { category: "Security", count: Math.round(inv * 0.08) },
      { category: "Monitoring", count: Math.round(inv * 0.05) },
      { category: "Other", count: Math.round(inv * 0.12) },
    ];
  }
  return all.filter(c => c.count > 0).sort((a, b) => b.count - a.count);
}

// Feature icons mapping
const FEATURE_ICONS: Record<string, typeof Activity> = {
  budgetCount: DollarSign,
  costPolicyCompleted: FileCheck,
  scheduleTotal: Clock,
  costAnomalyNotificationCount: AlertTriangle,
  recommendationOpen: Zap,
  recommendationResolved: Zap,
  metricAlertCount: Activity,
  activityLogCount: Layers,
  threatsCount: Bug,
  vulnerabilitiesCount: Shield,
  complianceAssessmentCount: FileCheck,
  templateJobCompleted: Package,
  securityGuardrailCount: Shield,
};

type DrillLevel = "tenants" | "cloudAccounts" | "inventory";

export function AccountGovernance({ filteredAccounts }: AccountGovernanceProps) {
  const [expanded, setExpanded] = useState(false);
  const [level, setLevel] = useState<DrillLevel>("tenants");
  const [selectedTenant, setSelectedTenant] = useState<TenantSummary | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<CloudAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const totalAccounts = tenantSummaries.reduce((s, t) => s + t.totalCloudAccounts, 0);
  const totalActive = tenantSummaries.reduce((s, t) => s + t.active, 0);
  const totalInactive = tenantSummaries.reduce((s, t) => s + t.inactive, 0);
  const totalNotOnboarded = tenantSummaries.reduce((s, t) => s + t.notOnboarded, 0);
  const totalInventory = filteredAccounts.reduce((s, a) => s + a.inventoryCount, 0);

  const filteredTenants = useMemo(() => {
    if (!searchTerm) return [...tenantSummaries].sort((a, b) => b.totalCloudAccounts - a.totalCloudAccounts);
    return tenantSummaries
      .filter((t) => t.tenantName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.totalCloudAccounts - a.totalCloudAccounts);
  }, [searchTerm]);

  const tenantCloudAccounts = useMemo(() => {
    if (!selectedTenant) return [];
    return filteredAccounts.filter((a) => a.tenantName === selectedTenant.tenantName);
  }, [selectedTenant, filteredAccounts]);

  const statusData = [
    { name: "Active", value: totalActive, fill: "#22c55e" },
    { name: "Inactive", value: totalInactive, fill: "#ef4444" },
    { name: "Not Onboarded", value: totalNotOnboarded, fill: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const topTenants = [...tenantSummaries]
    .sort((a, b) => b.totalCloudAccounts - a.totalCloudAccounts)
    .slice(0, 8)
    .map((t) => ({ name: t.tenantName.length > 15 ? t.tenantName.slice(0, 13) + "…" : t.tenantName, accounts: t.totalCloudAccounts, active: t.active }));

  const goBack = () => {
    if (level === "inventory") { setLevel("cloudAccounts"); setSelectedAccount(null); }
    else if (level === "cloudAccounts") { setLevel("tenants"); setSelectedTenant(null); }
  };

  // ===== INVENTORY — FULL RESOURCE LEVEL =====
  if (expanded && level === "inventory" && selectedAccount) {
    const cloud = deriveCloudType(selectedAccount.cloudAccountName);
    const categories = deriveProductCategories(selectedAccount);
    const totalCat = categories.reduce((s, c) => s + c.count, 0);
    const chartData = categories.map(c => ({ ...c, percentage: totalCat > 0 ? Math.round((c.count / totalCat) * 100) : 0 }));

    // All feature data for this account
    const featureData = featureConfigs
      .filter(f => f.key !== "inventoryCount")
      .map(f => ({
        label: f.label,
        key: f.key,
        bundle: f.bundle,
        value: Number(selectedAccount[f.key]) || 0,
        description: f.description,
      }))
      .filter(f => f.value > 0);

    const bundleGroups = featureData.reduce((acc, f) => {
      if (!acc[f.bundle]) acc[f.bundle] = [];
      acc[f.bundle].push(f);
      return acc;
    }, {} as Record<string, typeof featureData>);

    const BUNDLE_COLORS: Record<string, string> = {
      FinOps: "#3b82f6",
      CloudOps: "#22c55e",
      SecOps: "#ef4444",
      Core: "#8b5cf6",
    };

    return (
      <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><ArrowLeft className="h-4 w-4" /></button>
            <div>
              <h2 className="text-lg font-bold">{selectedAccount.cloudAccountName}</h2>
              <p className="text-xs text-muted-foreground">{selectedAccount.tenantName} · Full Resource Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={selectedAccount.status === "active" ? "default" : "secondary"} className="text-[10px]">{selectedAccount.status}</Badge>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: CLOUD_COLORS[cloud] + "20", color: CLOUD_COLORS[cloud] }}>{cloud}</span>
            <ReportDownload
              title={`Full Resource Report - ${selectedAccount.cloudAccountName}`}
              subtitle={`${selectedAccount.tenantName} · ${cloud}`}
              headers={["Category", "Count", "% of Total"]}
              rows={[
                ...chartData.map((c) => [c.category, c.count, c.percentage + "%"]),
                ["", "", ""],
                ["--- Feature Details ---", "", ""],
                ...featureData.map(f => [f.label + " (" + f.bundle + ")", f.value, ""]),
              ]}
              filename={`resource-details-${selectedAccount.cloudAccountName.toLowerCase().replace(/\s+/g, "-")}`}
              summaryRows={[
                { label: "Provider", value: cloud },
                { label: "Status", value: selectedAccount.status },
                { label: "Total Inventory", value: selectedAccount.inventoryCount.toLocaleString() },
                { label: "Product Categories", value: String(categories.length) },
                { label: "Active Features", value: String(featureData.length) },
              ]}
            />
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Resources</p>
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
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Features</p>
            <p className="text-xl font-mono font-bold">{featureData.length}</p>
          </div>
        </div>

        {/* Inventory Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div>
            <h3 className="text-xs font-semibold mb-2">Resource Distribution by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={110} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} formatter={(v: number) => [v.toLocaleString(), "Resources"]} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} fill={CLOUD_COLORS[cloud]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold mb-2">Category Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" outerRadius={85} innerRadius={40} dataKey="count"
                    label={({ category, percentage }) => `${category?.slice(0, 10)} ${percentage}%`}
                    labelLine={{ stroke: "hsl(var(--muted-foreground))" }}>
                    {chartData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} formatter={(v: number) => [v.toLocaleString(), "Resources"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Full category table */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold mb-2">All Product Categories</h3>
          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary sticky top-0">
                <tr>
                  <th className="text-left p-2.5 text-xs font-medium text-muted-foreground">Product Category</th>
                  <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">Count</th>
                  <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">%</th>
                  <th className="text-left p-2.5 text-xs font-medium text-muted-foreground w-[120px]">Share</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((c, i) => (
                  <tr key={i} className="border-t border-border/50 hover:bg-secondary/30">
                    <td className="p-2.5 font-medium flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {c.category}
                    </td>
                    <td className="p-2.5 text-right font-mono">{c.count.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono text-muted-foreground">{c.percentage}%</td>
                    <td className="p-2.5">
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${c.percentage}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-secondary/40">
                  <td className="p-2.5 font-bold">Total</td>
                  <td className="p-2.5 text-right font-mono font-bold">{totalCat.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono font-bold">100%</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Details by Bundle */}
        {Object.keys(bundleGroups).length > 0 && (
          <div>
            <h3 className="text-xs font-semibold mb-3">Feature Details by Bundle</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(bundleGroups).map(([bundle, features]) => (
                <div key={bundle} className="rounded-lg border border-border overflow-hidden">
                  <div className="px-3 py-2 flex items-center gap-2" style={{ background: (BUNDLE_COLORS[bundle] || "#6b7280") + "15" }}>
                    <div className="h-2 w-2 rounded-full" style={{ background: BUNDLE_COLORS[bundle] || "#6b7280" }} />
                    <span className="text-xs font-bold" style={{ color: BUNDLE_COLORS[bundle] || "#6b7280" }}>{bundle}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{features.length} features</span>
                  </div>
                  <div className="p-2 space-y-1">
                    {features.map(f => {
                      const Icon = FEATURE_ICONS[f.key] || Activity;
                      return (
                        <div key={f.key} className="flex items-center justify-between p-2 rounded bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="h-3 w-3 shrink-0" style={{ color: BUNDLE_COLORS[f.bundle] || "#6b7280" }} />
                            <span className="text-xs truncate">{f.label}</span>
                          </div>
                          <span className="font-mono text-xs font-bold ml-2">{f.value.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* If no features active */}
        {featureData.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No active features configured for this cloud account.
          </div>
        )}
      </motion.div>
    );
  }

  // ===== CLOUD ACCOUNTS FOR A TENANT =====
  if (expanded && level === "cloudAccounts" && selectedTenant) {
    const tenantInventory = tenantCloudAccounts.reduce((s, a) => s + a.inventoryCount, 0);
    const cloudDist = new Map<string, number>();
    tenantCloudAccounts.forEach((a) => {
      const c = deriveCloudType(a.cloudAccountName);
      cloudDist.set(c, (cloudDist.get(c) || 0) + 1);
    });
    const cloudDistData = Array.from(cloudDist.entries()).map(([name, value]) => ({ name, value }));

    // Aggregate feature totals for this tenant
    const tenantFeatures = featureConfigs
      .filter(f => f.key !== "inventoryCount")
      .map(f => ({
        label: f.label,
        bundle: f.bundle,
        value: tenantCloudAccounts.reduce((s, a) => s + (Number(a[f.key]) || 0), 0),
      }))
      .filter(f => f.value > 0);

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
            headers={["Cloud Account", "Provider", "Status", "Inventory", "Threats", "Vulnerabilities", "Guardrails"]}
            rows={tenantCloudAccounts.map((a) => [a.cloudAccountName, deriveCloudType(a.cloudAccountName), a.status, a.inventoryCount, a.threatsCount, a.vulnerabilitiesCount, a.securityGuardrailCount])}
            filename={`${selectedTenant.tenantName.toLowerCase().replace(/\s+/g, "-")}-accounts`}
            summaryRows={[
              { label: "Total Accounts", value: String(selectedTenant.totalCloudAccounts) },
              { label: "Active", value: String(selectedTenant.active) },
              { label: "Inactive", value: String(selectedTenant.inactive) },
              { label: "Not Onboarded", value: String(selectedTenant.notOnboarded) },
              { label: "Total Inventory", value: tenantInventory.toLocaleString() },
            ]}
          />
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
          {[
            { label: "Total", value: selectedTenant.totalCloudAccounts, color: "hsl(var(--foreground))" },
            { label: "Active", value: selectedTenant.active, color: "#22c55e" },
            { label: "Inactive", value: selectedTenant.inactive, color: "#ef4444" },
            { label: "Not Onboarded", value: selectedTenant.notOnboarded, color: "#f59e0b" },
            { label: "Validated", value: selectedTenant.notOnboardedValidated, color: "#8b5cf6" },
            { label: "Inventory", value: tenantInventory, color: "hsl(var(--primary))" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg bg-secondary/50 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
              <p className="text-lg font-mono font-bold" style={{ color: kpi.color }}>{kpi.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Cloud distribution + feature summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          {cloudDistData.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold mb-2">Cloud Provider Distribution</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={cloudDistData} cx="50%" cy="50%" outerRadius={55} dataKey="value"
                      label={({ name, value }) => `${name} (${value})`} labelLine={{ stroke: "hsl(var(--muted-foreground))" }}>
                      {cloudDistData.map((d, i) => (<Cell key={i} fill={CLOUD_COLORS[d.name] || "#6b7280"} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {tenantFeatures.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold mb-2">Tenant Feature Summary</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tenantFeatures.slice(0, 6)} margin={{ top: 5, right: 5, bottom: 25, left: 5 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} angle={-20} textAnchor="end" height={40} interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" opacity={0.85} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Account rows — full detail */}
        <div className="overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary sticky top-0">
              <tr>
                <th className="text-left p-2.5 text-xs font-medium text-muted-foreground">Cloud Account</th>
                <th className="text-left p-2.5 text-xs font-medium text-muted-foreground">Provider</th>
                <th className="text-center p-2.5 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">Inventory</th>
                <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">Threats</th>
                <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">Vulnerabilities</th>
                <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">Guardrails</th>
                <th className="text-right p-2.5 text-xs font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {tenantCloudAccounts.map((a, i) => {
                const cloud = deriveCloudType(a.cloudAccountName);
                return (
                  <tr
                    key={i}
                    onClick={() => { setSelectedAccount(a); setLevel("inventory"); }}
                    className="border-t border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <td className="p-2.5 font-medium truncate max-w-[200px]">{a.cloudAccountName}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: CLOUD_COLORS[cloud] + "20", color: CLOUD_COLORS[cloud] }}>{cloud}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <Badge variant={a.status === "active" ? "default" : "secondary"} className="text-[9px] h-4">{a.status}</Badge>
                    </td>
                    <td className="p-2.5 text-right font-mono">{a.inventoryCount.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono">{a.threatsCount > 0 ? <span className="text-destructive">{a.threatsCount.toLocaleString()}</span> : <span className="text-muted-foreground">0</span>}</td>
                    <td className="p-2.5 text-right font-mono">{a.vulnerabilitiesCount > 0 ? <span className="text-warning">{a.vulnerabilitiesCount.toLocaleString()}</span> : <span className="text-muted-foreground">0</span>}</td>
                    <td className="p-2.5 text-right font-mono">{a.securityGuardrailCount.toLocaleString()}</td>
                    <td className="p-2.5"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">Click any account to view full resource & feature details</p>
      </motion.div>
    );
  }

  // ===== MAIN VIEW — COLLAPSIBLE =====
  const reportHeaders = ["Tenant", "Total Accounts", "Active", "Inactive", "Not Onboarded", "Not Onboarded Validated", "Status"];
  const reportRows = tenantSummaries.map((t) => [t.tenantName, t.totalCloudAccounts, t.active, t.inactive, t.notOnboarded, t.notOnboardedValidated, t.status]);

  // Build top 5 cloud accounts inventory sections for the report
  const PROVIDER_COLORS: Record<string, number[]> = {
    AWS: [245, 158, 11],
    Azure: [59, 130, 246],
    GCP: [34, 197, 94],
    OCI: [239, 68, 68],
    Other: [107, 114, 128],
  };

  const top5Accounts = [...filteredAccounts]
    .sort((a, b) => b.inventoryCount - a.inventoryCount)
    .slice(0, 5);

  const accountInventorySections = top5Accounts
    .filter(a => a.inventoryCount > 0)
    .map(a => {
      const cloud = deriveCloudType(a.cloudAccountName);
      const categories = deriveProductCategories(a);
      const totalCat = categories.reduce((s, c) => s + c.count, 0);
      const chartData = categories.map(c => ({
        category: c.category,
        count: c.count,
        percentage: totalCat > 0 ? Math.round((c.count / totalCat) * 100) : 0,
      }));
      const features = featureConfigs
        .filter(f => f.key !== "inventoryCount")
        .map(f => ({
          label: f.label,
          bundle: f.bundle,
          value: Number(a[f.key]) || 0,
        }))
        .filter(f => f.value > 0);

      return {
        accountName: a.cloudAccountName,
        provider: cloud,
        providerColor: PROVIDER_COLORS[cloud] || PROVIDER_COLORS.Other,
        totalInventory: a.inventoryCount,
        categories: chartData,
        features,
      };
    });

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl">
      {/* Collapsed header */}
      <div
        onClick={() => { setExpanded(!expanded); if (!expanded) { setLevel("tenants"); setSelectedTenant(null); setSelectedAccount(null); } }}
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors rounded-xl"
      >
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
        <div className="flex items-center gap-3">
          {!expanded && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-semibold">{totalActive} active</span>
              <span className="px-2 py-1 rounded-md bg-destructive/10 text-destructive text-[10px] font-semibold">{totalInactive} inactive</span>
              <span className="px-2 py-1 rounded-md bg-warning/10 text-warning text-[10px] font-semibold">{totalNotOnboarded} not onboarded</span>
            </div>
          )}
          <ReportDownload
            title="Account Governance Report"
            subtitle="Tenant & Cloud Account Overview · Top 5 Inventory Details"
            headers={reportHeaders}
            rows={reportRows}
            filename="account-governance-report"
            summaryRows={[
              { label: "Total Tenants", value: String(tenantSummaries.length) },
              { label: "Cloud Accounts", value: totalAccounts.toLocaleString() },
              { label: "Active", value: totalActive.toLocaleString() },
              { label: "Inventory", value: totalInventory.toLocaleString() },
            ]}
            accountInventorySections={accountInventorySections}
          />
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0">
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

              {/* Charts */}
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

              {/* Tenant table with full data */}
              <div className="overflow-auto rounded-lg border border-border max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="bg-secondary sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-2.5 text-xs font-medium text-muted-foreground">Tenant</th>
                      <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">Total</th>
                      <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">Active</th>
                      <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">Inactive</th>
                      <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">Not Onboarded</th>
                      <th className="text-center p-2.5 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-2.5 text-xs font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((tenant) => (
                      <tr
                        key={tenant.tenantName}
                        onClick={() => { setSelectedTenant(tenant); setLevel("cloudAccounts"); }}
                        className="border-t border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate max-w-[200px]">{tenant.tenantName}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">{tenant.totalCloudAccounts}</td>
                        <td className="p-2.5 text-right font-mono text-success">{tenant.active}</td>
                        <td className="p-2.5 text-right font-mono">{tenant.inactive > 0 ? <span className="text-destructive">{tenant.inactive}</span> : <span className="text-muted-foreground">0</span>}</td>
                        <td className="p-2.5 text-right font-mono">{tenant.notOnboarded > 0 ? <span className="text-warning">{tenant.notOnboarded}</span> : <span className="text-muted-foreground">0</span>}</td>
                        <td className="p-2.5 text-center">
                          <Badge variant={tenant.status === "active" ? "default" : "secondary"} className="text-[9px] h-4">{tenant.status}</Badge>
                        </td>
                        <td className="p-2.5"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">Click any tenant to view cloud account details</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
