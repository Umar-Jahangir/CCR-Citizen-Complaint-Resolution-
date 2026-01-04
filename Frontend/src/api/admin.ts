const API_BASE = "http://127.0.0.1:8000";

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`);
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export async function fetchAdminGrievances(
  status?: string,
  priority?: string
) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  if (priority && priority !== "all") params.append("priority", priority);

  const res = await fetch(`${API_BASE}/admin/grievances?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load grievances");
  return res.json();
}

export async function fetchAdminGrievance(ticketId: string) {
  const res = await fetch(`${API_BASE}/admin/grievances/${ticketId}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export async function updateGrievanceStatus(ticketId: string, status: string) {
  const res = await fetch(
    `${API_BASE}/admin/grievances/${ticketId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );
  if (!res.ok) throw new Error("Failed to update status");
}

export async function fetchAdminAnalytics() {
  const res = await fetch("http://127.0.0.1:8000/admin/analytics");
  return res.json();
}