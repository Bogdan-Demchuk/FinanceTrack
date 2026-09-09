const API = "/api/transactions";
const STATISTICS_API = "/api/statistics";

let categoryChart;

function showNotification(message, type = "info") {

    const container =
        document.getElementById("notifications");

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
// INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const monthInput =
        document.getElementById("month");

    const now = new Date();

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    monthInput.value =
        `${now.getFullYear()}-${month}`;

    monthInput.addEventListener(
        "change",
        loadDashboard
    );

    loadDashboard();
});


// ========================================
// DATE RANGE
// ========================================

function getSelectedMonthRange() {

    const value =
        document.getElementById("month").value;

    if (!value) {
        return null;
    }

    const [year, month] =
        value.split("-").map(Number);

    const from =
        `${year}-${String(month).padStart(2, "0")}-01`;

    const lastDay =
        new Date(year, month, 0).getDate();

    const to =
        `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

    return {
        from,
        to
    };
}


// ========================================
// DASHBOARD
// ========================================

async function loadDashboard() {

    const range =
        getSelectedMonthRange();

    if (!range) {
        return;
    }

    try {

        const response =
            await fetch(
                `${STATISTICS_API}/dashboard?` +
                `from=${range.from}&to=${range.to}`
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load dashboard"
            );
        }

        const data =
            await response.json();

        updateStatistics(data);

        updateCategoryChart(
            data.categories
        );

        updateInsights(data);

        await loadTransactions();

    } catch (error) {

        console.error(error);

    }
}


// ========================================
// STATISTICS
// ========================================

function updateStatistics(data) {

    document.getElementById("balance")
        .innerText =
        formatMoney(data.balance);

    document.getElementById("income")
        .innerText =
        formatMoney(data.income);

    document.getElementById("expense")
        .innerText =
        formatMoney(data.expense);

    document.getElementById("savings")
        .innerText =
        formatMoney(data.savings);

    document.getElementById("savingsRate")
        .innerText =
        `${Number(data.savingsRate).toFixed(1)}%`;
}


// ========================================
// MONEY FORMAT
// ========================================

function formatMoney(value) {

    return `$${Number(value).toFixed(2)}`;

}


// ========================================
// CATEGORY CHART
// ========================================

function updateCategoryChart(categories) {

    const labels =
        categories.map(item =>
            formatCategory(item.category)
        );

    const values =
        categories.map(item =>
            Number(item.amount)
        );

    const ctx =
        document
            .getElementById("categoryChart")
            .getContext("2d");

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart =
        new Chart(ctx, {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: values,

                    backgroundColor: [
                        "#3498db",
                        "#2ecc71",
                        "#f1c40f",
                        "#e67e22",
                        "#9b59b6",
                        "#1abc9c",
                        "#e74c3c"
                    ],

                    borderWidth: 0

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        });
}


// ========================================
// CATEGORY NAMES
// ========================================

function formatCategory(category) {

    const names = {

        FOOD: "🍔 Food",

        TRANSPORT: "🚗 Transport",

        ENTERTAINMENT:
            "🎮 Entertainment",

        WORK: "💼 Work",

        HEALTH: "❤️ Health",

        SHOPPING: "🛍 Shopping",

        OTHER: "📦 Other"

    };

    return names[category] || category;
}


// ========================================
// INSIGHTS
// ========================================

function updateInsights(data) {

    const container =
        document.getElementById("insights");

    container.innerHTML = "";

    if (!data.categories ||
        data.categories.length === 0) {

        container.innerHTML =
            `<p class="empty">
                No expenses for this month.
            </p>`;

        return;
    }


    // TOP CATEGORY

    const topCategory =
        data.categories.reduce(
            (max, item) =>
                Number(item.amount) >
                Number(max.amount)
                    ? item
                    : max
        );


    const categoryName =
        formatCategory(
            topCategory.category
        );


    container.innerHTML += `

        <div class="insight warning">

            <div class="insight-icon">
                ⚠️
            </div>

            <div>

                <strong>
                    Biggest expense
                </strong>

                <p>
                    ${categoryName}
                    — ${formatMoney(topCategory.amount)}
                </p>

            </div>

        </div>

    `;


    // SAVINGS RATE

    const rate =
        Number(data.savingsRate);


    let message;
    let icon;
    let className;


    if (rate >= 30) {

        icon = "🟢";

        message =
            "Excellent savings rate!";

        className = "success";

    } else if (rate >= 15) {

        icon = "🟡";

        message =
            "Your savings rate is good.";

        className = "normal";

    } else {

        icon = "🔴";

        message =
            "Your savings rate is low.";

        className = "danger";
    }


    container.innerHTML += `

        <div class="insight ${className}">

            <div class="insight-icon">
                ${icon}
            </div>

            <div>

                <strong>
                    Savings Rate
                </strong>

                <p>
                    ${message}
                    ${rate.toFixed(1)}%
                    of income saved.
                </p>

            </div>

        </div>

    `;


    // POTENTIAL SAVINGS

    if (topCategory.amount > 0) {

        const potential =
            Number(topCategory.amount) * 0.15;

        container.innerHTML += `

            <div class="insight tip">

                <div class="insight-icon">
                    💡
                </div>

                <div>

                    <strong>
                        Potential savings
                    </strong>

                    <p>
                        Cutting
                        ${categoryName}
                        by 15% could save
                        approximately
                        ${formatMoney(potential)}
                        this month.
                    </p>

                </div>

            </div>

        `;
    }
}


// ========================================
// TRANSACTIONS
// ========================================

async function loadTransactions() {

    const response =
        await fetch(API);

    const data =
        await response.json();

    const list =
        document.getElementById("list");

    list.innerHTML = "";

    document.getElementById(
        "transactionCount"
    ).innerText =
        `${data.length} transactions`;


    data.forEach(t => {

        const amount =
            Number(t.amount);

        const isIncome =
            t.type === "INCOME";


        list.innerHTML += `

            <div class="card">

                <div class="card-info">

                    <div class="card-title">

                        ${escapeHtml(t.title)}

                    </div>

                    <div class="card-meta">

                        ${formatCategory(t.category)}
                        •
                        ${t.date || ""}

                    </div>

                </div>


                <div class="transaction-right">

                    <div class="
                        transaction-amount
                        ${isIncome
            ? "income"
            : "expense"}
                    ">

                        ${isIncome ? "+" : "-"}
                        ${formatMoney(amount)}

                    </div>


                    <div class="actions">

                        <button
                            class="delete"
                            onclick="
                                deleteTransaction(${t.id})
                            "
                        >
                            Delete
                        </button>

                        <button
                            class="edit"
                            onclick="
                                editTransaction(${t.id})
                            "
                        >
                            Edit
                        </button>

                    </div>

                </div>

            </div>

        `;
    });
}


// ========================================
// ADD
// ========================================

async function addTransaction() {

    const title =
        document.getElementById("title").value.trim();

    const amount =
        Number(
            document.getElementById("amount").value
        );

    const type =
        document.getElementById("type").value;

    const category =
        document.getElementById("category").value;


    if (!title) {

        showNotification(
            "Please enter transaction title.",
            "warning"
        );

        return;
    }


    if (!amount || amount <= 0) {

        showNotification(
            "Please enter a valid amount.",
            "warning"
        );

        return;
    }


    try {

        const response =
            await fetch(API, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title,
                    amount,
                    type,
                    category,
                    date: getLocalDate()

                })

            });


        if (!response.ok) {

            const error =
                await response.json();

            showNotification(
                error.error || "Failed to add transaction.",
                "error"
            );

            return;
        }


        document.getElementById("title")
            .value = "";

        document.getElementById("amount")
            .value = "";


        showNotification(
            "Transaction added successfully!",
            "success"
        );


        await loadDashboard();

    } catch (error) {

        console.error(error);

        showNotification(
            "Server error. Please try again.",
            "error"
        );
    }
}



// ========================================
// DELETE
// ========================================

async function deleteTransaction(id) {

    try {

        const response =
            await fetch(
                `${API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const error =
                await response.json();

            showNotification(
                error.error ||
                "Failed to delete transaction.",
                "error"
            );

            return;
        }


        showNotification(
            "Transaction deleted successfully!",
            "success"
        );


        await loadDashboard();

    } catch (error) {

        console.error(error);

        showNotification(
            "Server error. Please try again.",
            "error"
        );
    }
}



// ========================================
// EDIT
// ========================================

async function editTransaction(id) {

    const title =
        prompt("New title");

    if (!title) {

        showNotification(
            "Title cannot be empty.",
            "warning"
        );

        return;
    }


    const amount =
        Number(
            prompt("New amount")
        );

    if (!amount || amount <= 0) {

        showNotification(
            "Please enter a valid amount.",
            "warning"
        );

        return;
    }


    const type =
        prompt(
            "INCOME or EXPENSE"
        );


    const category =
        prompt(
            "FOOD, TRANSPORT, ENTERTAINMENT, WORK, HEALTH, SHOPPING or OTHER"
        );


    try {

        const response =
            await fetch(
                `${API}/${id}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        title,
                        amount,
                        type,
                        category

                    })

                }
            );


        if (!response.ok) {

            const error =
                await response.json();

            showNotification(
                error.error ||
                "Failed to update transaction.",
                "error"
            );

            return;
        }


        showNotification(
            "Transaction updated successfully!",
            "success"
        );


        await loadDashboard();

    } catch (error) {

        console.error(error);

        showNotification(
            "Server error. Please try again.",
            "error"
        );
    }
}



// ========================================
// SECURITY
// ========================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}
