// ========================================
// THEME (shared with the dashboard)
// ========================================

try {
    document.documentElement.dataset.theme =
        localStorage.getItem("fintrack-theme") || "dark";
} catch (e) {
    /* storage unavailable — keep default theme */
}


// ========================================
// SHARED NOTIFICATIONS (used by login/register/index pages)
// ========================================

function escapeText(text) {

    const div = document.createElement("div");
    div.textContent = text ?? "";

    return div.innerHTML;
}

function showNotification(message, type = "info") {

    const container =
        document.getElementById("notifications");

    if (!container) {
        console.log(`[${type}] ${message}`);
        return;
    }

    const iconNames = {
        success: "circle-check",
        error: "circle-alert",
        warning: "triangle-alert",
        info: "info"
    };

    const notification =
        document.createElement("div");

    notification.className =
        `notification ${type}`;

    notification.innerHTML =
        `<i data-lucide="${iconNames[type] || "info"}"></i>` +
        `<span>${escapeText(message)}</span>`;

    container.appendChild(notification);

    if (window.lucide) {
        window.lucide.createIcons();
    }

    setTimeout(() => {

        notification.classList.add("leaving");

        setTimeout(() => {
            notification.remove();
        }, 300);

    }, 3000);
}


// ========================================
// SHARED EFFECTS: card spotlight + button ripple
// ========================================

const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("pointermove", (event) => {

    const card = event.target.closest(".spot");

    if (!card) {
        return;
    }

    const rect = card.getBoundingClientRect();

    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
});

document.addEventListener("click", (event) => {

    const button = event.target.closest(".btn");

    if (!button || prefersReducedMotion) {
        return;
    }

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const ripple = document.createElement("span");

    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
});

// show / hide password
document.addEventListener("click", (event) => {

    const toggle = event.target.closest("[data-toggle-password]");

    if (!toggle) {
        return;
    }

    const input =
        document.getElementById(toggle.dataset.togglePassword);

    const show = input.type === "password";

    input.type = show ? "text" : "password";

    toggle.innerHTML =
        `<i data-lucide="${show ? "eye-off" : "eye"}"></i>`;

    toggle.setAttribute(
        "aria-label",
        show ? "Hide password" : "Show password"
    );

    if (window.lucide) {
        window.lucide.createIcons();
    }
});

document.addEventListener("DOMContentLoaded", () => {

    if (window.lucide) {
        window.lucide.createIcons();
    }
});


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