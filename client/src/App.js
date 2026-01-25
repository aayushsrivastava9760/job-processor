import { useEffect, useState } from "react";
import { fetchJobs, submitJob, fetchMetrics } from "./utils/api";
import { JobTable } from "./components/jobTable/JobTable";
import "./App.css";
import { MetricCard } from "./components/metricCard/MetricCard";
import { JobDetailsPanel } from "./components/jobDetailsPanel/JobDetailsPanel";
import { SubmitJobDrawer } from "./components/submitJobDrawer/SubmitJobDrawer";
import { POLLING_TIME_MS } from "./utils/constants";

function App() {
  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  async function load() {
    setJobs(await fetchJobs());
    setMetrics(await fetchMetrics());
  }

  useEffect(() => {
    load();
    const id = setInterval(load, POLLING_TIME_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Distributed Job Queue</h1>
        <p>Prototype job processing system with workers & retries</p>
      </header>

      <div className="toolbar">
        <button
          className="primary-btn"
          onClick={() => setIsSubmitOpen(true)}
        >
          + Submit Job
        </button>
      </div>

      <div className="metrics-grid">
        <MetricCard label="Pending" value={metrics.pending_jobs} />
        <MetricCard label="Running" value={metrics.running_jobs} />
        <MetricCard label="Done" value={metrics.done_jobs} />
        <MetricCard label="Failed" value={metrics.failed_jobs} />
        <MetricCard label="DLQ" value={metrics.dlq_jobs} />
        <MetricCard label="Total Jobs" value={metrics.total_jobs} />
      </div>

      <JobTable jobs={jobs} status="PENDING" onJobClick={setSelectedJob} />
      <JobTable jobs={jobs} status="RUNNING" onJobClick={setSelectedJob} />
      <JobTable jobs={jobs} status="DONE" onJobClick={setSelectedJob} />
      <JobTable jobs={jobs} status="FAILED" onJobClick={setSelectedJob} />
      <JobTable jobs={jobs} status="DLQ" onJobClick={setSelectedJob} />

      {selectedJob && (
        <>
        <div className="drawer-backdrop" onClick={() => setSelectedJob(null)} />
        <JobDetailsPanel
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
        </>
      )}

      {isSubmitOpen && (
        <>
          <div
            className="drawer-backdrop"
            onClick={() => setIsSubmitOpen(false)}
          />
          <SubmitJobDrawer
            onClose={() => setIsSubmitOpen(false)}
            onSubmit={async (payload) => {
              await submitJob(payload);
              setIsSubmitOpen(false);
              load();
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;
