const API_URL = "http://localhost:3000/dev";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function registerUser(data) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function loginUser(data) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (result.token) {
    localStorage.setItem("token", result.token);
  }
  return result;
}

// Profile
export async function updateProfile(data) {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

// Workouts
export async function getWorkouts() {
  const response = await fetch(`${API_URL}/workouts/list`, {
    headers: getAuthHeaders(),
  });
  return response.json();
}

export async function createWorkout(data) {
  const response = await fetch(`${API_URL}/workouts/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateWorkout(id, data) {
  const response = await fetch(`${API_URL}/workouts/update/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteWorkout(id) {
  const response = await fetch(`${API_URL}/workouts/delete/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return response.json();
}

// Workout Sessions (calendar)
export async function getSessions() {
  const response = await fetch(`${API_URL}/workouts/sessions`, {
    headers: getAuthHeaders(),
  });
  return response.json();
}

export async function createSession(data) {
  const response = await fetch(`${API_URL}/workouts/sessions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateSession(id, data) {
  const response = await fetch(`${API_URL}/workouts/sessions/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteSession(id) {
  const response = await fetch(`${API_URL}/workouts/sessions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return response.json();
}

// Supplements
export async function getSupplements() {
  const response = await fetch(`${API_URL}/supplements/list`, {
    headers: getAuthHeaders(),
  });
  return response.json();
}

export async function createSupplement(data) {
  const response = await fetch(`${API_URL}/supplements/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateSupplement(id, data) {
  const response = await fetch(`${API_URL}/supplements/update/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteSupplement(id) {
  const response = await fetch(`${API_URL}/supplements/delete/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return response.json();
}

// Supplement schedules
export async function getScheduledIntakes() {
  const response = await fetch(`${API_URL}/supplements/schedule`, {
    headers: getAuthHeaders(),
  });
  return response.json();
}

export async function scheduleIntake(data) {
  const response = await fetch(`${API_URL}/supplements/schedule`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateScheduledIntake(id, data) {
  const response = await fetch(`${API_URL}/supplements/schedule/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteScheduledIntake(id) {
  const response = await fetch(`${API_URL}/supplements/schedule/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return response.json();
}
