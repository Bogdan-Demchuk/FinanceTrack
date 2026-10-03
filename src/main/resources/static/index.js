const API = "/api/transactions";
const STATISTICS_API = "/api/statistics";

const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// ========================================
// CATEGORIES (icon + color for each)
// ========================================

const CATEGORIES = {
    FOOD:          { label: "Food",          icon: "utensils",     color: "#fb923c" },
    TRANSPORT:     { label: "Transport",     icon: "car",          color: "#38bdf8" },
    ENTERTAINMENT: { label: "Entertainment", icon: "gamepad-2",    color: "#a78bfa" },
    WORK:          { label: "Work",          icon: "briefcase",    color: "#34d399" },
    HEALTH:        { label: "Health",        icon: "heart-pulse",  color: "#f472b6" },
    SHOPPING:      { label: "Shopping",      icon: "shopping-bag", color: "#fbbf24" },
    OTHER:         { label: "Other",         icon: "package",      color: "#94a3b8" }
};

function categoryMeta(key) {
    return CATEGORIES[key] || CATEGORIES.OTHER;
}

function formatCategory(key) {
    return categoryMeta(key).label;
}


// ========================================
// STATE
// ========================================

const now = new Date();

const state = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    transactions: [],
    dashboard: null,
    filter: "ALL",
    search: ""
};

let categoryChart = null;
let editingTransactionId = null;
let deletingTransactionId = null;
let modalType = "EXPENSE";
let modalCategory = "FOOD";

const $ = (id) => document.getElementById(id);


// ========================================
// FETCH HELPER
// ========================================

// An expired/invalid session bounces straight back to the login page
// instead of the dashboard silently showing empty or broken data.
async function apiFetch(url, options = {}) {

    const response = await fetch(url, {
        ...options,
        credentials: "same-origin"
    });

    if (response.status === 401) {
        window.location.href = "login.html";
        throw new Error("Not authenticated");
    }

    return response;
}

function showUser(user) {

    const name = user.name || user.email || "Account";

    $("userName").textContent = name;
    $("userAvatar").textContent = name.trim().charAt(0).toUpperCase();
}


// ========================================
// HELPERS
// ========================================

const moneyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});

function formatMoney(value) {
    return moneyFormat.format(Number(value) || 0);
}

function formatSigned(value) {
    const n = Number(value) || 0;
    return (n >= 0 ? "+" : "−") + formatMoney(Math.abs(n));
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

function icons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function cssVar(name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
}

function getLocalDate() {
    const d = new Date();
    return toIsoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function toIsoDate(y, m, d) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatShortDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}

function getSelectedMonthRange() {
    const lastDay = new Date(state.year, state.month, 0).getDate();

    return {
        from: toIsoDate(state.year, state.month, 1),
        to: toIsoDate(state.year, state.month, lastDay),
        lastDay
    };
}

// Animated count-up for money values
function animateNumber(el, to, format = formatMoney, duration = 900) {

    const from = el._value ?? 0;
    el._value = to;

    cancelAnimationFrame(el._raf);

    if (reduceMotion || from === to) {
        el.textContent = format(to);
        return;
    }

    const start = performance.now();

    const step = (time) => {
        const t = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4);

        el.textContent = format(from + (to - from) * eased);

        if (t < 1) {
            el._raf = requestAnimationFrame(step);
        }
    };

    el._raf = requestAnimationFrame(step);
}


