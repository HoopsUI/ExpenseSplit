
// ===== BASIC CALCULATOR (index.html only) =====
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

  const splitTypeEl = document.getElementById("splitType");
  const unequalInputs = document.getElementById("unequalInputs");

  if (splitTypeEl && unequalInputs) {
    splitTypeEl.addEventListener("change", function () {
      unequalInputs.style.display =
        this.value === "unequal" ? "block" : "none";
    });
  }

  function calculateSplit() {
    const total = parseFloat(document.getElementById("totalAmount").value);
    const people = parseInt(document.getElementById("people").value);
    const type = document.getElementById("splitType").value;
    const currency = document.getElementById("currency").value;

    const resultBox = document.getElementById("result");
    const summaryText = document.getElementById("summaryText");
    const resultTable = document.getElementById("resultTable");

    if (!total || !people || people <= 0) {
      alert("Please enter valid values.");
      return;
    }

    const names = [];
    for (let i = 1; i <= people; i++) {
      const name = document.getElementById(`name-${i}`).value || `Person ${i}`;
      names.push(name);
    }

    resultTable.innerHTML = "";
    resultBox.classList.remove("hidden");

    if (type === "equal") {
      const share = (total / people).toFixed(2);
      summaryText.innerText = `Total expense of ${currency}${total} split equally among ${people} people.`;

      names.forEach(name => {
        resultTable.innerHTML += `
          <tr>
            <td>${name}</td>
            <td>${currency}${share}</td>
          </tr>`;
      });
    }

    if (type === "unequal") {
      const shares = document.getElementById("shares").value
        .split(",")
        .map(Number);

      if (shares.length !== people || shares.some(isNaN)) {
        alert("Please enter valid shares matching number of people.");
        return;
      }

      const sumShares = shares.reduce((a, b) => a + b, 0);
      summaryText.innerText = `Total expense of ${currency}${total} split unequally based on usage.`;

      shares.forEach((s, i) => {
        const amount = ((s / sumShares) * total).toFixed(2);
        resultTable.innerHTML += `
          <tr>
            <td>${names[i]}</td>
            <td>${currency}${amount}</td>
          </tr>`;
      });
    }
  }
}

// ===== SHARED DATA (Advanced Calculator) =====
let participants = [];
let expenses = [];


// ===== PHASE 2: PARTICIPANTS =====

// Run ONLY if Advanced Calculator exists
const addPersonBtn = document.getElementById("addPersonBtn");

if (addPersonBtn) {
  // Data store
  

  // DOM elements
  const personInput = document.getElementById("personName");
  const peopleList = document.getElementById("peopleList");
  const paidBySelect = document.getElementById("paidBy");
  const splitBetweenDiv = document.getElementById("splitBetween");

  // Add person
  addPersonBtn.addEventListener("click", () => {
    const name = personInput.value.trim();

    // Validation
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

  // Render participants everywhere
  function renderParticipants() {
    // List
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
}


// ===== PHASE 3: EXPENSES =====

if (document.getElementById("addExpenseBtn")) {
  const expenseTitleInput = document.getElementById("expenseTitle");
  const expenseAmountInput = document.getElementById("expenseAmount");
  const addExpenseBtn = document.getElementById("addExpenseBtn");
  const expenseList = document.getElementById("expenseList");

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

  function renderExpenses() {
    expenseList.innerHTML = "";
    expenses.forEach(exp => {
      const li = document.createElement("li");
      li.textContent = `${exp.title} – ${exp.amount} (Paid by ${exp.paidBy})`;
      expenseList.appendChild(li);
    });
  }
}

// ===== PHASE 4: CALCULATIONS =====

if (document.getElementById("calculateBtn")) {
  const calculateBtn = document.getElementById("calculateBtn");
  const resultsDiv = document.getElementById("results");

  calculateBtn.addEventListener("click", () => {
    if (participants.length === 0 || expenses.length === 0) {
      alert("Add participants and expenses first.");
      return;
    }

    const balances = {};

    participants.forEach(name => {
      balances[name] = 0;
    });

    expenses.forEach(exp => {
      const share = exp.amount / exp.splitBetween.length;

      balances[exp.paidBy] += exp.amount;

      exp.splitBetween.forEach(person => {
        balances[person] -= share;
      });
    });

    renderResults(balances);
  });

  function renderResults(balances) {
    resultsDiv.innerHTML = "";
    const list = document.createElement("ul");

    Object.keys(balances).forEach(name => {
      const li = document.createElement("li");
      const value = balances[name].toFixed(2);

      if (balances[name] > 0) {
        li.textContent = `${name} gets ${value}`;
      } else if (balances[name] < 0) {
        li.textContent = `${name} owes ${Math.abs(value)}`;
      } else {
        li.textContent = `${name} is settled`;
      }

      list.appendChild(li);
    });

    resultsDiv.appendChild(list);
  }
}

// ===== PHASE 5: SETTLEMENTS =====

function renderResults(balances) {
  resultsDiv.innerHTML = "";

  // Balances list
  const balanceList = document.createElement("ul");

  Object.keys(balances).forEach(name => {
    const li = document.createElement("li");
    const value = balances[name].toFixed(2);

    if (balances[name] > 0) {
      li.textContent = `${name} gets ${value}`;
    } else if (balances[name] < 0) {
      li.textContent = `${name} owes ${Math.abs(value)}`;
    } else {
      li.textContent = `${name} is settled`;
    }

    balanceList.appendChild(li);
  });

  resultsDiv.appendChild(balanceList);

  // Settlements
  const settlements = generateSettlements(balances);

  if (settlements.length > 0) {
    const heading = document.createElement("h4");
    heading.textContent = "Settlements";
    resultsDiv.appendChild(heading);

    const settlementList = document.createElement("ul");

    settlements.forEach(text => {
      const li = document.createElement("li");
      li.textContent = text;
      settlementList.appendChild(li);
    });

    resultsDiv.appendChild(settlementList);
  }
}


  function generateSettlements(balances) {
  const debtors = [];
  const creditors = [];

  // Separate people
  Object.keys(balances).forEach(name => {
    const amount = Number(balances[name].toFixed(2));

    if (amount < 0) {
      debtors.push({ name, amount: -amount });
    } else if (amount > 0) {
      creditors.push({ name, amount });
    }
  });

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const payAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push(
      `${debtor.name} pays ${creditor.name} ${payAmount.toFixed(2)}`
    );

    debtor.amount -= payAmount;
    creditor.amount -= payAmount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return settlements;
}

