import { useCallback, useId } from "react";
import { zh } from "../i18n/zh";

export type AppTab = "home" | "todo" | "trends" | "fast" | "pet";

type Props = {
  tab: AppTab;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
};

const TAB_META: Record<AppTab, { emoji: string; subtitle: string }> = {
  home: {
    emoji: "🌿",
    subtitle: zh.subtitleHome,
  },
  todo: {
    emoji: "📝",
    subtitle: zh.subtitleTodo,
  },
  trends: {
    emoji: "📈",
    subtitle: zh.subtitleTrends,
  },
  fast: {
    emoji: "🍽️",
    subtitle: zh.subtitleFast,
  },
  pet: {
    emoji: "🏠",
    subtitle: zh.subtitlePet,
  },
};

export function AppHeader({ tab, displayName, onDisplayNameChange }: Props) {
  const meta = TAB_META[tab];
  const id = useId();
  const onNameInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onDisplayNameChange(e.target.value);
    },
    [onDisplayNameChange],
  );

  return (
    <header className="app-header app-header--fun">
      <div className="app-header__row">
        <span className="app-header__emoji" aria-hidden>
          {meta.emoji}
        </span>
        <div className="app-header__titles">
          <h1 className="app-header__title">
            <label htmlFor={id} className="sr-only">
              {zh.nameLabel}
            </label>
            <span className="app-header__title-line">
              <input
                id={id}
                className="app-name-input"
                type="text"
                value={displayName}
                onChange={onNameInput}
                maxLength={20}
                spellCheck={false}
                autoComplete="nickname"
                placeholder={zh.defaultName}
              />
              <span className="app-header__title-suffix">{zh.titleSuffix[tab]}</span>
            </span>
          </h1>
          <p className="app-header__subtitle">{meta.subtitle}</p>
        </div>
      </div>
    </header>
  );
}
