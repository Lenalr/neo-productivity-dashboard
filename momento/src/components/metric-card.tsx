type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "good" | "warn" | "critical";
};

export function MetricCard({ label, value, hint, tone = "default" }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{hint}</span>
    </article>
  );
}
