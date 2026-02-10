  export const sacramentMap: Record<string, string> = {
    Baptism: "BAPTISM",
    "First Communion": "EUCHARIST",
    Confirmation: "CONFIRMATION",
    Matrimony: "MATRIMONY",
  };

  export const DEFAULT_FORMATIONS = [
    "Basic Orientation Seminar (BOS)",
    "Diocesan Basic Formation",
    "Safeguarding Policy",
  ];
  export const CURRENT_YEAR = new Date().getFullYear();
  export const YEARS = Array.from(
  { length: CURRENT_YEAR - 1900 + 1 },
  (_, i) => CURRENT_YEAR - i,
);