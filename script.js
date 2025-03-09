// Dark Mode / Light Mode
const themeButton = document.getElementById("toggle-theme");
const body = document.body;

// Load saved theme
if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("darkMode");
    themeButton.textContent = "Light Mode";
}

// Function to change the theme
themeButton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
        themeButton.textContent = "Light Mode";
    } else {
        localStorage.setItem("darkMode", "disabled");
        themeButton.textContent = "Dark Mode";
    }
});

// App Logic
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function addTransaction() {
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;

    if (!description || isNaN(amount)) {
        alert("Please, insert a description and a valid amount.");
        return;
    }

    const newTransaction = {
        id: Date.now(),
        description,
        amount: type === "spending" ? -amount : amount,
    };

    transactions.push(newTransaction);
    saveLocalStorage();
    updateInterface();
    cleanInput();
}

document.getElementById("filter-type").addEventListener("change", updateInterface);
document.getElementById("filter-date").addEventListener("change", updateInterface);

function updateInterface() {
    const list = document.getElementById("transactions");
    list.innerHTML = "";

    let totalBalance = 0;
    const typeFilter = document.getElementById("filter-type").value;
    const dateFilter = document.getElementById("filter-date").value;

    transactions.forEach((transaction) => {
        // Apply filters
        if (typeFilter !== "all" && ((typeFilter === "income" && transaction.amount < 0) || (typeFilter === "spending" && transaction.amount > 0))) {
            return;
        }

        if (dateFilter && new Date(transaction.id).toISOString().split("T")[0] !== dateFilter) {
            return;
        }

        const item = document.createElement("li");
        item.textContent = `${transaction.description}: €${transaction.amount.toFixed(2)}`;
        item.style.color = transaction.amount < 0 ? "red" : "green";

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.onclick = () => deleteTransaction(transaction.id);

        item.appendChild(deleteBtn);
        list.appendChild(item);

        totalBalance += transaction.amount;
    });

    document.getElementById("balance").textContent = `€${totalBalance.toFixed(2)}`;

    updateGraphics();
}

let cakeGraphic;
let barGraphic;

function updateGraphics() {
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const spending = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

    // Cake Graphic (Income vs Spending)
    const ctx1 = document.getElementById("cakeGraphic").getContext("2d");
    if(cakeGraphic) cakeGraphic.destroy();  // Avoid duplicates
    cakeGraphic = new Chart(ctx1, {
        type: "pie",
        data: {
            labels: ["Incomes", "Spendings"],
            datasets: [{
                data: [income, spending],
                backgroundColor: ["green", "red"]
            }]
        }
    });

    // Bar Graphic (Historial)
    const dates = transactions.map(t => new Date(t.id).toLocaleDateString());
    const amounts = transactions.map(t => t.amount);

    const ctx2 = document.getElementById("barGraphic").getContext("2d");
    if (barGraphic) barGraphic.destroy();   // Avoid duplicates
    barGraphic = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: dates,
            datasets: [{
                label: "Amount",
                data: amounts,
                backgroundColor: amounts.map(m => m > 0 ? "green" : "red")
            }]
        }
    });
}

function saveLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function deleteTransaction(id) {
    transactions = transactions.filter((t) => t.id !== id);
    saveLocalStorage();
    updateInterface();
}

function cleanInput() {
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
}

document.addEventListener("DOMContentLoaded", updateInterface);