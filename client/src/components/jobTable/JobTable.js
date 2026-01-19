import "./JobTable.css";

export const JobTable = ({ jobs = [], status, onJobClick }) => {
  const filteredJobs = jobs.filter((job) => job.status === status);

  return (
    <div className="job-table-container">
      <h2 className={`job-table-title ${status.toLowerCase()}`}>
        {status} Jobs ({filteredJobs.length})
      </h2>

      {filteredJobs.length === 0 ? (
        <p className="empty-text">No {status.toLowerCase()} jobs</p>
      ) : (
        <table className="job-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Retries</th>
              <th>Worker</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr 
                key={job.id}
                className="clickable-row"
                onClick={() => onJobClick(job)}
              >
                <td className="mono">{job.id.slice(0, 8)}</td>
                <td>
                  <span className={`status-badge ${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </td>
                <td>{job.retry_count}</td>
                <td>{job.worker_id || "-"}</td>
                <td>
                  {new Date(job.created_at).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
