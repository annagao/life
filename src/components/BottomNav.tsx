import { zh } from "../i18n/zh";
import type { AppTab } from "./AppHeader";

const items: { id: AppTab; label: string; icon: string }[] = [
  { id: "home", label: zh.navHome, icon: "🏠" },
  { id: "trends", label: zh.navTrends, icon: "📈" },
  { id: "fast", label: zh.navFast, icon: "⏱" },
  { id: "todo", label: zh.navTodo, icon: "✓" },
  { id: "pet", label: zh.navPet, icon: "🦮" },
];

type Props = {
  active: AppTab;
  onChange: (t: AppTab) => void;
};

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {items.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          className={`nav-btn ${active === id ? "active" : ""}`}
          onClick={() => onChange(id)}
          aria-current={active === id ? "page" : undefined}
        >
          <span className="nav-icon" aria-hidden>
            {icon}
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}
