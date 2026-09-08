const API = "/api/transactions";

let chart;


// ==============================
// LOAD TRANSACTIONS
// ==============================

async function loadTransactions(url = API) {

    try {

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Failed to load transactions");
        }

        const data = await res.json();

        renderTransactions(data);

        updateChart(data);

        updateTransactionCount(data);

        loadBalance();

    } catch (error) {

        console.error(error);

        document.getElementById("list").innerHTML = `
            <div class="error">
                ❌ Failed to load transactions
            </div>
        `;
    }
}


// ==============================
// RENDER TRANSACTIONS
// ==============================

function renderTransactions(data) {

    const list = document.getElementById("list");

    list.innerHTML = "";

    if (data.length === 0) {

        list.innerHTML = `
            <div class="empty">
                <div class="empty-icon">📭</div>
                <h3>No transactions found</h3>
                <p>Try changing your filters.</p>
            </div>
        `;

        return;
    }


    data.forEach(t => {

        const isIncome = t.type === "INCOME";

        const amountClass =
            isIncome ? "income-amount" : "expense-amount";

        const sign =
            isIncome ? "+" : "-";


        list.innerHTML += `

            <div class="card">

                <div class="card-info">

                    <div class="card-title">
                        ${escapeHtml(t.title)}
                    </div>

                    <div class="card-meta">

                        <span>
                            ${getCategoryIcon(t.category)}
                            ${t.category}
                        </span>

                        <span>
                            📅 ${t.date}
                        </span>

                    </div>

                </div>


                <div class="transaction-right">

                    <div class="${amountClass}">
                        ${sign}${Number(t.amount).toFixed(2)}
                    </div>

                    <div class="actions">

                        <button
                                class="edit"
                                onclick="editTransaction(${t.id})"
                        >
                            ✏️
                        </button>

                        <button
                                class="delete"
                                onclick="deleteTransaction(${t.id})"
                        >
                            🗑️
                        </button>

                    </div>

                </div>

            </div>
        `;
    });
}


// ==============================
// ADD TRANSACTION
// ==============================

async function addTransaction() {

    const title =
        document.getElementById("title").value.trim();

    const amount =
        document.getElementById("amount").value;

    const type =
        document.getElementById("type").value;

    const category =
        document.getElementById("category").value;


    if (!title) {

        alert("Please enter a title.");

        return;
    }


    if (!amount || Number(amount) <= 0) {

        alert("Amount must be greater than 0.");

        return;
    }


    try {

        const res = await fetch(API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                title: title,

                amount: Number(amount),

                type: type,

                category: category,

                date: new Date()
                    .toISOString()
                    .split("T")[0]

            })

        });


        if (!res.ok) {

            const errorText = await res.text();

            throw new Error(errorText);
        }


        document.getElementById("title").value = "";

        document.getElementById("amount").value = "";

        document.getElementById("type").value = "EXPENSE";

        document.getElementById("category").value = "FOOD";


        loadTransactions();

    } catch (error) {

        console.error(error);

        alert("Failed to add transaction.");
    }
}


// ==============================
// DELETE
// ==============================

async function deleteTransaction(id) {

    const confirmed =
        confirm("Are you sure you want to delete this transaction?");


    if (!confirmed) {
        return;
    }


    try {

        const res = await fetch(
            API + "/" + id,
            {
                method: "DELETE"
            }
        );


        if (!res.ok) {
            throw new Error("Delete failed");
        }


        loadTransactions();

    } catch (error) {

        console.error(error);

        alert("Failed to delete transaction.");
    }
}


// ==============================
// EDIT
// ==============================

