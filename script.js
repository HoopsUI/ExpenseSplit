
// ================================
// BASIC CALCULATOR (index.html only)
// ================================
const peopleInput = document.getElementById("people");

if (peopleInput) {
  const namesContainer = document.getElementById("namesContainer");

  peopleInput.addEventListener("input", () => {
    const count = parseInt(peopleInput.value);
    namesContainer.innerHTML = "";

    if (!count || count <= 0 || count > 20) return;

    for (let i = 1; i <= count; i++) {
      namesContainer.innerHTML += `
        <div class="name-input">
          <input type="text" placeholder="Person ${i} name" id="name-${i}">
        </div>`;
    }
  });
}

// Track basic calculator submit
const calculatorForm = document.getElementById("calculatorForm");
if (calculatorForm) {
  calculatorForm.addEventListener("submit", () => {
    trackEvent("basic_calculate", {
      people_count: parseInt(peopleInput?.value || 0)
    });
  });
}

// =======================================
// PREMIUM ACCESS (NON-BREAKING, FUTURE-READY)
// =======================================
function isPremiumUser() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("premium") === "true") {
    localStorage.setItem("expenseSplitPremium", "true");
    return true;
  }

  return localStorage.getItem("expenseSplitPremium") === "true";
}

function unlockPremium() {
  localStorage.setItem("expenseSplitPremium", "true");
  initPremiumOverlay();

  trackEvent("premium_unlock", {
    source: "advanced_calculator"
  });
}

function lockPremium() {
  localStorage.removeItem("expenseSplitPremium");
  initPremiumOverlay();
}

function initPremiumOverlay() {
  const overlay = document.getElementById("premiumOverlay");
  if (!overlay) return;

  overlay.style.display = isPremiumUser() ? "none" : "flex";
}

window.addEventListener("DOMContentLoaded", initPremiumOverlay);

// ================================
// SHARED DATA (Advanced Calculator)
// ================================
let participants = [];
let expenses = [];

const paidBySelect = document.getElementById("paidBy");
const splitBetweenDiv = document.getElementById("splitBetween");

// ================================
// PHASE 2: PARTICIPANTS
// ================================
const addPersonBtn = document.getElementById("addPersonBtn");

if (addPersonBtn) {
  const personInput = document.getElementById("personName");
  const peopleList = document.getElementById("peopleList");

  addPersonBtn.classList.add("btn-advanced");

  addPersonBtn.addEventListener("click", () => {
    const name = personInput.value.trim();

    if (!name) {
      alert("Please enter a name.");
      return;
    }

    if (participants.includes(name)) {
      alert("This person already exists.");
      return;
    }

    participants.push(name);
    personInput.value = "";
    renderParticipants();

    trackEvent("advanced_add_person", {
      participant_count: participants.length
    });
  });

  function renderParticipants() {
    peopleList.innerHTML = "";
    participants.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      peopleList.appendChild(li);
    });

    paidBySelect.innerHTML = `<option value="">Select person</option>`;
    splitBetweenDiv.innerHTML = "";

    participants.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      paidBySelect.appendChild(option);

      const label = document.createElement("label");
      label.style.display = "block";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = name;
      checkbox.checked = true;

      label.appendChild(checkbox);
      label.append(" " + name);
      splitBetweenDiv.appendChild(label);
    });
  }
}

// ================================
// PHASE 3: EXPENSES
// ================================
if (document.getElementById("addExpenseBtn")) {
  const expenseTitleInput = document.getElementById("expenseTitle");
  const expenseAmountInput = document.getElementById("expenseAmount");
  const addExpenseBtn = document.getElementById("addExpenseBtn");
  const expenseList = document.getElementById("expenseList");

  addExpenseBtn.classList.add("btn-advanced");

  addExpenseBtn.addEventListener("click", () => {
    if (participants.length === 0) {
      alert("Add participants first.");
      return;
    }

    const title = expenseTitleInput.value.trim() || "Expense";
    const amount = parseFloat(expenseAmountInput.value);
    const paidBy = paidBySelect.value;

    const selectedPeople = Array.from(
      splitBetweenDiv.querySelectorAll("input[type='checkbox']:checked")
    ).map(cb => cb.value);

    if (!amount || amount <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    if (!paidBy) {
      alert("Select who paid.");
      return;
    }

    if (selectedPeople.length === 0) {
      alert("Select at least one person to split with.");
      return;
    }

    expenses.push({ title, amount, paidBy, splitBetween: selectedPeople });

    expenseTitleInput.value = "";
    expenseAmountInput.value = "";

    renderExpenses();

    trackEvent("advanced_add_expense", {
      expense_count: expenses.length,
      amount: amount
    });
  });

  function renderExpenses() {
    expenseList.innerHTML = "";
    expenses.forEach(exp => {
      const li = document.createElement("li");
      li.textContent = `${exp.title} – ${getCurrency()}${exp.amount} (Paid by ${exp.paidBy})`;
      expenseList.appendChild(li);
    });
  }
}

// ================================
// PHASE 4: CALCULATIONS
// ================================
if (document.getElementById("calculateBtn")) {
  const calculateBtn = document.getElementById("calculateBtn");
  const resultsDiv = document.getElementById("results");

  calculateBtn.addEventListener("click", () => {
    if (participants.length === 0 || expenses.length === 0) {
      alert("Add participants and expenses first.");
      return;
    }

    const balances = {};
    participants.forEach(name => (balances[name] = 0));

    expenses.forEach(exp => {
      const share = exp.amount / exp.splitBetween.length;
      balances[exp.paidBy] += exp.amount;
      exp.splitBetween.forEach(person => {
        balances[person] -= share;
      });
    });

    renderResults(balances);

    trackEvent("advanced_calculate", {
      participant_count: participants.length,
      expense_count: expenses.length
    });
  });

  function renderResults(balances) {
    resultsDiv.innerHTML = "";
    const list = document.createElement("ul");

    Object.keys(balances).forEach(name => {
      const li = document.createElement("li");
      const amount = Math.abs(balances[name]).toFixed(2);
      const value = `${getCurrency()}${amount}`;

      if (balances[name] > 0) li.textContent = `${name} gets ${value}`;
      else if (balances[name] < 0) li.textContent = `${name} owes ${value}`;
      else li.textContent = `${name} is settled`;

      list.appendChild(li);
    });

    resultsDiv.appendChild(list);
  }
}

// ================================
// CURRENCY
// ================================
const currencySelect = document.getElementById("currency");

function getCurrency() {
  return currencySelect ? currencySelect.value : "";
}

// ================================
// EVENT TRACKING (GA4 SAFE)
// ================================
function trackEvent(eventName, params = {}) {
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
  }
}
