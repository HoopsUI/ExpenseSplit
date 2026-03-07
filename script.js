// ================================
// TRIP CALCULATOR (trip.html support)
// ================================
const tripPeopleInput = document.getElementById("numPeople");
if (tripPeopleInput) {
  const tripNamesContainer = document.getElementById("peopleNames");
  const tripNumExpenses = document.getElementById("numExpenses");
  const tripExpensesList = document.getElementById("expensesList");
  const tripCalculateBtn = document.getElementById("calculateBtn");
  const tripResultsDiv = document.getElementById("results");

  // Track people input
  tripPeopleInput.addEventListener("input", () => {
    const count = parseInt(tripPeopleInput.value);
    tripNamesContainer.innerHTML = "";

    if (!count || count <= 0 || count > 20) return;

    for (let i = 1; i <= count; i++) {
      tripNamesContainer.innerHTML += `
        <div class="name-input">
          <input type="text" placeholder="Person ${i} name" id="trip-name-${i}">
        </div>`;
    }
  });

  // Initialize participants & expenses arrays for trip page
  let tripParticipants = [];
  let tripExpenses = [];

  // Add participant names when numPeople changes
  function collectTripParticipants() {
    tripParticipants = [];
    for (let i = 1; i <= parseInt(tripPeopleInput.value); i++) {
      const nameInput = document.getElementById(`trip-name-${i}`);
      if (nameInput && nameInput.value.trim() !== "") {
        tripParticipants.push(nameInput.value.trim());
      }
    }
  }

  // Calculate button logic
  tripCalculateBtn.addEventListener("click", () => {
    collectTripParticipants();

    if (tripParticipants.length === 0) {
      alert("Please enter participant names.");
      return;
    }

    // Collect expenses
    tripExpenses = [];
    if (tripNumExpenses && tripExpensesList) {
      const expenseCount = parseInt(tripNumExpenses.value) || 0;

      for (let i = 1; i <= expenseCount; i++) {
        const titleInput = document.getElementById(`expense-title-${i}`);
        const amountInput = document.getElementById(`expense-amount-${i}`);
        const paidBySelect = document.getElementById(`paid-by-${i}`);
        const splitCheckboxes = document.querySelectorAll(`.split-${i} input[type="checkbox"]:checked`);

        if (!titleInput || !amountInput || !paidBySelect) continue;

        const title = titleInput.value.trim() || `Expense ${i}`;
        const amount = parseFloat(amountInput.value) || 0;
        const paidBy = paidBySelect.value;
        const splitBetween = Array.from(splitCheckboxes).map(cb => cb.value);

        if (amount <= 0 || !paidBy || splitBetween.length === 0) continue;

        tripExpenses.push({ title, amount, paidBy, splitBetween });
      }
    }

    if (tripExpenses.length === 0) {
      alert("Please enter valid expenses.");
      return;
    }

    // Calculate balances
    const balances = {};
    tripParticipants.forEach(name => (balances[name] = 0));

    tripExpenses.forEach(exp => {
      const share = exp.amount / exp.splitBetween.length;
      balances[exp.paidBy] += exp.amount;
      exp.splitBetween.forEach(person => {
        balances[person] -= share;
      });
    });

    // Render results
    tripResultsDiv.innerHTML = "";
    const list = document.createElement("ul");
    Object.keys(balances).forEach(name => {
      const li = document.createElement("li");
      const amount = Math.abs(balances[name]).toFixed(2);
      if (balances[name] > 0) li.textContent = `${name} gets ${amount}`;
      else if (balances[name] < 0) li.textContent = `${name} owes ${amount}`;
      else li.textContent = `${name} is settled`;
      list.appendChild(li);
    });
    tripResultsDiv.appendChild(list);
  });
}

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
  toggleAdvancedAccess(true);

  trackEvent("premium_unlock", {
    source: "advanced_calculator"
  });
}

function lockPremium() {
  localStorage.removeItem("expenseSplitPremium");
  initPremiumOverlay();
  toggleAdvancedAccess(false);
}

function initPremiumOverlay() {
  const overlay = document.getElementById("premiumOverlay");
  if (!overlay) return;

  const isPremium = isPremiumUser();
  overlay.style.display = isPremium ? "none" : "flex";
  toggleAdvancedAccess(isPremium);
}

