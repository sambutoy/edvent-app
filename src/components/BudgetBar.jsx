import { fmtPeso, getBudgetPercent } from "../constants/helpers";

export default function BudgetBar({ spent, total }) {
  const pct = total > 0 ? Math.min(100, getBudgetPercent(spent, total)) : 0;
  const over = spent > total && total > 0;
  return (
    <div className="budget">
      <div className="budget-track">
        <div
          className={`budget-fill ${over ? "is-over" : ""}`}
          style={{ width: pct + "%" }}
        />
      </div>
      <div className="budget-meta">
        <span className={over ? "is-over" : ""}>{fmtPeso(spent)} spent</span>
        <span>{pct}% of {fmtPeso(total)}</span>
      </div>
    </div>
  );
}
