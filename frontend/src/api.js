const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://studentproject-nvb3.onrender.com/api";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = localStorage.getItem("habitTrackerToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || "Something went wrong.";
    throw new Error(message);
  }

  return data;
}

export async function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name, email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function fetchProfile() {
  return request("/auth/profile");
}

export async function deleteAccount(password) {
  return request("/auth/account", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}

export async function fetchHabits() {
  return request("/habits");
}

export async function createHabit(name) {
  return request("/habits", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function toggleHabit(habitId, completed) {
  return request(`/habits/${habitId}`, {
    method: "PUT",
    body: JSON.stringify({ completed }),
  });
}

export async function deleteHabit(habitId) {
  return request(`/habits/${habitId}`, {
    method: "DELETE",
  });
}