// ========================================
// INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

    applyTheme(localStorage.getItem("fintrack-theme") || "dark");

    // Bounces to login.html if there is no active session.
    const user = await requireAuth();

    if (!user) {
        return;
    }

    showUser(user);
    $("logoutBtn").addEventListener("click", logout);

    renderCategoryChips();
    updateMonthLabel();

    $("prevMonth").addEventListener("click", () => changeMonth(-1));
    $("nextMonth").addEventListener("click", () => changeMonth(1));
    $("themeToggle").addEventListener("click", toggleTheme);
    $("openAdd").addEventListener("click", () => openTransactionModal());

    $("txSubmit").addEventListener("click", submitTransaction);
    $("confirmDelete").addEventListener("click", confirmDeleteTransaction);

    $("search").addEventListener("input", (e) => {
        state.search = e.target.value.trim().toLowerCase();
        renderTransactions();
    });

    $("filterSwitch").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-filter]");
        if (!btn) return;

        state.filter = btn.dataset.filter;

        document.querySelectorAll("#filterSwitch .seg-btn")
            .forEach(b => b.classList.toggle("active", b === btn));

        renderTransactions();
    });

    $("typeSwitch").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-type]");
        if (btn) setModalType(btn.dataset.type);
    });

    $("categoryChips").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-category]");
        if (btn) setModalCategory(btn.dataset.category);
    });

    // edit / delete buttons inside the list
    $("list").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const id = Number(btn.dataset.id);

        if (btn.dataset.action === "edit") editTransaction(id);
        if (btn.dataset.action === "delete") deleteTransaction(id);
        if (btn.dataset.action === "add") openTransactionModal();
    });

    // enter submits the form
    $("txModal").addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.tagName === "INPUT") {
            submitTransaction();
        }
    });

    icons();
    loadDashboard();
});


// ========================================
// THEME
// ========================================

function applyTheme(theme) {

    document.documentElement.dataset.theme = theme;

    $("themeToggle").innerHTML =
        `<i data-lucide="${theme === "dark" ? "sun" : "moon"}"></i>`;

    icons();

    if (state.dashboard) {
        updateCategoryChart(state.dashboard.categories || []);
    }
}

function toggleTheme() {

    const next =
        document.documentElement.dataset.theme === "dark"
            ? "light"
            : "dark";

    localStorage.setItem("fintrack-theme", next);
    applyTheme(next);
}


// ========================================
// MONTH NAVIGATION
// ========================================

function updateMonthLabel() {

    $("monthLabel").textContent =
        new Date(state.year, state.month - 1)
            .toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
            });
}

function changeMonth(delta) {

    const date = new Date(state.year, state.month - 1 + delta, 1);

    state.year = date.getFullYear();
    state.month = date.getMonth() + 1;

    updateMonthLabel();
    loadDashboard();
}


// ========================================
// DASHBOARD
// ========================================

async function loadDashboard() {

    const range = getSelectedMonthRange();

    try {

        const [dashboardResponse, transactionsResponse] =
            await Promise.all([
                apiFetch(
                    `${STATISTICS_API}/dashboard?` +
                    `from=${range.from}&to=${range.to}`
                ),
                apiFetch(API)
            ]);

        if (!dashboardResponse.ok || !transactionsResponse.ok) {
            throw new Error("Failed to load dashboard");
        }

        state.dashboard = await dashboardResponse.json();
        const allTransactions = await transactionsResponse.json();

        state.transactions = allTransactions.filter(t =>
            t.date && t.date >= range.from && t.date <= range.to
        );

        updateStatistics(state.dashboard);
        updateSparkline(state.transactions, range);
        updateCategoryChart(state.dashboard.categories || []);
        updateInsights(state.dashboard);
        renderTransactions();

        icons();

    } catch (error) {

        console.error(error);

        showNotification(
            "Could not load data. Check that the server is running.",
            "error"
        );
    }
}


// ========================================
// STATISTICS
// ========================================

function updateStatistics(data) {

    animateNumber($("balance"), Number(data.balance));
    animateNumber($("income"), Number(data.income));
    animateNumber($("expense"), Number(data.expense));
    animateNumber($("savings"), Number(data.savings));

    const rate = Number(data.savingsRate);

    animateNumber(
        $("savingsRate"),
        rate,
        (v) => `${v.toFixed(1)}%`
    );

    // month net change chip under the balance
    const net = Number(data.savings);
    const up = net >= 0;

    $("balanceDelta").innerHTML =
        `<span class="chip ${up ? "up" : "down"}">` +
        `<i data-lucide="${up ? "trending-up" : "trending-down"}"></i>` +
        `${formatSigned(net)}</span>` +
        `<span>net this month</span>`;

    // savings rate ring + color level
    const level = rate >= 30 ? "high" : rate >= 15 ? "mid" : "low";

    $("rateCard").dataset.level = level;

    $("rateNote").textContent =
        level === "high" ? "Excellent pace"
            : level === "mid" ? "Good, keep going"
                : rate < 0 ? "Spending exceeds income"
                    : "Room to improve";

    const progress = Math.max(0, Math.min(rate, 100));

    requestAnimationFrame(() => {
        $("ringFg").style.strokeDashoffset = 100 - progress;
    });
}


