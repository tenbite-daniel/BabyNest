const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Small helper so we don’t repeat error handling everywhere
async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      // Attach JWT token if it exists
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API error: ${res.status}`);
  }

  return res.json();
}

/* ---------------- AUTH ---------------- */
export async function forgotPassword(email: string) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, otp: string) {
  return request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function resetPassword(email: string, newPassword: string) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, newPassword }),
  });
}

/* ---------------- USER PROFILE ---------------- */
export async function getProfile() {
  return request("/user/profile", { method: "GET" });
}

export async function updateOnboarding(
  data: Partial<{
    fullName: string;
    weeksPregnant: number;
    symptoms: string[];
    onboardingCompleted: boolean;
  }>
) {
  return request("/user/onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ---------------- JOURNAL ---------------- */
export async function createJournalEntry(data: any) {
  const formData = new FormData();
  formData.append('date', data.date);
  formData.append('trimester', data.trimester);
  formData.append('todos', JSON.stringify(data.todos));
  formData.append('notes', data.notes);
  
  // Append images
  data.images?.forEach((image: File, index: number) => {
    formData.append(`images`, image);
  });

  const res = await fetch(`${API_BASE_URL}/journal`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API error: ${res.status}`);
  }

  return res.json();
}

export async function getJournalEntries() {
  return request("/journal", { method: "GET" });
}

export async function updateJournalEntry(id: string, data: any) {
  const formData = new FormData();
  formData.append('date', data.date);
  formData.append('trimester', data.trimester);
  formData.append('todos', JSON.stringify(data.todos));
  if (data.completedTodos) {
    formData.append('completedTodos', JSON.stringify(data.completedTodos));
  }
  formData.append('notes', data.notes);
  
  // Append new images if any
  data.images?.forEach((image: File) => {
    formData.append(`images`, image);
  });

  const res = await fetch(`${API_BASE_URL}/journal/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API error: ${res.status}`);
  }

  return res.json();
}

export async function deleteJournalEntry(id: string) {
  return request(`/journal/${id}`, {
    method: "DELETE",
  });
}



export const getAllUsers = async (currentUserId: string): Promise<{ _id: string; fullName?: string; username?: string }[]> => {
  const response = await fetch(`/api/users`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Adjust based on your auth setup
    },
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  const users = await response.json();
  return users.filter(user => user._id !== currentUserId);
};

export const getPreviousChatPartners = async (userId: string): Promise<string[]> => {
  const response = await fetch(`/api/chat/previous-partners?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch previous chat partners');
  return response.json();
};


/* ---------------- Grouped API (optional) ---------------- */
export const api = {
  // Auth
  forgotPassword,
  verifyOtp,
  resetPassword,

  // Profile
  getProfile,
  updateOnboarding,

  // Journal
  createJournalEntry,
  getJournalEntries,
  updateJournalEntry,
  deleteJournalEntry,
};