document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("adminLoginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("adminEmail").value;
        const password = document.getElementById("adminPassword").value;
        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch(
                "https://providers-cylinder-have-cap.trycloudflare.com/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message || "Login failed.";
                message.classList.remove("hidden");
                return;
            }

            // Only allow admin users
            if (data.user.role !== "admin") {
                message.textContent = "Access denied. Admin only.";
                message.classList.remove("hidden");
                return;
            }

            // Store authentication information
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Login successful
            window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Admin login error:", error);

            message.textContent =
                "Unable to connect to the backend.";
            message.classList.remove("hidden");
        }
    });
});