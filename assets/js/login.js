// Backend URL
const API_BASE_URL = "https://providers-cylinder-have-cap.trycloudflare.com/api";

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const formMessage = document.getElementById("formMessage");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // Clear previous message
    formMessage.textContent = "";
    formMessage.classList.add("hidden");

    // Disable button while logging in
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Invalid email or password.");
        }

        // Save JWT token
        if (rememberMe) {
            localStorage.setItem("token", data.token);
        } else {
            sessionStorage.setItem("token", data.token);
        }

        // Save logged-in user if backend sends it
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        // Successful login
        formMessage.textContent = "Login successful! Redirecting...";
        formMessage.classList.remove("hidden");

        // Redirect student to lessons page
        setTimeout(() => {
            window.location.href = "lessons.html";
        }, 800);

    } catch (error) {
        console.error("Login error:", error);

        formMessage.textContent = error.message;
        formMessage.classList.remove("hidden");

    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Log in";
    }
});