// ========================================
// SPARKLINE (cumulative net for the month)
// ========================================

function updateSparkline(transactions, range) {

    const days = range.lastDay;
    const daily = new Array(days).fill(0);

    transactions.forEach(t => {
        if (!t.date) return;

        const day = Number(t.date.split("-")[2]);
        const amount = Number(t.amount);

        daily[day - 1] += t.type === "INCOME" ? amount : -amount;
    });

    let running = 0;
    const cumulative = daily.map(v => (running += v));

    const W = 300;
    const H = 100;
    const pad = 10;

    const min = Math.min(0, ...cumulative);
    const max = Math.max(0, ...cumulative);
    const span = max - min || 1;

    const points = cumulative.map((v, i) => [
        (i / Math.max(days - 1, 1)) * W,
        H - pad - ((v - min) / span) * (H - pad * 2)
    ]);

    let line = `M ${points[0][0]} ${points[0][1]}`;

    for (let i = 1; i < points.length; i++) {
        const [px, py] = points[i - 1];
        const [x, y] = points[i];
        const mx = (px + x) / 2;

        line += ` C ${mx} ${py}, ${mx} ${y}, ${x} ${y}`;
    }

    const area = `${line} L ${W} ${H} L 0 ${H} Z`;

    $("sparkline").innerHTML = `
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="sparkStroke" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stop-color="#8b7cff"/>
                    <stop offset="100%" stop-color="#22d3ee"/>
                </linearGradient>
                <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#8b7cff" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#8b7cff" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <path class="spark-area" d="${area}" fill="url(#sparkFill)"/>
            <path class="spark-line" pathLength="1"
                  vector-effect="non-scaling-stroke" d="${line}"/>
        </svg>
    `;
}


// ========================================
// CATEGORY CHART
// ========================================

const centerTextPlugin = {

    id: "centerText",

    afterDraw(chart) {

        const options = chart.options.plugins.centerText;
        if (!options) return;

        const { ctx, chartArea: { left, right, top, bottom } } = chart;
        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = cssVar("--muted");
        ctx.font = "500 13px Inter, sans-serif";
        ctx.fillText("Spent", cx, cy - 16);

        ctx.fillStyle = cssVar("--text");
        ctx.font = "700 24px Sora, Inter, sans-serif";
        ctx.fillText(options.value, cx, cy + 10);

        ctx.restore();
    }
};

