import { motion } from "framer-motion";
import { CloudAccount } from "@/data/cloudAccounts";
import { Package, TrendingUp } from "lucide-react";

interface InventoryOverviewProps {
  filteredAccounts: CloudAccount[];
}

export function InventoryOverview({ filteredAccounts }: InventoryOverviewProps) {
  const totalInventory = filteredAccounts.reduce((s, a) => s + a.inventoryCount, 0);
  const accountsWithInventory = filteredAccounts.filter((a) => a.inventoryCount > 0).length;

  // Top 5 by inventory
  const topAccounts = [...filteredAccounts]
    .sort((a, b) => b.inventoryCount - a.inventoryCount)
    .slice(0, 5)
    .filter((a) => a.inventoryCount > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold">Inventory</h2>
          <p className="text-xs text-muted-foreground">
            {totalInventory.toLocaleString()} total resources · {accountsWithInventory} accounts
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono font-bold gradient-text">{totalInventory.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Resources</p>
        </div>
      </div>

      {topAccounts.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <TrendingUp className="h-3 w-3" /> Top accounts by inventory
          </p>
          {topAccounts.map((a, i) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground truncate max-w-[60%]">{a.tenantName} · {a.cloudAccountName}</span>
              <span className="font-mono font-medium">{a.inventoryCount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
