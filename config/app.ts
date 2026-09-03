export const APP_CONFIG = {
  name: "LTC HMS",
  brand: "LTC HMS",
  hospitalName: "LTC Multispeciality Hospital",
  hospitalBrand: "LTC HMS",
  hospitalSubtitle: "Hospital Management System",
  helpEmail: "support@ltchms.example",
  helpHotline: "1800-000-0000",
} as const;

export type AppConfig = typeof APP_CONFIG;
