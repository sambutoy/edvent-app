import { C } from "../constants/colors";
import Icon from "./Icon";

export function Toast({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map(t => {
        const cfg = {
          success: { icon: "checkCircle", color: C.teal,   bg: C.tealLight },
          error:   { icon: "xCircle",     color: C.danger, bg: C.dangerLight },
          info:    { icon: "infoCircle",  color: C.navy,   bg: C.navyLight },
        }[t.type] || { icon: "infoCircle", color: C.navy, bg: C.navyLight };
        return (
          <div key={t.id} className="toast" style={{ borderLeftColor: cfg.color }}>
            <div className="toast-icon" style={{ background: cfg.bg }}>
              <Icon name={cfg.icon} size={15} color={cfg.color} />
            </div>
            <span className="toast-message">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