function updateCategoryChart(categories) {

    const wrapper = document.querySelector(".chart-wrapper");
    const legend = $("legend");

    if (categoryChart) {
        categoryChart.destroy();
        categoryChart = null;
    }

    if (!categories.length) {

        wrapper.style.display = "none";

        legend.innerHTML = `
            <div class="empty">
                <i data-lucide="chart-pie"></i>
                <strong>No expenses this month</strong>
                <span>Add an expense to see where your money goes.</span>
            </div>`;

        icons();
        return;
    }

    wrapper.style.display = "";

    const sorted = [...categories].sort(
        (a, b) => Number(b.amount) - Number(a.amount)
    );

    const total = sorted.reduce((sum, c) => sum + Number(c.amount), 0);

    categoryChart = new Chart($("categoryChart").getContext("2d"), {

        type: "doughnut",

        data: {
            labels: sorted.map(c => formatCategory(c.category)),
            datasets: [{
                data: sorted.map(c => Number(c.amount)),
                backgroundColor: sorted.map(c => categoryMeta(c.category).color),
                borderWidth: 0,
                borderRadius: 8,
                spacing: 3,
                hoverOffset: 10
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "74%",
            animation: reduceMotion ? false : { duration: 900 },

            plugins: {
                legend: { display: false },
                centerText: { value: formatMoney(total) },
                tooltip: {
                    callbacks: {
                        label: (item) => ` ${formatMoney(item.parsed)}`
                    }
                }
            }
        },

        plugins: [centerTextPlugin]
    });

    // custom legend with progress bars
    legend.innerHTML = sorted.map((c, i) => {

        const meta = categoryMeta(c.category);
        const pct = Number(c.percentageOfExpenses);

        return `
            <div class="legend-item" data-index="${i}" style="--cat:${meta.color}">
                <div class="legend-row">
                    <span class="legend-icon"><i data-lucide="${meta.icon}"></i></span>
                    <span class="legend-name">${meta.label}</span>
                    <span class="legend-amount">${formatMoney(c.amount)}</span>
                    <span class="legend-pct">${pct.toFixed(0)}%</span>
                </div>
                <div class="legend-bar"><span data-width="${pct}"></span></div>
            </div>`;
    }).join("");

    // link legend hover to the chart segment
    legend.querySelectorAll(".legend-item").forEach(item => {

        const index = Number(item.dataset.index);

        item.addEventListener("mouseenter", () => highlightSegment(index));
        item.addEventListener("mouseleave", () => highlightSegment(null));
    });

    requestAnimationFrame(() => {
        legend.querySelectorAll(".legend-bar span").forEach(bar => {
            bar.style.width = `${bar.dataset.width}%`;
        });
    });
}

function highlightSegment(index) {

    if (!categoryChart) return;

    const active = index === null ? [] : [{ datasetIndex: 0, index }];

    categoryChart.setActiveElements(active);
    categoryChart.tooltip.setActiveElements(active, { x: 0, y: 0 });
    categoryChart.update();
}


// ========================================
// INSIGHTS
// ========================================

function updateInsights(data) {

    const container = $("insights");
    const categories = data.categories || [];

    if (!categories.length) {

        container.innerHTML = `
            <div class="empty">
                <i data-lucide="sparkles"></i>
                <strong>No insights yet</strong>
                <span>Insights appear once you have expenses this month.</span>
            </div>`;

        return;
    }

    const top = categories.reduce(
        (max, item) =>
            Number(item.amount) > Number(max.amount) ? item : max
    );

    const topMeta = categoryMeta(top.category);
    const rate = Number(data.savingsRate);

    let html = "";

    // 1. Biggest expense (featured — the most important insight)
    html += `
        <div class="insight featured" style="--cat:${topMeta.color}">
            <div class="insight-icon"><i data-lucide="${topMeta.icon}"></i></div>
            <div>
                <strong>Biggest expense · ${topMeta.label}</strong>
                <div class="featured-amount">${formatMoney(top.amount)}</div>
                <p><b>${Number(top.percentageOfExpenses).toFixed(0)}%</b>
                   of this month's spending</p>
            </div>
        </div>`;

    // 2. Savings rate
    let tone, icon, message;

    if (Number(data.expense) > Number(data.income)) {
        tone = "danger";
        icon = "triangle-alert";
        message = "You spent more than you earned this month.";
    } else if (rate >= 30) {
        tone = "success";
        icon = "circle-check";
        message = "Excellent savings rate!";
    } else if (rate >= 15) {
        tone = "normal";
        icon = "thumbs-up";
        message = "Your savings rate is good.";
    } else {
        tone = "danger";
        icon = "trending-down";
        message = "Your savings rate is low.";
    }

    html += `
        <div class="insight ${tone}">
            <div class="insight-icon"><i data-lucide="${icon}"></i></div>
            <div>
                <strong>Savings rate</strong>
                <p>${message} <b>${rate.toFixed(1)}%</b> of income saved.</p>
            </div>
        </div>`;

    // 3. Potential savings
    const potential = Number(top.amount) * 0.15;

    if (potential > 0) {
        html += `
            <div class="insight tip">
                <div class="insight-icon"><i data-lucide="lightbulb"></i></div>
                <div>
                    <strong>Potential savings</strong>
                    <p>Cutting ${topMeta.label} by 15% would save about
                       <b>${formatMoney(potential)}</b> this month.</p>
                </div>
            </div>`;
    }

    container.innerHTML = html;
}


// ========================================
// TRANSACTIONS LIST
// ========================================

function renderTransactions() {

    const list = $("list");

    const visible = state.transactions
        .filter(t => state.filter === "ALL" || t.type === state.filter)
        .filter(t =>
            !state.search ||
            (t.title || "").toLowerCase().includes(state.search) ||
            formatCategory(t.category).toLowerCase().includes(state.search)
        )
        .sort((a, b) =>
            (b.date || "").localeCompare(a.date || "") || b.id - a.id
        );

    $("transactionCount").textContent = visible.length;

    if (!visible.length) {

        const hasAny = state.transactions.length > 0;

        list.innerHTML = `
            <div class="empty">
                <i data-lucide="${hasAny ? "search-x" : "receipt"}"></i>
                <strong>${hasAny
            ? "Nothing matches your filters"
            : "No transactions this month"}</strong>
                <span>${hasAny
            ? "Try another search or filter."
            : "Record your first income or expense."}</span>
                ${hasAny ? "" : `
                    <button class="btn btn-primary" data-action="add">
                        <i data-lucide="plus"></i> New transaction
                    </button>`}
            </div>`;

        icons();
        return;
    }

    list.innerHTML = visible.map((t, i) => {

        const meta = categoryMeta(t.category);
        const isIncome = t.type === "INCOME";

        return `
            <article class="tx" style="--i:${Math.min(i, 12)}; --cat:${meta.color}">

                <div class="tx-icon">
                    <i data-lucide="${meta.icon}"></i>
                </div>

                <div class="tx-main">
                    <div class="tx-title">${escapeHtml(t.title)}</div>
                    <div class="tx-meta">
                        <span>${meta.label}</span>
                        <span class="sep"></span>
                        <span>${formatShortDate(t.date)}</span>
                    </div>
                </div>

                <div class="tx-amount ${isIncome ? "income" : "expense"}">
                    ${isIncome ? "+" : "−"}${formatMoney(t.amount)}
                </div>

                <div class="tx-actions">
                    <button class="icon-btn" data-action="edit"
                            data-id="${t.id}" aria-label="Edit">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="icon-btn danger" data-action="delete"
                            data-id="${t.id}" aria-label="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>

            </article>`;
    }).join("");

    icons();
}


// ========================================
// MODAL HELPERS
// ========================================

function openModal(id) {
    $(id).classList.add("active");
}

function closeModal(id) {
    $(id).classList.remove("active");
}

document.addEventListener("click", (e) => {

    const closeBtn = e.target.closest("[data-close]");

    if (closeBtn) {
        closeModal(closeBtn.dataset.close);
        return;
    }

    // click on the dark backdrop
    if (e.target.classList.contains("modal")) {
        closeModal(e.target.id);
    }
});

document.addEventListener("keydown", (e) => {

    if (e.key !== "Escape") return;

    document.querySelectorAll(".modal.active")
        .forEach(modal => closeModal(modal.id));
});

// reset ids once the modal is closed by any means
const modalObserver = new MutationObserver(() => {

    if (!$("txModal").classList.contains("active")) {
        editingTransactionId = null;
    }

    if (!$("deleteModal").classList.contains("active")) {
        deletingTransactionId = null;
    }
});

["txModal", "deleteModal"].forEach(id => {
    document.addEventListener("DOMContentLoaded", () => {
        modalObserver.observe($(id), { attributes: true, attributeFilter: ["class"] });
    });
});


// ========================================
// ADD / EDIT FORM
// ========================================

function renderCategoryChips() {

    $("categoryChips").innerHTML =
        Object.entries(CATEGORIES).map(([key, meta]) => `
            <button type="button" class="chip-btn"
                    data-category="${key}" style="--cat:${meta.color}">
                <i data-lucide="${meta.icon}"></i>${meta.label}
            </button>
        `).join("");
}

function setModalType(type) {

    modalType = type;

    document.querySelectorAll("#typeSwitch .seg-btn")
        .forEach(btn =>
            btn.classList.toggle("active", btn.dataset.type === type)
        );
}

function setModalCategory(category) {

    modalCategory = category;

    document.querySelectorAll("#categoryChips .chip-btn")
        .forEach(btn =>
            btn.classList.toggle("active", btn.dataset.category === category)
        );
}

function openTransactionModal(transaction = null) {

    editingTransactionId = transaction ? transaction.id : null;

    $("txModalTitle").textContent =
        transaction ? "Edit transaction" : "New transaction";

    $("txSubmitLabel").textContent =
        transaction ? "Save changes" : "Add transaction";

    $("txTitle").value = transaction ? transaction.title : "";
    $("txAmount").value = transaction ? transaction.amount : "";
    $("txDate").value = transaction ? transaction.date : getLocalDate();

    setModalType(transaction ? transaction.type : "EXPENSE");
    setModalCategory(transaction ? transaction.category : "FOOD");

    openModal("txModal");
    setTimeout(() => $("txTitle").focus(), 150);
}

function editTransaction(id) {

    const transaction =
        state.transactions.find(t => t.id === id);

    if (!transaction) {
        showNotification("Transaction not found.", "error");
        return;
    }

    openTransactionModal(transaction);
}

async function submitTransaction() {

    const title = $("txTitle").value.trim();
    const amount = Number($("txAmount").value);
    const date = $("txDate").value || getLocalDate();

    if (!title) {
        showNotification("Please enter a transaction title.", "warning");
        return;
    }

    if (!amount || amount <= 0) {
        showNotification("Please enter a valid amount.", "warning");
        return;
    }

    const isEdit = editingTransactionId !== null;

    try {

        const response = await apiFetch(
            isEdit ? `${API}/${editingTransactionId}` : API,
            {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    amount,
                    type: modalType,
                    category: modalCategory,
                    date
                })
            }
        );

        if (!response.ok) {

            const error = await response.json().catch(() => ({}));

            showNotification(
                error.error ||
                (isEdit ? "Failed to update transaction."
                    : "Failed to add transaction."),
                "error"
            );

            return;
        }

        closeModal("txModal");

        showNotification(
            isEdit ? "Transaction updated!" : "Transaction added!",
            "success"
        );

        // jump to the month of the saved transaction
        const [y, m] = date.split("-").map(Number);

        if (y !== state.year || m !== state.month) {
            state.year = y;
            state.month = m;
            updateMonthLabel();
        }

        await loadDashboard();

    } catch (error) {

        console.error(error);

        showNotification("Server error. Please try again.", "error");
    }
}


// ========================================
// DELETE
// ========================================

function deleteTransaction(id) {

    const transaction =
        state.transactions.find(t => t.id === id);

    if (!transaction) {
        showNotification("Transaction not found.", "error");
        return;
    }

    deletingTransactionId = id;

    $("deleteMessage").textContent =
        `"${transaction.title}" (${formatMoney(transaction.amount)}) ` +
        `will be removed permanently.`;

    openModal("deleteModal");
}

async function confirmDeleteTransaction() {

    if (deletingTransactionId === null) return;

    const id = deletingTransactionId;

    try {

        const response = await apiFetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {

            const error = await response.json().catch(() => ({}));

            showNotification(
                error.error || "Failed to delete transaction.",
                "error"
            );

            return;
        }

        closeModal("deleteModal");

        showNotification("Transaction deleted.", "success");

        await loadDashboard();

    } catch (error) {

        console.error(error);

        closeModal("deleteModal");

        showNotification("Server error. Please try again.", "error");
    }
}