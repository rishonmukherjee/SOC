import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const COLOR_STYLES = {
  red: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    accent: "bg-red-500",
  },
  green: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    accent: "bg-emerald-500",
  },
  blue: {
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    accent: "bg-sky-500",
  },
  yellow: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    accent: "bg-amber-500",
  },
};

function TrendIcon({ change }) {
  const trimmed = change.trim();

  if (trimmed.startsWith("+")) {
    return <TrendingUp size={12} strokeWidth={2.5} />;
  }

  if (trimmed.startsWith("-")) {
    return <TrendingDown size={12} strokeWidth={2.5} />;
  }

  return <Minus size={12} strokeWidth={2.5} />;
}

function StatCard({
  title,
  value,
  change,
  color = "blue",
  icon: Icon,
}) {
  const c = COLOR_STYLES[color] ?? COLOR_STYLES.blue;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40 p-6 backdrop-blur-sm transition-all duration-200 hover:border-gray-700 hover:bg-gray-900/60">
      
      {/* Accent Line */}
      <span
        className={`absolute inset-x-0 top-0 h-[2px] ${c.accent} opacity-70`}
      />

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white tabular-nums">
            {value}
          </h2>
        </div>

      </div>

      <div className="mt-5 flex flex-col items-start gap-3">

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-tight ${c.text} ${c.bg} ${c.border}`}
        >
          <span className="shrink-0 flex items-center">
            <TrendIcon change={change} />
          </span>
          <span>{change}</span>
        </span>

        <span className="text-[11px] text-gray-500">
          Updated just now
        </span>

      </div>

    </div>
  );
}

export default StatCard;