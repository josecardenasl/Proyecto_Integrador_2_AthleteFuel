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