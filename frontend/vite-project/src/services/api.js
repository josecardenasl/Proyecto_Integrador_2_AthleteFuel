const API_URL = "http://localhost:3000/dev";

export async function registerUser(data) {

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

export async function loginUser(data) {

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  // 🔐 guardar token automáticamente
  if (result.token) {
    localStorage.setItem("token", result.token);
  }

  return result;
}