async function editTransaction(id) {

    const title =
        prompt("New title");


    if (title === null) {
        return;
    }


    const amount =
        prompt("New amount");


    if (amount === null) {
        return;
    }


    const type =
        prompt("INCOME or EXPENSE");


    if (type === null) {
        return;
    }


    const category =
        prompt(
            "Category: FOOD, TRANSPORT, ENTERTAINMENT, WORK, HEALTH, SHOPPING, OTHER"
        );


    if (category === null) {
        return;
    }


    try {

        const res = await fetch(

            API + "/" + id,

            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: title,

                    amount: Number(amount),

                    type: type.toUpperCase(),

                    category: category.toUpperCase(),

                    date: new Date()
                        .toISOString()
                        .split("T")[0]

                })

            }
        );


        if (!res.ok) {

            throw new Error("Update failed");
        }


        loadTransactions();

    } catch (error) {

        console.error(error);

        alert("Failed to update transaction.");
    }
}


// ==============================
// FILTERS
// ==============================

function applyFilters() {

    const params =
        new URLSearchParams();


    const title =
        document.getElementById("filterTitle").value.trim();

    const category =
        document.getElementById("filterCategory").value;

    const type =
        document.getElementById("filterType").value;

    const minAmount =
        document.getElementById("minAmount").value;

    const maxAmount =
        document.getElementById("maxAmount").value;

    const from =
        document.getElementById("fromDate").value;

    const to =
        document.getElementById("toDate").value;


    if (title) {
        params.append("title", title);
    }

    if (category) {
        params.append("category", category);
    }

    if (type) {
        params.append("type", type);
    }

    if (minAmount) {
        params.append("minAmount", minAmount);
    }

    if (maxAmount) {
        params.append("maxAmount", maxAmount);
    }

    if (from) {
        params.append("from", from);
    }

    if (to) {
        params.append("to", to);
    }


    const query =
        params.toString();


    const url =
        query
            ? API + "/filter?" + query
            : API;


    loadTransactions(url);
}


// ==============================
// RESET FILTERS
// ==============================

function resetFilters() {

    document.getElementById("filterTitle").value = "";

    document.getElementById("filterCategory").value = "";

    document.getElementById("filterType").value = "";

    document.getElementById("minAmount").value = "";

    document.getElementById("maxAmount").value = "";

    document.getElementById("fromDate").value = "";

    document.getElementById("toDate").value = "";


    loadTransactions();
}


// ==============================
// BALANCE
// ==============================

async function loadBalance() {

    try {

        const balance =
            await fetch(API + "/balance")
                .then(res => res.json());


        const income =
            await fetch(API + "/income")
                .then(res => res.json());


        const expense =
            await fetch(API + "/expense")
                .then(res => res.json());


        document.getElementById("balance")
            .innerText = Number(balance).toFixed(2);


        document.getElementById("income")
            .innerText = Number(income).toFixed(2);


        document.getElementById("expense")
            .innerText = Number(expense).toFixed(2);


    } catch (error) {

        console.error("Failed to load balance", error);
    }
}


// ==============================
// CHART
// ==============================

function updateChart(data) {

    const income = data

        .filter(t => t.type === "INCOME")

        .reduce(
            (sum, t) => sum + Number(t.amount),
            0
        );


    const expense = data

        .filter(t => t.type === "EXPENSE")

        .reduce(
            (sum, t) => sum + Number(t.amount),
            0
        );


    const ctx =
        document
            .getElementById("chart")
            .getContext("2d");


    if (chart) {
        chart.destroy();
    }


    chart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [
                "💰 Income",
                "💸 Expense"
            ],

            datasets: [{

                data: [
                    income,
                    expense
                ],

                backgroundColor: [
                    "#22c55e",
                    "#ef4444"
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


// ==============================
// COUNT
// ==============================

function updateTransactionCount(data) {

    const count = data.length;

    document.getElementById("transactionCount")
        .innerText =
        count === 1
            ? "1 transaction"
            : `${count} transactions`;
}


// ==============================
// CATEGORY ICON
// ==============================

function getCategoryIcon(category) {

    const icons = {

        FOOD: "🍔",

        TRANSPORT: "🚗",

        ENTERTAINMENT: "🎮",

        WORK: "💼",

        HEALTH: "❤️",

        SHOPPING: "🛍️",

        OTHER: "📦"

    };


    return icons[category] || "📦";
}


// ==============================
// SECURITY
// ==============================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// ==============================
// START
// ==============================

loadTransactions();
