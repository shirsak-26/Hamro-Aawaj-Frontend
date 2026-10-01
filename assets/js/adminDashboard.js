document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    // No token = not logged in
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(
            "https://providers-cylinder-have-cap.trycloudflare.com/api/protected",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "login.html";
            return;
        }

        // Check admin role
        if (data.user.role !== "admin") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "login.html";
            return;
        }

        console.log("Admin authenticated:", data.user);

    } catch (error) {
        console.error("Dashboard authentication error:", error);
    }
});