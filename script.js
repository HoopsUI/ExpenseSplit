
/* ================= BASIC ================= */
function basicSplit() {
  const amount = +document.getElementById("basicAmount").value;
  const people = +document.getElementById("basicPeople").value;
  if (!amount || !people) return;
  document.getElementById("basicResult").innerHTML =
    `<h3>Each Pays: ₹${(amount / people).toFixed(2)}</h3>`;
  document.getElementById("basicResult").classList.remove("hidden");
}

/* ================= PREMIUM ================= */
const people = [];
const expenses = [];

function isPremium() {
  return localStorage.getItem("isPremium") === "true";
}

function unlockPremium() {
  // Razorpay can replace this later
  localStorage.setItem("isPremium", "true");
  document.getElementById("premiumLock").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  if (!isPremium() && document.getElementById("premiumLock")) {
    document.getElementById("premiumLock").style.display = "flex";
  }
});

function addPerson() {
  const name = personName.value.trim();
  if (!name) return;
  people.push(name);
  personName.value = "";
  renderPeople();
}

function renderPeople() {
  peopleList.innerHTML = "";
  paidBy.innerHTML = "";
  splitBetween.innerHTML = "";

  people.forEach(p => {
    peopleList.innerHTML += `<li>${p}</li>`;
    paidBy.innerHTML += `<option>${p}</option>`;
    splitBetween.innerHTML += `<label><input type="checkbox" value="${p}" checked> ${p}</label><br>`;
  });
}

function addExpense() {
  const amount = +expenseAmount.value;
  const desc = expenseDesc.value;
  const payer = paidBy.value;
  const split = [...splitBetween.querySelectorAll("input:checked")].map(i => i.value);

  expenses.push({ amount, payer, split });
  expenseList.innerHTML += `<li>${desc} – ${amount}</li>`;
}

function calculate() {
  const balances = {};
  people.forEach(p => balances[p] = 0);

  expenses.forEach(e => {
    const share = e.amount / e.split.length;
    e.split.forEach(p => balances[p] -= share);
    balances[e.payer] += e.amount;
  });

  let output = "<h3>Settlements</h3>";
  Object.entries(balances).forEach(([p, amt]) => {
    if (amt < 0) {
      output += `<p>${p} pays ${Math.abs(amt).toFixed(2)}</p>`;
    }
  });
  results.innerHTML = output;
}
