const API = "/api/transactions";

async function loadTransactions() {
    const res = await fetch(API);
    const data = await res.json();

    const list = document.getElementById("list");
    list.innerHTML = "";

    data.forEach(t => {
        list.innerHTML += `
            <div class="card">
                <b>${t.title}</b><br>
                💵 ${t.amount}<br>
                🏷 ${t.category}
            </div>
        `;
    });

    loadBalance();
}

async function addTransaction() {
    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;

    await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            amount: amount,
            category: category,
            date: new Date().toISOString().split("T")[0]
        })
    });

    loadTransactions();
}

async function loadBalance() {
    const res = await fetch("/api/transactions/balance");
    const data = await res.json();

    document.getElementById("balance").innerText =
        "Balance: " + data;
}

// старт приложения
loadTransactions();