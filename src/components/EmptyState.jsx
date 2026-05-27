import { C } from "../constants/colors";
import Icon from "./Icon";

export default function EmptyState({ icon, message, sub }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} size={24} color={C.teal} />
      </div>
      <p className="empty-title">{message}</p>
      {sub && <p className="empty-sub">{sub}</p>}
    </div>
  );
}
