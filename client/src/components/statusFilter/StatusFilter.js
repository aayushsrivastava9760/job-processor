const STATUSES = [
  "",
  "PENDING",
  "RUNNING",
  "DONE",
  "FAILED",
  "DLQ",
];

export const StatusFilter = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: 10 }}>
      <label>Status: </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s || "ALL"}
          </option>
        ))}
      </select>
    </div>
  );
}
