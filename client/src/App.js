import { useEffect, useState } from "react";
import { fetchJobs, submitJob, fetchMetrics } from "./api";
import { JobTable } from "./components/jobTable/JobTable";
import "./App.css";
import { MetricCard } from "./components/metricCard/MetricCard";
import { JobDetailsPanel } from "./components/jobDetailsPanel/JobDetailsPanel";

function App() {
  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);

  async function load() {
    setJobs(await fetchJobs());
    setMetrics(await fetchMetrics());
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit() {
    await submitJob({ payload: { value: Math.random() } });
    load();
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Distributed Job Queue</h1>
        <p>Prototype job processing system with workers & retries</p>
      </header>

      <div className="toolbar">
        <button className="primary-btn" onClick={handleSubmit}>
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
    </div>
  );
}

export default App;
