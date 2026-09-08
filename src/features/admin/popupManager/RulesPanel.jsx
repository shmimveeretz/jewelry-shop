import {
  DEVICES,
  GOAL_OPTIONS,
  LANGUAGES,
  TRIGGER_OPTIONS,
} from "./popupDefaults";

/** Comma-separated text in the UI, string array on the wire. */
function ListField({ label, hint, value, onChange, placeholder }) {
  return (
    <label className="admin-field">
      <span className="admin-field__label">
        {label} {hint ? <em>{hint}</em> : null}
      </span>
      <input
        type="text"
        dir="ltr"
        placeholder={placeholder}
        value={(value || []).join(", ")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split(",")
              .map((entry) => entry.trim())
              .filter(Boolean),
          )
        }
      />
    </label>
  );
}

function CheckGroup({ label, options, value, onChange }) {
  const selected = value || [];

  const toggle = (option) =>
    onChange(
      selected.includes(option)
        ? selected.filter((entry) => entry !== option)
        : [...selected, option],
    );

  return (
    <div className="admin-field">
      <span className="admin-field__label">{label}</span>
      <div className="admin-field__icons">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`admin-field__icon ${
              selected.includes(option.value) ? "is-on" : ""
            }`}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Datetime-local wants a local `YYYY-MM-DDTHH:mm`, Mongo hands back an ISO string. */
const toLocalInput = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

function RulesPanel({ popup, onChange }) {
  const patch = (section, key, value) =>
    onChange({ ...popup, [section]: { ...popup[section], [key]: value } });

  // `schedule` is the one section the Mongoose schema declares without a
  // default on any subfield, so a popup that has never been given a start or
  // end date comes back from the API with the key absent entirely.
  const { trigger, targeting, frequency, schedule = {}, abTest } = popup;

  return (
    <div className="popup-rules">
      <div className="dpp-panel">
        <h3 className="dpp-panel__title">הפעלה</h3>
        <div className="dpp-panel__fields">
          <label className="admin-field">
            <span className="admin-field__label">טריגר</span>
            <select
              value={trigger.type}
              onChange={(event) => patch("trigger", "type", event.target.value)}
            >
              {TRIGGER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {trigger.type === "timeDelay" || trigger.type === "idle" ? (
            <label className="admin-field">
              <span className="admin-field__label">
                השהייה (שניות){" "}
                <em>
                  {trigger.type === "idle"
                    ? "זמן ללא תנועה, גלילה או הקלדה"
                    : "מהרגע שהעמוד נטען"}
                </em>
              </span>
              <input
                type="number"
                min={0}
                max={600}
                value={Math.round((trigger.delayMs ?? 5000) / 1000)}
                onChange={(event) =>
                  patch("trigger", "delayMs", Number(event.target.value) * 1000)
                }
              />
            </label>
          ) : null}

          {trigger.type === "scrollDepth" ? (
            <label className="admin-field">
              <span className="admin-field__label">אחוז גלילה</span>
              <input
                type="number"
                min={1}
                max={100}
                value={trigger.scrollPercent ?? 50}
                onChange={(event) =>
                  patch("trigger", "scrollPercent", Number(event.target.value))
                }
              />
            </label>
          ) : null}

          {trigger.type === "exitIntent" ? (
            <p className="admin-field__hint">
              כוונת יציאה נשענת על תנועת עכבר אל מחוץ לחלון, ולכן לא קיימת
              במובייל. במובייל השתמשו בגלילה או בחוסר פעילות.
            </p>
          ) : null}

          <label className="admin-field">
            <span className="admin-field__label">
              עדיפות <em>גבוה יותר מנצח כששני פופאפים מתאימים</em>
            </span>
            <input
              type="number"
              min={-100}
              max={100}
              value={popup.priority}
              onChange={(event) =>
                onChange({ ...popup, priority: Number(event.target.value) })
              }
            />
          </label>
        </div>
      </div>

      <div className="dpp-panel">
        <h3 className="dpp-panel__title">קהל יעד</h3>
        <div className="dpp-panel__fields">
          <CheckGroup
            label="מכשירים"
            options={DEVICES}
            value={targeting.devices}
            onChange={(value) => patch("targeting", "devices", value)}
          />
          <CheckGroup
            label="שפות"
            options={LANGUAGES}
            value={targeting.languages}
            onChange={(value) => patch("targeting", "languages", value)}
          />

          <ListField
            label="נתיבים מותרים"
            hint="ריק = כל האתר. תומך בכוכבית: /lp/*"
            placeholder="/, /shop, /lp/*"
            value={targeting.includePaths}
            onChange={(value) => patch("targeting", "includePaths", value)}
          />
          <ListField
            label="נתיבים חסומים"
            hint="כדאי לחסום עמודי תשלום"
            placeholder="/checkout, /payment"
            value={targeting.excludePaths}
            onChange={(value) => patch("targeting", "excludePaths", value)}
          />
          <ListField
            label="מקורות הפניה"
            hint="דומיין מפנה, למשל facebook.com"
            placeholder="facebook.com, instagram.com"
            value={targeting.referrers}
            onChange={(value) => patch("targeting", "referrers", value)}
          />
          <ListField
            label="מקורות הפניה חסומים"
            value={targeting.excludeReferrers}
            onChange={(value) => patch("targeting", "excludeReferrers", value)}
          />
          <ListField
            label="utm_source"
            placeholder="meta, google"
            value={targeting.utmSource}
            onChange={(value) => patch("targeting", "utmSource", value)}
          />

          <label className="admin-field admin-field--inline">
            <input
              type="checkbox"
              checked={Boolean(targeting.newVisitorsOnly)}
              onChange={(event) =>
                patch("targeting", "newVisitorsOnly", event.target.checked)
              }
            />
            <span className="admin-field__label">מבקרים חדשים בלבד</span>
          </label>
        </div>
      </div>

      <div className="dpp-panel">
        <h3 className="dpp-panel__title">תדירות</h3>
        <div className="dpp-panel__fields">
          <label className="admin-field">
            <span className="admin-field__label">
              מזהה תדירות <em>נשמר אצל המבקר, שינוי שלו מאפס את ההיסטוריה</em>
            </span>
            <input
              type="text"
              dir="ltr"
              value={frequency.storageKey || ""}
              onChange={(event) =>
                patch("frequency", "storageKey", event.target.value)
              }
            />
          </label>

          <label className="admin-field admin-field--inline">
            <input
              type="checkbox"
              checked={frequency.showOncePerVisitor !== false}
              onChange={(event) =>
                patch("frequency", "showOncePerVisitor", event.target.checked)
              }
            />
            <span className="admin-field__label">
              פעם אחת למבקר שהמיר או סגר
            </span>
          </label>

          <label className="admin-field">
            <span className="admin-field__label">
              צינון (ימים) <em>לפני שמבקר שסגר יראה שוב</em>
            </span>
            <input
              type="number"
              min={0}
              max={365}
              value={frequency.cooldownDays ?? 30}
              onChange={(event) =>
                patch("frequency", "cooldownDays", Number(event.target.value))
              }
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">מקסימום הצגות בביקור</span>
            <input
              type="number"
              min={1}
              max={10}
              value={frequency.maxImpressionsPerSession ?? 1}
              onChange={(event) =>
                patch(
                  "frequency",
                  "maxImpressionsPerSession",
                  Number(event.target.value),
                )
              }
            />
          </label>
        </div>
      </div>

      <div className="dpp-panel">
        <h3 className="dpp-panel__title">תזמון ובדיקת A/B</h3>
        <div className="dpp-panel__fields">
          <label className="admin-field">
            <span className="admin-field__label">התחלה</span>
            <input
              type="datetime-local"
              value={toLocalInput(schedule.startAt)}
              onChange={(event) =>
                patch(
                  "schedule",
                  "startAt",
                  event.target.value
                    ? new Date(event.target.value).toISOString()
                    : undefined,
                )
              }
            />
          </label>

          <label className="admin-field">
            <span className="admin-field__label">סיום</span>
            <input
              type="datetime-local"
              value={toLocalInput(schedule.endAt)}
              onChange={(event) =>
                patch(
                  "schedule",
                  "endAt",
                  event.target.value
                    ? new Date(event.target.value).toISOString()
                    : undefined,
                )
              }
            />
          </label>

          <label className="admin-field admin-field--inline">
            <input
              type="checkbox"
              checked={Boolean(abTest.enabled)}
              onChange={(event) =>
                patch("abTest", "enabled", event.target.checked)
              }
            />
            <span className="admin-field__label">בדיקת A/B פעילה</span>
          </label>

          {abTest.enabled ? (
            <>
              <label className="admin-field">
                <span className="admin-field__label">
                  פיצול לפי{" "}
                  <em>מבקר = אותו וריאנט תמיד, ביקור = מתחלף בין ביקורים</em>
                </span>
                <select
                  value={abTest.splitBy || "visitor"}
                  onChange={(event) =>
                    patch("abTest", "splitBy", event.target.value)
                  }
                >
                  <option value="visitor">מבקר</option>
                  <option value="session">ביקור</option>
                </select>
              </label>

              <label className="admin-field">
                <span className="admin-field__label">מדד הצלחה</span>
                <select
                  value={abTest.goal || "ctaClick"}
                  onChange={(event) =>
                    patch("abTest", "goal", event.target.value)
                  }
                >
                  {GOAL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default RulesPanel;
