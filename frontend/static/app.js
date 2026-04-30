let allTransactions = []

function renderTransactions(transactions, limit = null) {
    const toRender = limit ? transactions.slice(0, limit) : transactions
    const lists = document.querySelectorAll(".transactions-list")
    const html = toRender.map(t => `
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
    
    lists.forEach(list => {
        list.innerHTML = html
    })
}

function filterTransactions() {
    const filter = document.getElementById("filter-type").value
    const filtered = filter === "all"
        ? allTransactions
        : allTransactions.filter(t => t.type === filter)
    renderTransactions(filtered)
}

async function loadDashboard() {
    try {
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
        categorySelect.innerHTML = '<option value="">-</option>' +
        data.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join("")


        const activePage = document.querySelector('.page.active')?.id
        
        if (activePage === 'dashboard') {
            renderTransactions(allTransactions, 5)  
        } 
        else if (activePage === 'transactions') {
            renderTransactions(allTransactions) 
        } 
        else if (activePage === 'charts') {
            renderChart()
        }


        await monthTransaction()
        await weekTransaction()
        todayTransaction()

    } catch (error) {
        console.error("BŁĄD w loadDashboard:", error)
    }

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
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
    document.getElementById(page).classList.add('active')

    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('bg-zinc-800', 'text-white')
        b.classList.add('text-zinc-400')
    })

    document.querySelector(`.nav-btn[data-page="${page}"]`).classList.add('bg-zinc-800', 'text-white')
    document.querySelector(`.nav-btn[data-page="${page}"]`).classList.remove('text-zinc-400')

    if (page === 'dashboard') {
        loadDashboard()
    } else if (page === 'transactions') {
        loadDashboard()
    } else if (page === 'charts') {
        loadDashboard()
        setTimeout(() => renderChart(), 100)
    }
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

    if (res.ok) {
        document.getElementById("transaction_name").value = ""
        document.getElementById("transaction_amount").value = ""
        document.getElementById("category_select").value = ""
        document.getElementById("transaction_date").value = ""
        loadDashboard()
    }
}

async function deleteTransaction(id) {
    const res = await fetch(`/api/del_transaction/${id}`, { method: "DELETE" })
    if (res.ok) loadDashboard()
}

async function monthTransaction() {


    const res = await fetch("/api/month_transactions")
    const data = await res.json()

    document.getElementById("this-month").textContent = data.sum_all
    
    const fromLastMonth = document.getElementById("from-last-month")
    
    if (data.sum_all >= 0) {
        fromLastMonth.textContent = "You're saving money :)"
        fromLastMonth.classList.remove('text-red-400')
        fromLastMonth.classList.add('text-green-400')
    } else {
        fromLastMonth.textContent = "You're spending money :("
        fromLastMonth.classList.remove('text-green-400')
        fromLastMonth.classList.add('text-red-400')
    }
}

async function weekTransaction() {


    const res = await fetch("/api/week_transactions")
    const data = await res.json()

    document.getElementById("this-week").textContent = data.sum_all
    
    const fromLastWeek = document.getElementById("from-last-week")
    
    if (data.sum_all >= 0) {
        fromLastWeek.textContent = "You're saving money :)"
        fromLastWeek.classList.remove('text-red-400')
        fromLastWeek.classList.add('text-green-400')
    } else {
        fromLastWeek.textContent = "You're spending money :("
        fromLastWeek.classList.remove('text-green-400')
        fromLastWeek.classList.add('text-red-400')
    }
}

async function todayTransaction() {


    const res = await fetch("/api/today_transactions")
    const data = await res.json()

    document.getElementById("this-day").textContent = data.sum_all
    
    document.getElementById("this-day-len").textContent = data.transactions_len
    
}

let chartInstance = null;

async function renderChart() {
    if (chartInstance) {
        chartInstance.destroy()
    }

    const res = await fetch("/api/data")
    const data = await res.json()
    
    const categoryTotals = {}
    const categoryColors = {}
    
    data.transactions.forEach(t => {
        if (t.type === 'expense') {
            const categoryName = t.category || 'Unknown'
            
            if (!categoryTotals[categoryName]) {
                categoryTotals[categoryName] = 0
                categoryColors[categoryName] = t.category_color || '#FF6B6B'
            }
            categoryTotals[categoryName] += Math.abs(t.amount)
        }
    })
    
    if (Object.keys(categoryTotals).length === 0) {
        return
    }
    
    const labels = Object.keys(categoryTotals)
    const amounts = Object.values(categoryTotals)
    const colors = labels.map(cat => categoryColors[cat] || '#FF6B6B')
    
    const ctx = document.getElementById('myChart')
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Wydatki według kategorii',
                data: amounts,
                backgroundColor: colors,
                borderColor: colors.map(c => c + '80'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Wydatki według kategorii'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Kwota (zł)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Kategoria'
                    }
                }
            }
        }
    })
}

async function logOut(){
    const res = await fetch("/api/logout")
    if (res.ok || res.status === 303) {
        window.location.href = "/login"
    }
}


document.addEventListener('DOMContentLoaded', loadDashboard)