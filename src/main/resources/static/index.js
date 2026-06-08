const API = "/api/transactions";
let chart;
// Загрузка всех транзакций
async function loadTransactions() {
    const res = await fetch(API);
    const data = await res.json();

    const list = document.getElementById("list");
    list.innerHTML = "";

    data.forEach(t => {
        list.innerHTML += `
             <div class="card">

                 <div class="card-info">
                     <div class="card-title">${t.title}</div>

                     <div class="card-meta">
                         💵 ${t.amount} ${t.type} ${t.category}
                     </div>
                 </div>

                 <div class="actions">
                     <button class="delete" onclick="deleteTransaction(${t.id})">
                         Delete
                     </button>

                     <button class="edit" onclick="editTransaction(${t.id})">
                         Edit
                     </button>
                 </div>

             </div>
         `;
    });
    updateChart(data);
    loadBalance();
}

// Добавление транзакции
async function addTransaction() {

    const title = document.getElementById("title").value;

    const amount = document.getElementById("amount").value;

    const type = document.getElementById("type").value;

    const category = document.getElementById("category").value;

    await fetch(API, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: title,
            amount: parseFloat(amount),
            type: type,
            category: category,
            date: new Date().toISOString().split("T")[0]
        })
    });

    // очистка input
    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("type").value = "";
    document.getElementById("category").value = "";

    loadTransactions();
}

// Удаление
async function deleteTransaction(id) {

    await fetch(API + "/" + id, {
        method: "DELETE"
    });

    loadTransactions();
}
function updateChart(data) {

    const income = data
        .filter(t => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = data
        .filter(t => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const ctx = document.getElementById("chart").getContext("2d");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["💰 Income", "💸 Expense"],
            datasets: [{
                data: [income, expense],
                backgroundColor: ["#2ecc71", "#e74c3c"]
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}
// Редактирование
async function editTransaction(id) {

    const title = prompt("New title");

    const amount = prompt("New amount");

    const type = prompt("INCOME or EXPENSE");

    const category = prompt("New category");

    await fetch(API + "/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: title,
            amount: parseFloat(amount),
            type: type,
            category: category
        })
    });

    loadTransactions();
}

// Баланс
async function loadBalance() {

    const balance =
        await (await fetch(API + "/balance")).json();

    const income =
        await (await fetch(API + "/income")).json();

    const expense =
        await (await fetch(API + "/expense")).json();

    document.getElementById("balance").innerText =
        "Balance: " + balance;

    document.getElementById("income").innerText =
        "Income: " + income;

    document.getElementById("expense").innerText =
        "Expense: " + expense;
}

// Старт приложения
loadTransactions();