export const fmtDate = (d) => {
  if (!d) return "TBD";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d;
  }
};

export const fmtPeso = (n) => "PHP " + Number(n || 0).toLocaleString("en-PH");

export const getEventSpend = (event) =>
  Object.values(event.categories || {}).reduce(
    (sum, category) =>
      sum + category.items.reduce((items, item) => items + (item.cost || 0), 0),
    0
  );

export const getEventItemCount = (event) =>
  Object.values(event.categories || {}).reduce(
    (sum, category) => sum + category.items.length,
    0
  );

export const getDaysUntil = (date) => {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date + "T00:00:00");
  return Math.ceil((target - today) / 86400000);
};

export const getBudgetPercent = (spent, total) =>
  total > 0 ? Math.round((spent / total) * 100) : 0;

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "EV";

export const aColor = (name = "EdVent") =>
  ["#0F9E8E", "#1B5EA8", "#E8A020", "#7B3FA0", "#C0392B", "#0B7A6E", "#1B3A6B"][
    name.charCodeAt(0) % 7
  ];
