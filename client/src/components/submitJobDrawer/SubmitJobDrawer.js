import { useState } from "react";
import "./SubmitJobDrawer.css";

export function SubmitJobDrawer({ onClose, onSubmit }) {
  const [payloadText, setPayloadText] = useState(
    JSON.stringify({ value: "demo text" }, null, 2)
  );
  const [error, setError] = useState(null);

  function handleSubmit() {
    try {
      const parsed = JSON.parse(payloadText);
      onSubmit({
        payload: parsed,
      });
    } catch (e) {
      setError("Invalid JSON payload");
    }
  }

  return (
    <div className="submit-drawer">
      <div className="panel-header">
        <h3>Submit Job</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="panel-content">
        <label>Payload (JSON)</label>
        <textarea
          value={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
          rows={12}
        />

        {error && <p className="error-text">{error}</p>}

        <div className="drawer-actions">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" onClick={handleSubmit}>
            Submit Job
          </button>
        </div>
      </div>
    </div>
  );
}
