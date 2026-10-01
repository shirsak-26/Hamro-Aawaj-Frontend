// Get the stored token
function getToken() {
    return localStorage.getItem("token") ||
           sessionStorage.getItem("token");
}

// Get the logged-in user
function getUser() {
    const user =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

    return user ? JSON.parse(user) : null;
}

// Check whether the student is logged in
function requireLogin() {
    const token = getToken();

    if (!token) {
        window.location.href = "login.html";
    }
}

// Logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    window.location.href = "login.html";
}