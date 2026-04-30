const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

async function request(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }
  return data;
}

export async function fetchReports() {
  return request("/api/reports");
}

export async function fetchSchools() {
  return request("/api/schools");
}

export async function fetchProgress() {
  return request("/api/progress");
}

export async function createSchool(body: Record<string, unknown>) {
  return request("/api/schools", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function postProgress(body: Record<string, unknown>) {
  return request("/api/progress", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function uploadSitePlan(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BACKEND_URL}/api/admin/upload-site-plan`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || "Upload failed");
  }

  return res.json();
}

export async function fetchReportSummary() {
  return fetchReports();
}
