import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Save } from "lucide-react";
import { featureConfigs, BundleName, bundleColors } from "@/data/cloudAccounts";
import { motion } from "framer-motion";

export interface ROICosts {
  [featureKey: string]: number;
}

interface ROICostInputProps {
  costs: ROICosts;
  onSave: (costs: ROICosts) => void;
}

const bundleOrder: BundleName[] = ["Core", "FinOps", "CloudOps", "SecOps"];

export function ROICostInput({ costs, onSave }: ROICostInputProps) {
  const [open, setOpen] = useState(false);
  const [localCosts, setLocalCosts] = useState<ROICosts>(costs);

  const handleSave = () => {
    onSave(localCosts);
    setOpen(false);
  };

  const totalROI = Object.values(localCosts).reduce((s, v) => s + v, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-semibold">
          <DollarSign className="h-4 w-4" />
          ROI Cost Input
          {totalROI > 0 && (
            <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
              ${totalROI.toLocaleString()}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Configure ROI Cost Per Feature
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {bundleOrder.map((bundle) => (
            <div key={bundle}>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 text-${bundleColors[bundle]}`}>
                {bundle} Bundle
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featureConfigs
                  .filter((f) => f.bundle === bundle)
                  .map((feature) => (
                    <motion.div
                      key={feature.key}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1"
                    >
                      <Label htmlFor={feature.key} className="text-xs text-muted-foreground">
                        {feature.label}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          id={feature.key}
                          type="number"
                          min={0}
                          value={localCosts[feature.key] || ""}
                          onChange={(e) =>
                            setLocalCosts((prev) => ({
                              ...prev,
                              [feature.key]: Number(e.target.value) || 0,
                            }))
                          }
                          className="pl-7 bg-secondary border-border"
                          placeholder="0"
                        />
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">Total ROI Investment</p>
              <p className="text-2xl font-bold font-mono text-primary">${totalROI.toLocaleString()}</p>
            </div>
            <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground">
              <Save className="h-4 w-4" />
              Save Costs
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
