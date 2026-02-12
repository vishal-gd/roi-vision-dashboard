import { motion } from "framer-motion";
import { cloudAccounts, tenantSummaries, getFeatureTotal } from "@/data/cloudAccounts";
import { Server, Users, Shield, Activity } from "lucide-react";

const stats = [
  {
    label: "Total Cloud Accounts",
    value: cloudAccounts.length,
    icon: <Server className="h-4 w-4" />,
    color: "text-primary",
  },
  {
    label: "Active Tenants",
    value: tenantSummaries.filter((t) => t.active > 0).length,
    icon: <Users className="h-4 w-4" />,
    color: "text-success",
  },
  {
    label: "Total Inventory",
    value: getFeatureTotal("inventoryCount"),
    icon: <Activity className="h-4 w-4" />,
    color: "text-warning",
  },
  {
    label: "Security Guardrails",
    value: getFeatureTotal("securityGuardrailCount"),
    icon: <Shield className="h-4 w-4" />,
    color: "text-bundle-secops",
  },
];

export function StatsOverview() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={stat.color}>{stat.icon}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-2xl font-mono font-bold">{stat.value.toLocaleString()}</p>
        </motion.div>
      ))}
    </div>
  );
}
