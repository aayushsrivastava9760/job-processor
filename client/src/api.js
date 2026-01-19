const API_BASE = "http://localhost:4000"
const API_KEY = "user-1-key"

export async function fetchJobs(status) {
    const url = new URL(`${API_BASE}/jobs`);
    if (status) url.searchParams.set("status", status);

    const res = await fetch(url, {
        headers: {
        Authorization: `Bearer ${API_KEY}`,
        },
    })

    const data = await res.json()
    return data.jobs
}

export async function fetchJobById(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch job details");
  }

  const data = await res.json();
  return data;
}

export async function submitJob(payload){
    console.log(payload)
    const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
    })

    return res.json()
}

export async function fetchMetrics(){
    const res = await fetch(`${API_BASE}/metrics`, {
        headers: {
        Authorization: `Bearer ${API_KEY}`,
        },
    });

    return res.json();
}