window.addEventListener("DOMContentLoaded", initPremiumOverlay);

// =================================================
// ADVANCED CALCULATOR ACCESS CONTROL (NEW, SAFE)
// =================================================
function toggleAdvancedAccess(enabled) {
  const advancedSection = document.querySelector(".advanced-calculator");
  if (!advancedSection) return;

  const controls = advancedSection.querySelectorAll(
    "input, select, button, textarea"
  );

  controls.forEach(el => {
    // Do NOT disable payment overlay buttons
    if (el.closest("#premiumOverlay")) return;

    el.disabled = !enabled;
  });
}

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
    if (!isPremiumUser()) return;

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
    if (!isPremiumUser()) return;

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
    if (!isPremiumUser()) return;

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

// =========================
// FAQ COLLAPSIBLE TOGGLE
// =========================
document.querySelectorAll('.faq-question').forEach((q) => {
  q.addEventListener('click', () => {
    q.classList.toggle('active');
    const answer = q.nextElementSibling;
    answer.classList.toggle('open');
  });
});

// =======================================
// HOMEPAGE EXPENSE CALCULATOR (SAFE ADD)
// =======================================

const personInput = document.getElementById("personName");
const addPersonBtnHome = document.getElementById("addPersonBtn");
const peopleListHome = document.getElementById("peopleList");

const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInputHome = document.getElementById("expenseAmount");
const addExpenseBtnHome = document.getElementById("addExpenseBtn");
const expenseListHome = document.getElementById("expenseList");

const paidByHome = document.getElementById("paidBy");
const calculateBtnHome = document.getElementById("calculateBtn");

const resultBoxHome = document.getElementById("result");
const totalExpenseDisplay = document.getElementById("totalExpense");

const copyResultsBtn = document.getElementById("copyResultsBtn");
const shareBox = document.getElementById("shareBox");

let homeParticipants = [];
let homeExpenses = [];

// =====================
// ADD PERSON
// =====================
if (addPersonBtnHome) {
  addPersonBtnHome.addEventListener("click", () => {

    const name = personInput.value.trim();
    if (!name) return;

    if (homeParticipants.includes(name)) {
      alert("Person already added.");
      return;
    }

    homeParticipants.push(name);
    personInput.value = "";

    renderPeople();
  });
}

function renderPeople() {

  peopleListHome.innerHTML = "";
  paidByHome.innerHTML = `<option value="">Who paid?</option>`;

  homeParticipants.forEach(name => {

    const li = document.createElement("li");
    li.textContent = name;
    peopleListHome.appendChild(li);

    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    paidByHome.appendChild(option);
  });
}

// =====================
// ADD EXPENSE
// =====================
if (addExpenseBtnHome) {

  addExpenseBtnHome.addEventListener("click", () => {

    if (homeParticipants.length === 0) {
      alert("Add people first.");
      return;
    }

    const title = expenseNameInput.value || "Expense";
    const amount = parseFloat(expenseAmountInputHome.value);
    const paidBy = paidByHome.value;

    if (!amount || amount <= 0) {
      alert("Enter valid amount.");
      return;
    }

    if (!paidBy) {
      alert("Select who paid.");
      return;
    }

    homeExpenses.push({
      title,
      amount,
      paidBy
    });

    expenseNameInput.value = "";
    expenseAmountInputHome.value = "";

    renderExpenses();
  });
}

function renderExpenses() {

  expenseListHome.innerHTML = "";

  let total = 0;

  homeExpenses.forEach(exp => {

    total += exp.amount;

    const div = document.createElement("div");
    div.className = "expense-entry";

    div.textContent =
      `${exp.title} – ${getCurrency()}${exp.amount} (Paid by ${exp.paidBy})`;

    expenseListHome.appendChild(div);
  });

  totalExpenseDisplay.textContent = getCurrency() + total.toFixed(2);
}

