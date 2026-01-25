import { useEffect, useState } from "react";
import { fetchJobById } from "../../utils/api"; 
import "./JobDetailsPanel.css";

export function JobDetailsPanel({ job, onClose }) {
  const [fetchedJob, setFetchedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!job) return;

    let isMounted = true;

    async function loadJob() {
      try {
        setLoading(true);
        const data = await fetchJobById(job.id);
        if (isMounted) setFetchedJob(data);
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load job details");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [job]);

  return (
    <div className="job-details-panel">
      <div className="panel-header">
        <h3>Job Details</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="panel-content">
        {loading && <p>Loading job details…</p>}
        {error && <p className="error">{error}</p>}

        {!loading && job && (
          <>
            <Detail label="Job ID" value={fetchedJob.id} />
            <Detail 
              label="Status" 
              value={
                <StatusBadge status={fetchedJob.status} />
              } 
            />
            <Detail label="Retries" value={fetchedJob.retry_count} />
            <Detail label="Worker" value={fetchedJob.worker_id || "-"} />
            <Detail 
              label="Leased until" 
              value={ fetchedJob.leased_until ? new Date(fetchedJob.leased_until).toLocaleString() : "-"} 
            />
            <Detail
              label="Created At"
              value={new Date(fetchedJob.created_at).toLocaleString()}
            />
            <Detail
              label="Updated At"
              value={new Date(fetchedJob.updated_at).toLocaleString()}
            />

            <h4>Payload</h4>
            <pre>{JSON.stringify(fetchedJob.payload, null, 2)}</pre>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if(!status) return "-";

  return (
    <span className={`status-badge status-${status}`}>
      {status}
    </span>
  )
}

function Detail({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}
