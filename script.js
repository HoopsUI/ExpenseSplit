
/*************************************************
 * BASIC CALCULATOR (index.html)
 *************************************************/

const calculatorForm = document.getElementById("calculatorForm");

if (calculatorForm) {
  calculatorForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const amountInput = document.getElementById("amount");
    const peopleInput = document.getElementById("people");
    const currencySelect = document.getElementById("currency");

    const total = parseFloat(amountInput.value);
    const people = parseInt(peopleInput.value);
    const currency = currencySelect.value;

    const resultBox = document.getElementById("result");

    if (!total || total <= 0 || !people || people <= 0) {
      alert("Please enter valid amount and number of people.");
      return;
    }

    const perPerson = (total / people).toFixed(2);

    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `
      <h3>Split Result</h3>
      <p>Total: <strong>${currency}${total.toFixed(2)}</strong></p>
      <p>Each person pays: <strong>${currency}${perPerson}</strong></p>
    `;
  });
}

/*************************************************
 * SHARED DATA (Advanced Calculator)
 *************************************************/

let participants = [];
let expenses = [];

/*************************************************
 * ADVANCED CALCULATOR – PARTICIPANTS
 *************************************************/

const addPersonBtn = document.getElementById("addPersonBtn");
const personInput = document.getElementById("personName");
const peopleList = document.getElementById("peopleList");
const paidBySelect = document.getElementById("paidBy");
const splitBetweenDiv = document.getElementById("splitBetween");

if (addPersonBtn) {
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
  });
}

function renderParticipants() {
  // Render list
  peopleList.innerHTML = "";
  participants.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    peopleList.appendChild(li);
  });

  // Paid by dropdown
  paidBySelect.innerHTML = `<option value="">Select person</option>`;
  participants.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    paidBySelect.appendChild(option);
  });

  // Split between checkboxes
  splitBetweenDiv.innerHTML = "";
  participants.forEach((name) => {
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

/*************************************************
 * ADVANCED CALCULATOR – EXPENSES
 *************************************************/

const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseTitleInput = document.getElementById("expenseTitle");
const expenseAmountInput = document.getElementById("expenseAmount");
const expenseList = document.getElementById("expenseList");

if (addExpenseBtn) {
  addExpenseBtn.addEventListener("click", () => {
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

    expenses.push({
      title,
      amount,
      paidBy,
      splitBetween: selectedPeople
    });

    expenseTitleInput.value = "";
    expenseAmountInput.value = "";

    renderExpenses();
  });
}

function renderExpenses() {
  expenseList.innerHTML = "";
  expenses.forEach(exp => {
    const li = document.createElement("li");
    li.textContent = `${exp.title} – ${getCurrency()}${exp.amount.toFixed(2)} (Paid by ${exp.paidBy})`;
    expenseList.appendChild(li);
  });
}

/*************************************************
 * ADVANCED CALCULATOR – CALCULATIONS
 *************************************************/

const calculateBtn = document.getElementById("calculateBtn");
const resultsDiv = document.getElementById("results");

if (calculateBtn) {
  calculateBtn.addEventListener("click", () => {
    if (participants.length === 0 || expenses.length === 0) {
      alert("Add participants and expenses first.");
      return;
    }

    const balances = {};
    participants.forEach(name => balances[name] = 0);

    expenses.forEach(exp => {
      const share = exp.amount / exp.splitBetween.length;

      balances[exp.paidBy] += exp.amount;
      exp.splitBetween.forEach(person => {
        balances[person] -= share;
      });
    });

    renderResults(balances);
  });
}

function renderResults(balances) {
  resultsDiv.innerHTML = "";
  const list = document.createElement("ul");

  Object.keys(balances).forEach(name => {
    const li = document.createElement("li");
    const value = balances[name];
    const amount = Math.abs(value).toFixed(2);
    const currency = getCurrency();

    if (value > 0) {
      li.textContent = `${name} gets ${currency}${amount}`;
    } else if (value < 0) {
      li.textContent = `${name} owes ${currency}${amount}`;
    } else {
      li.textContent = `${name} is settled`;
    }

    list.appendChild(li);
  });

  resultsDiv.appendChild(list);
}

/*************************************************
 * CURRENCY
 *************************************************/

const currencySelect = document.getElementById("currency");

function getCurrency() {
  return currencySelect ? currencySelect.value : "";
}

/*************************************************
 * PREMIUM HOOK (INACTIVE – FOR LATER)
 *************************************************/
// function isPremiumUser() {
//   return false; // to be replaced with URL / payment check
// }
