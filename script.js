
/***************************************
 BASIC CALCULATOR (index.html only)
****************************************/
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

  window.calculateSplit = function () {
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
      names.push(
        document.getElementById(`name-${i}`).value || `Person ${i}`
      );
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
        alert("Please enter valid shares.");
        return;
      }

      const sumShares = shares.reduce((a, b) => a + b, 0);
      summaryText.innerText = `Total expense of ${currency}${total} split unequally.`;

      shares.forEach((s, i) => {
        const amount = ((s / sumShares) * total).toFixed(2);
        resultTable.innerHTML += `
          <tr>
            <td>${names[i]}</td>
            <td>${currency}${amount}</td>
          </tr>`;
      });
    }
  };
}

/***************************************
 ADVANCED CALCULATOR (advanced.html only)
****************************************/
const advancedPage = document.getElementById("addParticipantBtn");

if (advancedPage) {
   const premiumLock = document.getElementById("premiumLock");
  const unlockBtn = document.getElementById("unlockPreviewBtn");

  function isPremiumUser() {
    return localStorage.getItem("expenseSplitPremium") === "true";
  }

  function unlockPremium() {
    localStorage.setItem("expenseSplitPremium", "true");
    premiumLock.style.display = "none";
  }

  if (isPremiumUser()) {
    premiumLock.style.display = "none";
  }

  unlockBtn.addEventListener("click", unlockPremium);
  let participants = [];
  let expenses = [];

  const currencySelect = document.getElementById("currency");
  const participantInput = document.getElementById("participantName");
  const participantsList = document.getElementById("participantsList");
  const paidBySelect = document.getElementById("paidBy");
  const splitBetweenDiv = document.getElementById("splitBetween");

  const expenseDescInput = document.getElementById("expenseDescription");
  const expenseAmountInput = document.getElementById("expenseAmount");
  const expensesList = document.getElementById("expensesList");

  const resultsDiv = document.getElementById("results");
  const settlementsDiv = document.getElementById("settlements");

  function getCurrency() {
    return currencySelect.value;
  }

  // Load saved data
  participants = JSON.parse(localStorage.getItem("advParticipants")) || [];
  expenses = JSON.parse(localStorage.getItem("advExpenses")) || [];

  document.getElementById("addParticipantBtn").addEventListener("click", () => {
    const name = participantInput.value.trim();
    if (!name || participants.includes(name)) return;

    participants.push(name);
    participantInput.value = "";
    saveData();
    renderParticipants();
  });

  function renderParticipants() {
    participantsList.innerHTML = "";
    paidBySelect.innerHTML = `<option value="">Select person</option>`;
    splitBetweenDiv.innerHTML = "";

    participants.forEach(name => {
      participantsList.innerHTML += `<li>${name}</li>`;

      paidBySelect.innerHTML += `<option value="${name}">${name}</option>`;

      splitBetweenDiv.innerHTML += `
        <label>
          <input type="checkbox" value="${name}" checked> ${name}
        </label><br>`;
    });
  }

  document.getElementById("addExpenseBtn").addEventListener("click", () => {
    const amount = parseFloat(expenseAmountInput.value);
    const paidBy = paidBySelect.value;
    const splitBetween = Array.from(
      splitBetweenDiv.querySelectorAll("input:checked")
    ).map(cb => cb.value);

    if (!amount || !paidBy || splitBetween.length === 0) return;

    expenses.push({
      desc: expenseDescInput.value || "Expense",
      amount,
      paidBy,
      splitBetween
    });

    expenseDescInput.value = "";
    expenseAmountInput.value = "";
    saveData();
    renderExpenses();
  });

  function renderExpenses() {
    expensesList.innerHTML = "";
    expenses.forEach(e => {
      expensesList.innerHTML += `<li>${e.desc} — ${getCurrency()}${e.amount} (Paid by ${e.paidBy})</li>`;
    });
  }

  document.getElementById("calculateBtn").addEventListener("click", () => {
    const balances = {};
    participants.forEach(p => balances[p] = 0);

    expenses.forEach(e => {
      const share = e.amount / e.splitBetween.length;
      balances[e.paidBy] += e.amount;
      e.splitBetween.forEach(p => balances[p] -= share);
    });

    renderResults(balances);
    renderSettlements(balances);
  });

  function renderResults(balances) {
    resultsDiv.innerHTML = "<h3>Final Balances</h3>";
    Object.keys(balances).forEach(name => {
      const val = balances[name];
      resultsDiv.innerHTML += `<p>${name}: ${getCurrency()}${val.toFixed(2)}</p>`;
    });
  }

  function renderSettlements(balances) {
    settlementsDiv.innerHTML = "<h3>Settlements</h3>";
    const debtors = [], creditors = [];

    Object.entries(balances).forEach(([name, amt]) => {
      if (amt < 0) debtors.push({ name, amt: -amt });
      if (amt > 0) creditors.push({ name, amt });
    });

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].amt, creditors[j].amt);
      settlementsDiv.innerHTML += `<p>${debtors[i].name} pays ${creditors[j].name} ${getCurrency()}${pay.toFixed(2)}</p>`;
      debtors[i].amt -= pay;
      creditors[j].amt -= pay;
      if (debtors[i].amt === 0) i++;
      if (creditors[j].amt === 0) j++;
    }
  }

  function saveData() {
    localStorage.setItem("advParticipants", JSON.stringify(participants));
    localStorage.setItem("advExpenses", JSON.stringify(expenses));
  }

  renderParticipants();
  renderExpenses();
}
