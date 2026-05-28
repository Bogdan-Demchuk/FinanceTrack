const API = "/api/transactions";

// Загрузка всех транзакций
async function loadTransactions() {
    const res = await fetch(API);
    const data = await res.json();

    const list = document.getElementById("list");
    list.innerHTML = "";

    data.forEach(t => {
        list.innerHTML += `
            <div class="card">
                <b>${t.title}</b><br>

                💵 Amount: ${t.amount}<br>

                📌 Type: ${t.type}<br>

                🏷 Category: ${t.category}<br>

                <button onclick="deleteTransaction(${t.id})">
                    Delete
                </button>

                <button onclick="editTransaction(${t.id})">
                    Edit
                </button>
            </div>
        `;
    });

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
            amount: amount,
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
            amount: amount,
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