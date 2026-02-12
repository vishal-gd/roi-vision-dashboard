import { tenantSummaries } from "@/data/cloudAccounts";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function TenantTable() {
  const sorted = [...tenantSummaries].sort((a, b) => b.totalCloudAccounts - a.totalCloudAccounts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-5"
    >
      <h3 className="text-lg font-bold mb-4">Tenant Account Summary</h3>
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
                <TableCell className="text-sm font-medium max-w-[200px] truncate">
                  {tenant.tenantName}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {tenant.totalCloudAccounts}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-success">
                  {tenant.active}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-destructive">
                  {tenant.inactive}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-warning">
                  {tenant.notOnboarded}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={tenant.status === "active" ? "default" : "secondary"}
                    className="text-[10px] bg-success/10 text-success border-0"
                  >
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
