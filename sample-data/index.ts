// sample-data/index.ts
//
// Central barrel for all sample data used across the application.
// Import from "@/sample-data" instead of individual files for convenience.
//
// NOTE: These are static sample records. To connect a live backend later,
// swap the underlying implementation in each file (or this barrel) with API
// calls — the exported shapes are intentionally kept stable & typed.

export * from "./patients";
export * from "./admissions";
export * from "./billing";
export * from "./lab-orders";
export * from "./pharmacy-orders";
export * from "./emergency";
export * from "./beds";
export * from "./treatment-plans";
