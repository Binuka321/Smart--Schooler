// File: util/auth.js

// Function to get stored token from localStorage
export function getToken() {
  return localStorage.getItem("authToken");
}

// Function to check if token is expired
export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);
    return Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
}

// Function to get user ID
export async function getUserId(tokenParam) {
  // Use provided token or get from storage
  const token = tokenParam || getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch("http://localhost:8080/api/users/id", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error || response.status}`);
      } else {
        throw new Error(`Failed to get user ID: ${response.status}`);
      }
    }

    // Parse the JSON response
    const data = await response.json();

    // Extract the userId from the JSON object
    return data.userId;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    throw error;
  }
}
// Function to get user role
export async function getUserRole(tokenParam) {
  // Use provided token or get from storage
  const token = tokenParam || getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch("http://localhost:8080/api/users/role", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error || response.status}`);
      } else {
        throw new Error(`Failed to get user role: ${response.status}`);
      }
    }

    const userRole = await response.text();
    return userRole;
  } catch (error) {
    console.error("Error fetching user role:", error);
    throw error;
  }
}
export const logout = () => {
  localStorage.removeItem("authToken");
  window.location.href = "/"; // Redirect user
};
