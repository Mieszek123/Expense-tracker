let allTransactions = []

function renderTransactions(transactions) {
    const list = document.getElementById("transactions-list")
    list.innerHTML = transactions.map(t => `
        <div class="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: ${t.category_color}22">
                    <span class="w-2 h-2 rounded-full" style="background: ${t.category_color}"></span>
                </div>
                <div>
                    <div class="font-medium">${t.name}</div>
                    <div class="text-sm text-zinc-500">${t.category ?? "Brak kategorii"}</div>
                </div>
            </div>
            <div class="flex items-center gap-6">
                <div class="text-right">
                    <div class="font-medium ${t.type === 'expense' ? 'text-red-400' : 'text-green-400'}">
                        ${t.type === 'expense' ? '-' : '+'}${t.amount} zł
                    </div>
                    <div class="text-sm text-zinc-500">${t.date}</div>
                </div>
                <button onclick="deleteTransaction(${t.id})" class="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join("")
}

function filterTransactions() {
    const filter = document.getElementById("filter-type").value
    const filtered = filter === "all"
        ? allTransactions
        : allTransactions.filter(t => t.type === filter)
    renderTransactions(filtered)
}

async function loadDashboard() {
    const res = await fetch("/api/data")
    const data = await res.json()

    allTransactions = data.transactions

    document.getElementById("api_username").textContent = data.username
    document.getElementById("nav_username").textContent = data.username
    document.getElementById("nav_letter").textContent = data.username[0].toUpperCase()

    const list_categories = document.getElementById("categories-list")
    list_categories.innerHTML = data.categories.map(cat => `
        <div class="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors">
            <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded-full" style="background: ${cat.color}"></div>
                <span class="text-sm">${cat.name}</span>
            </div>
            <button onclick="deleteCategory(${cat.id})" class="text-zinc-500 hover:text-red-400 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            </button>
        </div>
    `).join("")

    const categorySelect = document.getElementById("category_select")
    categorySelect.innerHTML = '<option value="">Select category</option>' +
        data.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join("")

    renderTransactions(allTransactions)
}

async function AddCategory() {
    const name = document.getElementById("category-name").value
    const color = document.getElementById("category-color").value

    const res = await fetch("/api/add_categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color })
    })

    if (res.ok) {
        loadDashboard()
        document.getElementById("category-name").value = ""
    }
}

async function deleteCategory(id) {
    const res = await fetch(`/api/del_category/${id}`, { method: "DELETE" })
    if (res.ok) loadDashboard()
}

function navigate(page) {
    loadDashboard()
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
    document.getElementById(page).classList.add('active')

    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('bg-zinc-800', 'text-white')
        b.classList.add('text-zinc-400')
    })

    document.querySelector(`.nav-btn[data-page="${page}"]`).classList.add('bg-zinc-800', 'text-white')
    document.querySelector(`.nav-btn[data-page="${page}"]`).classList.remove('text-zinc-400')
}

async function addTransaction() {
    const transaction_name = document.getElementById("transaction_name").value
    const transaction_amount = document.getElementById("transaction_amount").value
    const transaction_type = document.getElementById("transaction_type").value
    const transaction_category_id = document.getElementById("category_select").value
    const transaction_date = document.getElementById("transaction_date").value

    const res = await fetch("/api/add_transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_name, transaction_amount, transaction_type, transaction_category_id, transaction_date })
    })

    if (res.ok) loadDashboard()
}

async function deleteTransaction(id) {
    const res = await fetch(`/api/del_transaction/${id}`, { method: "DELETE" })
    if (res.ok) loadDashboard()
}

loadDashboard()