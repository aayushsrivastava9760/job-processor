import './MetricCard.css'

function getMetricColor(label) {
  const key = label.toLowerCase();

  if (key.includes("pending")) return "metric-pending";
  if (key.includes("running")) return "metric-running";
  if (key.includes("done")) return "metric-done";
  if (key.includes("failed")) return "metric-failed";
  if (key.includes("dlq")) return "metric-dlq";
  if (key.includes("retry")) return "metric-retry";

  return "metric-default";
}

export const  MetricCard = ({ label, value }) => {
  const colorClass = getMetricColor(label);

  return (
    <div className={`metric-card ${colorClass}`}>
      <div className="metric-value">{value || 0}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}