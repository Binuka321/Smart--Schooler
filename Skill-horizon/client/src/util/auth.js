// File: util/auth.js

// Function to get user ID from the server (no need for token anymore)
export async function getUserId() {
  try {
    const response = await fetch("http://localhost:8080/api/users/id", {
      method: "GET",
      credentials: "include", // Ensure cookies (JSESSIONID) are sent with the request
    });

    if (!response.ok) {
      // Handle errors from the server
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error || response.status}`);
      } else {
        throw new Error(`Failed to get user ID: ${response.status}`);
      }
    }

    const data = await response.json();
    return data.userId;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    throw error;
  }
}

// Function to get user role from the server (no need for token anymore)
export async function getUserRole() {
  try {
    const response = await fetch("http://localhost:8080/api/users/role", {
      method: "GET",
      credentials: "include", // Ensure cookies (JSESSIONID) are sent with the request
    });

    if (!response.ok) {
      // Handle errors from the server
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

// Function to logout the user
export const logout = () => {
  // Clear the session by logging out at the server level
  fetch("http://localhost:8080/logout", {
    method: "POST",
    credentials: "include", // Include cookies for logout request
  })
    .then(() => {
      window.location.href = "/"; // Redirect user to home page after logout
    })
    .catch((error) => {
      console.error("Error logging out:", error);
    });
};
