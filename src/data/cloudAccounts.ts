export interface CloudAccount {
  accountMasterName: string;
  tenantName: string;
  cloudAccountName: string;
  status: string;
  inventoryCount: number;
  budgetCount: number;
  costPolicyCompleted: number;
  scheduleTotal: number;
  costAnomalyNotificationCount: number;
  recommendationOpen: number;
  recommendationResolved: number;
  metricAlertCount: number;
  activityLogCount: number;
  threatsCount: number;
  vulnerabilitiesCount: number;
  complianceAssessmentCount: number;
  templateJobCompleted: number;
  securityGuardrailCount: number;
}

export interface TenantSummary {
  tenantName: string;
  status: string;
  totalCloudAccounts: number;
  active: number;
  inactive: number;
  notOnboarded: number;
  notOnboardedValidated: number;
  notValidated: number;
}

export type BundleName = "Core" | "FinOps" | "CloudOps" | "SecOps";

export interface FeatureConfig {
  key: keyof CloudAccount;
  label: string;
  bundle: BundleName;
  description: string;
}

export const featureConfigs: FeatureConfig[] = [
  { key: "inventoryCount", label: "Inventory", bundle: "Core", description: "Total cloud resource inventory items tracked across all accounts" },
  { key: "budgetCount", label: "Budget", bundle: "FinOps", description: "Budget configurations and financial tracking policies" },
  { key: "costPolicyCompleted", label: "Cost Policy", bundle: "FinOps", description: "Completed cost governance policies for optimization" },
  { key: "scheduleTotal", label: "Schedule", bundle: "CloudOps", description: "Scheduled automation jobs for resource management" },
  { key: "costAnomalyNotificationCount", label: "Cost Anomaly", bundle: "FinOps", description: "Notifications triggered for unusual spending patterns" },
  { key: "recommendationOpen", label: "Recommendations Open", bundle: "FinOps", description: "Active cost optimization recommendations pending action" },
  { key: "recommendationResolved", label: "Recommendations Resolved", bundle: "FinOps", description: "Optimization recommendations that have been resolved" },
  { key: "metricAlertCount", label: "Metric Alerts", bundle: "CloudOps", description: "Performance and health metric alert configurations" },
  { key: "activityLogCount", label: "Activity Logs", bundle: "CloudOps", description: "Cloud activity and audit log entries captured" },
  { key: "threatsCount", label: "Threats", bundle: "SecOps", description: "Security threats detected across cloud environments" },
  { key: "vulnerabilitiesCount", label: "Vulnerabilities", bundle: "SecOps", description: "Known vulnerabilities identified in cloud resources" },
  { key: "complianceAssessmentCount", label: "Compliance", bundle: "SecOps", description: "Compliance assessments and regulatory checks performed" },
  { key: "templateJobCompleted", label: "Template Jobs", bundle: "CloudOps", description: "Infrastructure template deployment jobs completed" },
  { key: "securityGuardrailCount", label: "Security Guardrails", bundle: "SecOps", description: "Security guardrail policies enforced across accounts" },
];

export const bundleColors: Record<BundleName, string> = {
  Core: "bundle-core",
  FinOps: "bundle-finops",
  CloudOps: "bundle-cloudops",
  SecOps: "bundle-secops",
};