// =====================
// CALCULATE SPLIT
// =====================
if (calculateBtnHome) {

  calculateBtnHome.addEventListener("click", () => {

    if (homeParticipants.length === 0 || homeExpenses.length === 0) {
      alert("Add people and expenses first.");
      return;
    }

    const balances = {};
homeParticipants.forEach(name => balances[name] = 0);

const splitType = splitTypeSelect.value;

// =====================
// EQUAL SPLIT
// =====================
if (splitType === "equal") {

  homeExpenses.forEach(exp => {

    const share = exp.amount / homeParticipants.length;

    balances[exp.paidBy] += exp.amount;

    homeParticipants.forEach(p => {
      balances[p] -= share;
    });

  });

}

// =====================
// UNEQUAL SPLIT
// =====================
if (splitType === "unequal") {

  const inputs = document.querySelectorAll(".unequal-input");

  inputs.forEach(input => {

    const person = input.dataset.person;
    const value = parseFloat(input.value) || 0;

    balances[person] -= value;

  });

  homeExpenses.forEach(exp => {
    balances[exp.paidBy] += exp.amount;
  });

}

// =====================
// FAIR CONTRIBUTION
// =====================
if (splitType === "fair") {

  const inputs = document.querySelectorAll(".fair-input");

  let totalPercent = 0;

  const contributions = {};

  inputs.forEach(input => {

    const person = input.dataset.person;
    const percent = parseFloat(input.value) || 0;

    contributions[person] = percent;
    totalPercent += percent;

  });

  const totalExpense = homeExpenses.reduce((sum, e) => sum + e.amount, 0);

  Object.keys(contributions).forEach(person => {

    const share = (contributions[person] / totalPercent) * totalExpense;

    balances[person] -= share;

  });

  homeExpenses.forEach(exp => {
    balances[exp.paidBy] += exp.amount;
  });

}

// =====================
// RENDER RESULTS
// =====================
function renderHomeResults(balances) {

  resultBoxHome.classList.remove("hidden");
  resultBoxHome.innerHTML = "<strong>Settlement</strong><br><br>";

  let summaryText = "Expense Settlement:\n";

  const creditors = [];
  const debtors = [];

  Object.keys(balances).forEach(name => {

    const amount = balances[name];

    if (amount > 0) creditors.push({ name, amount });
    if (amount < 0) debtors.push({ name, amount: Math.abs(amount) });
  });

  creditors.forEach(c => {

    debtors.forEach(d => {

      if (d.amount === 0) return;

      const payment = Math.min(c.amount, d.amount);

      if (payment > 0) {

        const line =
          `${d.name} pays ${c.name} ${getCurrency()}${payment.toFixed(2)}`;

        const div = document.createElement("div");
        div.className = "result-item";
        div.textContent = line;

        resultBoxHome.appendChild(div);

        summaryText += line + "\n";

        c.amount -= payment;
        d.amount -= payment;
      }

    });

  });

  shareBox.classList.remove("hidden");

  // COPY RESULTS
  if (copyResultsBtn) {

    copyResultsBtn.onclick = () => {

      navigator.clipboard.writeText(summaryText);

      copyResultsBtn.textContent = "Copied!";
      setTimeout(() => {
        copyResultsBtn.textContent = "Copy Results";
      }, 2000);
    };

  }

}

// ================================
// SPLIT TYPE OPTIONS (HOMEPAGE)
// ================================

const splitTypeSelect = document.getElementById("splitType");
const splitOptions = document.getElementById("splitOptions");

if (splitTypeSelect) {

  splitTypeSelect.addEventListener("change", renderSplitOptions);

}

function renderSplitOptions() {

  if (!splitOptions) return;

  splitOptions.innerHTML = "";

  const type = splitTypeSelect.value;

  if (homeParticipants.length === 0) return;

  // =====================
  // UNEQUAL SPLIT
  // =====================
  if (type === "unequal") {

    homeParticipants.forEach(name => {

      const label = document.createElement("label");
      label.textContent = `${name} amount`;

      const input = document.createElement("input");
      input.type = "number";
      input.placeholder = "Enter amount";
      input.dataset.person = name;
      input.classList.add("unequal-input");

      splitOptions.appendChild(label);
      splitOptions.appendChild(input);

    });

  }

  // =====================
  // FAIR CONTRIBUTION
  // =====================
  if (type === "fair") {

    homeParticipants.forEach(name => {

      const label = document.createElement("label");
      label.textContent = `${name} contribution %`;

      const input = document.createElement("input");
      input.type = "number";
      input.placeholder = "Enter %";
      input.dataset.person = name;
      input.classList.add("fair-input");

      splitOptions.appendChild(label);
      splitOptions.appendChild(input);

    });

  }

}
