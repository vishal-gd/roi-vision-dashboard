import { useState, useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cloudAccounts } from "@/data/cloudAccounts";
import { Filter, X, Check, ChevronDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface FilterState {
  environment: string;
  selectedAccounts: string[];
  month: string;
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

// Get unique cloud account names
export function getUniqueCloudAccounts(): string[] {
  return [...new Set(cloudAccounts.map((a) => a.cloudAccountName))].sort();
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
    if (filters.selectedAccounts.length > 0) {
      if (!filters.selectedAccounts.includes(a.cloudAccountName)) return false;
    }
    return true;
  });
}

// Check if filters are applied (not all defaults)
export function hasActiveFilters(filters: FilterState): boolean {
  return filters.environment !== "" || filters.selectedAccounts.length > 0 || filters.month !== "";
}

interface DashboardFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  const environments = getUniqueEnvironments();
  const allAccounts = getUniqueCloudAccounts();
  const months = getMonthOptions();
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAccountList = accountSearch
    ? allAccounts.filter((a) => a.toLowerCase().includes(accountSearch.toLowerCase()))
    : allAccounts;

  const toggleAccount = (accountName: string) => {
    const current = filters.selectedAccounts;
    if (current.includes(accountName)) {
      onChange({ ...filters, selectedAccounts: current.filter((a) => a !== accountName) });
    } else if (current.length < 5) {
      onChange({ ...filters, selectedAccounts: [...current, accountName] });
    }
  };

  const selectAll = () => {
    onChange({ ...filters, selectedAccounts: [] });
    setAccountDropdownOpen(false);
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Filter className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-semibold">Select Filters to View Dashboard</span>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        {/* Environment - Single select */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Environment</label>
          <Select
            value={filters.environment || "placeholder"}
            onValueChange={(v) => onChange({ ...filters, environment: v === "placeholder" ? "" : v })}
          >
            <SelectTrigger className="w-[170px] h-9 bg-secondary border-border text-sm">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              {environments.map((env) => (
                <SelectItem key={env} value={env}>{env}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cloud Accounts - Multi select up to 5 */}
        <div className="space-y-1" ref={dropdownRef} style={{ position: "relative", zIndex: 60 }}>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            Cloud Accounts <span className="text-muted-foreground/60">(max 5)</span>
          </label>
          <button
            onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
            className="flex items-center justify-between w-[260px] h-9 px-3 rounded-md bg-secondary border border-border text-sm hover:bg-secondary/80 transition-colors"
          >
            <span className={filters.selectedAccounts.length === 0 ? "text-muted-foreground" : ""}>
              {filters.selectedAccounts.length === 0
                ? "All Accounts"
                : `${filters.selectedAccounts.length} selected`}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {accountDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-[320px] bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-3 text-xs bg-secondary border border-border rounded-md outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* All option */}
              <div
                onClick={selectAll}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-secondary/50 text-xs border-b border-border/50 ${
                  filters.selectedAccounts.length === 0 ? "bg-primary/5" : ""
                }`}
              >
                <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center ${
                  filters.selectedAccounts.length === 0 ? "bg-primary border-primary" : "border-border"
                }`}>
                  {filters.selectedAccounts.length === 0 && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                </div>
                <span className="font-medium">All Accounts</span>
              </div>

              {/* Account list */}
              <div className="max-h-[220px] overflow-y-auto">
                {filteredAccountList.map((account) => {
                  const isSelected = filters.selectedAccounts.includes(account);
                  const isDisabled = !isSelected && filters.selectedAccounts.length >= 5;
                  return (
                    <div
                      key={account}
                      onClick={() => !isDisabled && toggleAccount(account)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                        isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-secondary/50"
                      } ${isSelected ? "bg-primary/5" : ""}`}
                    >
                      <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                      </div>
                      <span className="truncate">{account}</span>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              {filters.selectedAccounts.length > 0 && (
                <div className="p-2 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{filters.selectedAccounts.length}/5 selected</span>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={selectAll}>Clear all</Button>
                </div>
              )}
            </div>
          )}

          {/* Selected account badges */}
          {filters.selectedAccounts.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 max-w-[320px]">
              {filters.selectedAccounts.map((a) => (
                <Badge key={a} variant="secondary" className="text-[9px] h-5 gap-1 pl-2 pr-1 max-w-[150px]">
                  <span className="truncate">{a.length > 20 ? a.slice(0, 18) + "…" : a}</span>
                  <button onClick={() => toggleAccount(a)} className="hover:bg-secondary rounded-full p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Month - Single select */}
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Month</label>
          <Select
            value={filters.month || "placeholder"}
            onValueChange={(v) => onChange({ ...filters, month: v === "placeholder" ? "" : v })}
          >
            <SelectTrigger className="w-[150px] h-9 bg-secondary border-border text-sm">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