export const cloudAccounts: CloudAccount[] = [
  { accountMasterName: "Synoptek", tenantName: "Abode", cloudAccountName: "Abode_Pay-As-You-Go", status: "active", inventoryCount: 11, budgetCount: 0, costPolicyCompleted: 613, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 2 },
  { accountMasterName: "Synoptek", tenantName: "ADL Delivery", cloudAccountName: "AdlDelivery_AzurePlan", status: "active", inventoryCount: 16, budgetCount: 0, costPolicyCompleted: 419, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 15 },
  { accountMasterName: "Synoptek", tenantName: "Advanced Management Solutions, LLC", cloudAccountName: "AdvancedManagementSolutions_AWS_37141345571", status: "active", inventoryCount: 570, budgetCount: 0, costPolicyCompleted: 320, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 4, activityLogCount: 0, threatsCount: 4, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 69 },
  { accountMasterName: "Synoptek", tenantName: "advbuildinginc.com", cloudAccountName: "AdvancedBuildingMaterials_AzurePlan", status: "active", inventoryCount: 12, budgetCount: 0, costPolicyCompleted: 388, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 0 },
  { accountMasterName: "Synoptek", tenantName: "AMCHAR WHOLESALE, INC.", cloudAccountName: "Amchar_AzurePlan", status: "active", inventoryCount: 29, budgetCount: 0, costPolicyCompleted: 520, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 1, recommendationResolved: 0, metricAlertCount: 97, activityLogCount: 0, threatsCount: 9, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 22 },
  { accountMasterName: "Synoptek", tenantName: "Arc3 Gases", cloudAccountName: "Arc3-Prod", status: "active", inventoryCount: 73, budgetCount: 0, costPolicyCompleted: 485, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 1, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 25 },
  { accountMasterName: "Synoptek", tenantName: "Arc3 Gases", cloudAccountName: "Arc3-Dev", status: "active", inventoryCount: 871, budgetCount: 1, costPolicyCompleted: 0, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 2, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 2 },
  { accountMasterName: "Synoptek", tenantName: "Arc3 Gases", cloudAccountName: "Arc3Gases_AzureSubscriptionCSP", status: "active", inventoryCount: 11, budgetCount: 0, costPolicyCompleted: 388, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 0 },
  { accountMasterName: "Synoptek", tenantName: "Arrive AI", cloudAccountName: "ArriveAI_Azure subscription 1 (2dd7f)", status: "active", inventoryCount: 8, budgetCount: 0, costPolicyCompleted: 0, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 0 },
  { accountMasterName: "Synoptek", tenantName: "Arrive AI", cloudAccountName: "ArriveAI_Azure subscription 1 (e83e)", status: "active", inventoryCount: 115, budgetCount: 0, costPolicyCompleted: 485, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 5 },
  { accountMasterName: "Synoptek", tenantName: "ArrowMark Partners", cloudAccountName: "ArrowMarkPartners_AzurePlan", status: "active", inventoryCount: 212, budgetCount: 0, costPolicyCompleted: 419, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 2, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 2, vulnerabilitiesCount: 4, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 26 },
  { accountMasterName: "Synoptek", tenantName: "Barcodes Inc", cloudAccountName: "Barcodesinc_AWS_056807390109", status: "active", inventoryCount: 2115, budgetCount: 0, costPolicyCompleted: 319, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 4, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 16, vulnerabilitiesCount: 6714, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 117 },
  { accountMasterName: "Synoptek", tenantName: "Barcodes Inc", cloudAccountName: "Barcodes_Cloud-Badging_AWS_841914132287", status: "active", inventoryCount: 236, budgetCount: 0, costPolicyCompleted: 320, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 1 },
  { accountMasterName: "Synoptek", tenantName: "Champion Window", cloudAccountName: "Azure_Champion_Window", status: "active", inventoryCount: 55, budgetCount: 0, costPolicyCompleted: 485, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 1, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 1199, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 22 },
  { accountMasterName: "Synoptek", tenantName: "CollegeofSouthernNevada", cloudAccountName: "sub-prod-csn", status: "active", inventoryCount: 2973, budgetCount: 0, costPolicyCompleted: 97, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 26, recommendationResolved: 1, metricAlertCount: 0, activityLogCount: 0, threatsCount: 2, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 439 },
  { accountMasterName: "Synoptek", tenantName: "CollegeofSouthernNevada", cloudAccountName: "sub-hub-csn", status: "active", inventoryCount: 1548, budgetCount: 0, costPolicyCompleted: 97, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 29, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 1, vulnerabilitiesCount: 189, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 83 },
  { accountMasterName: "Synoptek", tenantName: "CollegeofSouthernNevada", cloudAccountName: "sub-dev-csn", status: "active", inventoryCount: 1393, budgetCount: 0, costPolicyCompleted: 97, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 18, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 293, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 35 },
  { accountMasterName: "Synoptek", tenantName: "CollegeofSouthernNevada", cloudAccountName: "sub-uat-csn", status: "active", inventoryCount: 1255, budgetCount: 0, costPolicyCompleted: 97, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 14, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 190, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 25 },
  { accountMasterName: "Synoptek", tenantName: "CHCS Services INC", cloudAccountName: "Synoptek-CHCS_Production_AWS_682258877194", status: "active", inventoryCount: 1796, budgetCount: 0, costPolicyCompleted: 320, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 115 },
  { accountMasterName: "Synoptek", tenantName: "CHCS Services INC", cloudAccountName: "Synoptek-CHCS_LogArchive_AWS_062185791940", status: "active", inventoryCount: 994, budgetCount: 0, costPolicyCompleted: 320, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 0 },
  { accountMasterName: "Synoptek", tenantName: "CHCS Services INC", cloudAccountName: "ASC-CHCS-PROD", status: "active", inventoryCount: 975, budgetCount: 0, costPolicyCompleted: 400, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 2, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 13 },
  { accountMasterName: "Synoptek", tenantName: "KCC Manufacturing", cloudAccountName: "KCC_AzurePlan", status: "active", inventoryCount: 178, budgetCount: 0, costPolicyCompleted: 520, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 21, recommendationResolved: 0, metricAlertCount: 353, activityLogCount: 0, threatsCount: 4, vulnerabilitiesCount: 0, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 511 },
  { accountMasterName: "Synoptek", tenantName: "Great Gray, LLC", cloudAccountName: "GreatGrayLLC_GreatGray-CSP-Production", status: "active", inventoryCount: 244, budgetCount: 0, costPolicyCompleted: 388, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 6, recommendationResolved: 0, metricAlertCount: 15, activityLogCount: 0, threatsCount: 746, vulnerabilitiesCount: 396, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 115 },
  { accountMasterName: "Synoptek", tenantName: "Great Gray, LLC", cloudAccountName: "GreatGrayLLC_GreatGray-CSP-DevTest", status: "active", inventoryCount: 105, budgetCount: 1, costPolicyCompleted: 516, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 1, recommendationResolved: 0, metricAlertCount: 4, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 28 },
  { accountMasterName: "Synoptek", tenantName: "MedStar Health", cloudAccountName: "Medstar-AZ-PROD-SPOKE1-SUB_AzureEA", status: "active", inventoryCount: 983, budgetCount: 0, costPolicyCompleted: 516, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 1, recommendationResolved: 0, metricAlertCount: 48, activityLogCount: 0, threatsCount: 98, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 212 },
  { accountMasterName: "Synoptek", tenantName: "MedStar Health", cloudAccountName: "Medstar-AZ-DEV-SPOKE2-SUB_AzureEA", status: "active", inventoryCount: 627, budgetCount: 0, costPolicyCompleted: 419, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 33, activityLogCount: 0, threatsCount: 3, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 27 },
  { accountMasterName: "Synoptek", tenantName: "Supernal", cloudAccountName: "Supernal_Microsoft Azure", status: "active", inventoryCount: 5038, budgetCount: 0, costPolicyCompleted: 485, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 58, activityLogCount: 0, threatsCount: 153, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 1786 },
  { accountMasterName: "Synoptek", tenantName: "Highland Talent Payments", cloudAccountName: "HighlandTalentPayments_AWS_229760229677", status: "active", inventoryCount: 7297, budgetCount: 0, costPolicyCompleted: 320, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 2, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 0 },
  { accountMasterName: "Synoptek", tenantName: "Synoptek", cloudAccountName: "CovenantPhysicianPartners_AWS_912686263943", status: "active", inventoryCount: 2035, budgetCount: 0, costPolicyCompleted: 320, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 12 },
  { accountMasterName: "Synoptek", tenantName: "Mitsui Chemicals America, Inc.", cloudAccountName: "MitsuiChemicalsAmerica_738336204766", status: "active", inventoryCount: 475, budgetCount: 0, costPolicyCompleted: 320, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 1999, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 71 },
  { accountMasterName: "Synoptek", tenantName: "The Sequoia Project", cloudAccountName: "TheSequoiaProject_AWS_362440950925", status: "active", inventoryCount: 1691, budgetCount: 0, costPolicyCompleted: 316, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 1, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 51 },
  { accountMasterName: "Synoptek", tenantName: "Transportation Insight", cloudAccountName: "TransportationInsight_swanleap-prod", status: "active", inventoryCount: 1444, budgetCount: 0, costPolicyCompleted: 395, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 1 },
  { accountMasterName: "Synoptek", tenantName: "Transportation Insight", cloudAccountName: "TransportationInsight_swanleap-shared", status: "active", inventoryCount: 1870, budgetCount: 0, costPolicyCompleted: 312, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 0 },
  { accountMasterName: "Synoptek", tenantName: "Transportation Insight", cloudAccountName: "TransportationInsight_NTG-SUB-PROD-APPTEAM", status: "active", inventoryCount: 891, budgetCount: 0, costPolicyCompleted: 388, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 455, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 27 },
  { accountMasterName: "Synoptek", tenantName: "Transportation Insight", cloudAccountName: "TransportationInsight_NTG-SUB-STAGING-APPTEAM", status: "active", inventoryCount: 798, budgetCount: 0, costPolicyCompleted: 388, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 36, recommendationResolved: 0, metricAlertCount: 79, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 455 },
  { accountMasterName: "Synoptek", tenantName: "Transportation Insight", cloudAccountName: "TransportationInsight_IT", status: "active", inventoryCount: 43, budgetCount: 0, costPolicyCompleted: 388, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 36, recommendationResolved: 0, metricAlertCount: 6, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 287 },
  { accountMasterName: "Synoptek", tenantName: "Transportation Insight", cloudAccountName: "TransportationInsight_NTG-SUB-DEV-APPTEAM", status: "active", inventoryCount: 277, budgetCount: 0, costPolicyCompleted: 388, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 37, recommendationResolved: 0, metricAlertCount: 7, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 528 },
  { accountMasterName: "Synoptek", tenantName: "Hathaway Sycamores Child and Family Services", cloudAccountName: "HathawaySycamores_AzurePlan", status: "active", inventoryCount: 678, budgetCount: 0, costPolicyCompleted: 388, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 1, recommendationResolved: 0, metricAlertCount: 3, activityLogCount: 0, threatsCount: 6, vulnerabilitiesCount: 0, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 26 },
  { accountMasterName: "Synoptek", tenantName: "Student Transportation Inc", cloudAccountName: "StudentTransportation_AzurePlan", status: "active", inventoryCount: 1266, budgetCount: 0, costPolicyCompleted: 419, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 2, recommendationResolved: 0, metricAlertCount: 3, activityLogCount: 0, threatsCount: 4, vulnerabilitiesCount: 8, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 67 },
  { accountMasterName: "Synoptek", tenantName: "Synoptek Inc", cloudAccountName: "Synoptek_Inc_Azure_Plan", status: "active", inventoryCount: 11, budgetCount: 0, costPolicyCompleted: 0, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 19736, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 0 },
  { accountMasterName: "Synoptek", tenantName: "Synoptek - D365 Sandboxes", cloudAccountName: "SynoptekD365Sandbox_E-T-ACircuitBreakers-Azure", status: "active", inventoryCount: 0, budgetCount: 0, costPolicyCompleted: 0, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 1977, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 0 },
  { accountMasterName: "Synoptek", tenantName: "Callan", cloudAccountName: "Callan_AWS_315912960336", status: "active", inventoryCount: 480, budgetCount: 0, costPolicyCompleted: 316, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 8, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 57 },
  { accountMasterName: "Synoptek", tenantName: "Moss Motors, Ltd", cloudAccountName: "MossMotorsLtd_AzurePlan", status: "active", inventoryCount: 154, budgetCount: 0, costPolicyCompleted: 516, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 3, recommendationResolved: 0, metricAlertCount: 1, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 119 },
  { accountMasterName: "Synoptek", tenantName: "Credit Bureau Strategy Consulting LLC", cloudAccountName: "DigitalMatrixSystems-CBSCM2E", status: "active", inventoryCount: 16, budgetCount: 0, costPolicyCompleted: 388, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 30, recommendationResolved: 0, metricAlertCount: 10, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 2, templateJobCompleted: 0, securityGuardrailCount: 96 },
  { accountMasterName: "Synoptek", tenantName: "CDI Corporation", cloudAccountName: "CDICorporation_AzurePlan", status: "active", inventoryCount: 18, budgetCount: 0, costPolicyCompleted: 520, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 4, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 32 },
  { accountMasterName: "Synoptek", tenantName: "Quad-C Management", cloudAccountName: "Quad-C_Management-AzureSubscriptionCSP", status: "active", inventoryCount: 8, budgetCount: 0, costPolicyCompleted: 516, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 1, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 56, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 4 },
  { accountMasterName: "Synoptek", tenantName: "Werner Corp", cloudAccountName: "WernerCorp_AzurePlan", status: "active", inventoryCount: 52, budgetCount: 0, costPolicyCompleted: 516, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 6, vulnerabilitiesCount: 10, complianceAssessmentCount: 0, templateJobCompleted: 0, securityGuardrailCount: 10 },
  { accountMasterName: "Synoptek", tenantName: "transportationone.com", cloudAccountName: "TransportationOne_AzureSubscriptionCSP", status: "active", inventoryCount: 13, budgetCount: 0, costPolicyCompleted: 419, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 30, recommendationResolved: 0, metricAlertCount: 54, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 317 },
  { accountMasterName: "Synoptek", tenantName: "BridgesExperience,Inc", cloudAccountName: "BridgesExperience_PackageCode Middleware Production", status: "active", inventoryCount: 105, budgetCount: 0, costPolicyCompleted: 485, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 0, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 5 },
  { accountMasterName: "Synoptek", tenantName: "BridgesExperience,Inc", cloudAccountName: "BridgesExperience_Production", status: "active", inventoryCount: 24, budgetCount: 0, costPolicyCompleted: 485, scheduleTotal: 0, costAnomalyNotificationCount: 0, recommendationOpen: 0, recommendationResolved: 0, metricAlertCount: 0, activityLogCount: 0, threatsCount: 0, vulnerabilitiesCount: 89, complianceAssessmentCount: 1, templateJobCompleted: 0, securityGuardrailCount: 11 },
];

