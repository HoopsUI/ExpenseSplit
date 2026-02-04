
const peopleInput = document.getElementById("people");
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

document.getElementById("splitType").addEventListener("change", function () {
  document.getElementById("unequalInputs").style.display =
    this.value === "unequal" ? "block" : "none";
});

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

// ===== PHASE 2: PARTICIPANTS =====

// Run ONLY if Advanced Calculator exists
const addPersonBtn = document.getElementById("addPersonBtn");

if (addPersonBtn) {
  // Data store
  let participants = [];

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
