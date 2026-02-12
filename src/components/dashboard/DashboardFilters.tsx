import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cloudAccounts } from "@/data/cloudAccounts";
import { Filter } from "lucide-react";

export interface FilterState {
  environment: string;
  accountMaster: string;
  month: string;
}

interface DashboardFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

// Derive environment from cloud account name
function deriveEnvironment(accountName: string): string {
  const lower = accountName.toLowerCase();
  if (lower.includes("prod")) return "Production";
  if (lower.includes("dev")) return "Development";
  if (lower.includes("staging") || lower.includes("stag")) return "Staging";
  if (lower.includes("uat")) return "UAT";
  if (lower.includes("sandbox")) return "Sandbox";
  if (lower.includes("hub")) return "Hub";
  return "Other";
}

// Get unique environments
export function getUniqueEnvironments(): string[] {
  const envs = new Set(cloudAccounts.map((a) => deriveEnvironment(a.cloudAccountName)));
  return Array.from(envs).sort();
}

// Get unique account masters
export function getUniqueAccountMasters(): string[] {
  const masters = new Set(cloudAccounts.map((a) => a.accountMasterName));
  return Array.from(masters).sort();
}

// Generate months list (last 12 months from current)
function getMonthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    months.push({ value, label });
  }
  return months;
}

// Filter cloud accounts based on filter state
export function filterAccounts(filters: FilterState) {
  return cloudAccounts.filter((a) => {
    if (filters.environment && filters.environment !== "all") {
      if (deriveEnvironment(a.cloudAccountName) !== filters.environment) return false;
    }
    if (filters.accountMaster && filters.accountMaster !== "all") {
      if (a.accountMasterName !== filters.accountMaster) return false;
    }
    // Month filter is for projection period — doesn't filter accounts, but is used in cost calculations
    return true;
  });
}

export function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  const environments = getUniqueEnvironments();
  const accountMasters = getUniqueAccountMasters();
  const months = getMonthOptions();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
      </div>

      <Select
        value={filters.environment}
        onValueChange={(v) => onChange({ ...filters, environment: v })}
      >
        <SelectTrigger className="w-[160px] h-9 bg-secondary border-border text-sm">
          <SelectValue placeholder="Environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Environments</SelectItem>
          {environments.map((env) => (
            <SelectItem key={env} value={env}>{env}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.accountMaster}
        onValueChange={(v) => onChange({ ...filters, accountMaster: v })}
      >
        <SelectTrigger className="w-[170px] h-9 bg-secondary border-border text-sm">
          <SelectValue placeholder="Account Master" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts</SelectItem>
          {accountMasters.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.month}
        onValueChange={(v) => onChange({ ...filters, month: v })}
      >
        <SelectTrigger className="w-[150px] h-9 bg-secondary border-border text-sm">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Months</SelectItem>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
