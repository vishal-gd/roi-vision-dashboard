import { motion, AnimatePresence } from "framer-motion";
import { cloudAccounts, tenantSummaries } from "@/data/cloudAccounts";
import { Server, Users, ChevronRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type DetailView = "cloud" | "tenant" | null;

export function StatsOverview() {
  const [detailView, setDetailView] = useState<DetailView>(null);

  const totalAccounts = cloudAccounts.length;
  const totalTenants = tenantSummaries.length;
  const activeTenants = tenantSummaries.filter((t) => t.active > 0).length;
  const activeAccounts = cloudAccounts.filter((a) => a.status === "active").length;

  if (detailView === "cloud") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setDetailView(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Cloud Accounts</h2>
            <p className="text-sm text-muted-foreground">{totalAccounts} accounts · {activeAccounts} active</p>
          </div>
        </div>
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-xs">Tenant</TableHead>
                <TableHead className="text-xs">Account Name</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
                <TableHead className="text-xs text-right">Inventory</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cloudAccounts.map((account, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell className="text-sm font-medium max-w-[150px] truncate">{account.tenantName}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate text-muted-foreground">{account.cloudAccountName}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={account.status === "active" ? "default" : "secondary"} className="text-[10px] bg-success/10 text-success border-0">
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{account.inventoryCount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    );
  }

  if (detailView === "tenant") {
    const sorted = [...tenantSummaries].sort((a, b) => b.totalCloudAccounts - a.totalCloudAccounts);
    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setDetailView(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Tenant Details</h2>
            <p className="text-sm text-muted-foreground">{totalTenants} tenants · {activeTenants} active</p>
          </div>
        </div>
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-xs">Tenant</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs text-right">Active</TableHead>
                <TableHead className="text-xs text-right">Inactive</TableHead>
                <TableHead className="text-xs text-right">Not Onboarded</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((tenant) => (
                <TableRow key={tenant.tenantName} className="border-border/50">
                  <TableCell className="text-sm font-medium max-w-[200px] truncate">{tenant.tenantName}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{tenant.totalCloudAccounts}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-success">{tenant.active}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-destructive">{tenant.inactive}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-warning">{tenant.notOnboarded}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={tenant.status === "active" ? "default" : "secondary"} className="text-[10px] bg-success/10 text-success border-0">
                      {tenant.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setDetailView("cloud")}
        className="glass-card rounded-xl p-5 cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cloud Accounts</p>
              <p className="text-2xl font-mono font-bold">{totalAccounts}</p>
              <p className="text-xs text-success">{activeAccounts} active</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        onClick={() => setDetailView("tenant")}
        className="glass-card rounded-xl p-5 cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-success/10 text-success">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tenants</p>
              <p className="text-2xl font-mono font-bold">{totalTenants}</p>
              <p className="text-xs text-success">{activeTenants} active</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </motion.div>
    </div>
  );
}
