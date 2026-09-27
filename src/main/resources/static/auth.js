// ========================================
// SHARED NOTIFICATIONS (used by login/register/index pages)
// ========================================

function showNotification(message, type = "info") {

    const container =
        document.getElementById("notifications");

    if (!container) {
        console.log(`[${type}] ${message}`);
        return;
    }

    const notification =
        document.createElement("div");

    notification.className =
        `notification ${type}`;

    notification.innerText = message;

    container.appendChild(notification);

    setTimeout(() => {

        notification.style.animation =
            "notificationOut 0.3s ease";

        setTimeout(() => {
            notification.remove();
        }, 300);

    }, 3000);
}


// ========================================
// AUTH
// ========================================

async function login(email, password) {

    const body = new URLSearchParams();
    body.set("email", email);
    body.set("password", password);

    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString(),
        credentials: "same-origin"
    });

    return response.ok;
}

async function register(name, email, password) {

    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "same-origin"
    });

    if (!response.ok) {

        const error =
            await response.json().catch(() => ({}));

        throw new Error(
            error.error || "Registration failed."
        );
    }

    return response.json();
}

async function logout() {

    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin"
    });

    window.location.href = "login.html";
}

// Call this at the top of any protected page. Redirects to the login page
// if there is no active session, otherwise returns the current user.
async function requireAuth() {

    const response =
        await fetch("/api/auth/me", { credentials: "same-origin" });

    if (!response.ok) {
        window.location.href = "login.html";
        return null;
    }

    return response.json();
}
