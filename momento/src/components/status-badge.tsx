type StatusBadgeProps = {
  label: string;
  tone?: "default" | "good" | "warn" | "critical";
};

export function StatusBadge({ label, tone = "default" }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${tone}`}>{label}</span>;
}