export const tenantSummaries: TenantSummary[] = [
  { tenantName: "Abode", status: "active", totalCloudAccounts: 1, active: 1, inactive: 0, notOnboarded: 0, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "ADL Delivery", status: "active", totalCloudAccounts: 2, active: 1, inactive: 0, notOnboarded: 1, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Advanced Management Solutions, LLC", status: "active", totalCloudAccounts: 1, active: 1, inactive: 0, notOnboarded: 0, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "AMCHAR WHOLESALE, INC.", status: "active", totalCloudAccounts: 2, active: 1, inactive: 0, notOnboarded: 1, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Arc3 Gases", status: "active", totalCloudAccounts: 4, active: 3, inactive: 0, notOnboarded: 1, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Arrive AI", status: "active", totalCloudAccounts: 2, active: 2, inactive: 0, notOnboarded: 0, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "ArrowMark Partners", status: "active", totalCloudAccounts: 3, active: 1, inactive: 0, notOnboarded: 2, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "AssuriCareADTenant", status: "active", totalCloudAccounts: 10, active: 7, inactive: 0, notOnboarded: 3, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Barcodes Inc", status: "active", totalCloudAccounts: 7, active: 2, inactive: 1, notOnboarded: 4, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "BridgesExperience,Inc", status: "active", totalCloudAccounts: 13, active: 10, inactive: 0, notOnboarded: 3, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "CHCS Services INC", status: "active", totalCloudAccounts: 19, active: 13, inactive: 0, notOnboarded: 6, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Champion Window", status: "active", totalCloudAccounts: 8, active: 2, inactive: 0, notOnboarded: 6, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "CollegeofSouthernNevada", status: "active", totalCloudAccounts: 5, active: 4, inactive: 0, notOnboarded: 1, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Evo 1", status: "active", totalCloudAccounts: 5, active: 3, inactive: 0, notOnboarded: 2, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Great Gray, LLC", status: "active", totalCloudAccounts: 3, active: 2, inactive: 0, notOnboarded: 1, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "KCC Manufacturing", status: "active", totalCloudAccounts: 2, active: 1, inactive: 0, notOnboarded: 1, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "MedStar Health", status: "active", totalCloudAccounts: 21, active: 11, inactive: 0, notOnboarded: 10, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Mitsui Chemicals America, Inc.", status: "active", totalCloudAccounts: 12, active: 8, inactive: 0, notOnboarded: 4, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Student Transportation Inc", status: "active", totalCloudAccounts: 6, active: 3, inactive: 0, notOnboarded: 2, notOnboardedValidated: 1, notValidated: 0 },
  { tenantName: "Supernal", status: "active", totalCloudAccounts: 2, active: 2, inactive: 0, notOnboarded: 0, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Synoptek", status: "active", totalCloudAccounts: 610, active: 5, inactive: 3, notOnboarded: 602, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Transportation Insight", status: "active", totalCloudAccounts: 56, active: 34, inactive: 0, notOnboarded: 22, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Highland Talent Payments", status: "active", totalCloudAccounts: 1, active: 1, inactive: 0, notOnboarded: 0, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "The Sequoia Project", status: "active", totalCloudAccounts: 1, active: 1, inactive: 0, notOnboarded: 0, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Callan", status: "active", totalCloudAccounts: 1, active: 1, inactive: 0, notOnboarded: 0, notOnboardedValidated: 0, notValidated: 0 },
  { tenantName: "Werner Corp", status: "active", totalCloudAccounts: 1, active: 1, inactive: 0, notOnboarded: 0, notOnboardedValidated: 0, notValidated: 0 },
];

// Helper to get totals per feature (optionally from filtered accounts)
export function getFeatureTotal(key: keyof CloudAccount, accounts?: CloudAccount[]): number {
  const data = accounts || cloudAccounts;
  return data.reduce((sum, a) => sum + (Number(a[key]) || 0), 0);
}

// Helper to get totals per bundle
export function getBundleTotals(accounts?: CloudAccount[]): Record<BundleName, number> {
  const totals: Record<BundleName, number> = { Core: 0, FinOps: 0, CloudOps: 0, SecOps: 0 };
  featureConfigs.forEach(f => {
    totals[f.bundle] += getFeatureTotal(f.key, accounts);
  });
  return totals;
}

// Get top tenants by a feature (optionally from filtered accounts)
export function getTopTenantsByFeature(key: keyof CloudAccount, limit = 10, accounts?: CloudAccount[]) {
  const data = accounts || cloudAccounts;
  const tenantMap = new Map<string, number>();
  data.forEach(a => {
    const val = Number(a[key]) || 0;
    tenantMap.set(a.tenantName, (tenantMap.get(a.tenantName) || 0) + val);
  });
  return Array.from(tenantMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .filter(t => t.value > 0);
}

// Non-inventory feature configs (for cost projection)
export const costFeatureConfigs = featureConfigs.filter(f => f.key !== "inventoryCount");
