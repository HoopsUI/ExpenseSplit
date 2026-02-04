
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

  resultTable.innerHTML = "";
  resultBox.classList.remove("hidden");

  if (type === "equal") {
    const share = (total / people).toFixed(2);
    summaryText.innerText = `Total expense of ${currency}${total} split equally among ${people} people.`;

    for (let i = 1; i <= people; i++) {
      resultTable.innerHTML += `
        <tr>
          <td>Person ${i}</td>
          <td>${currency}${share}</td>
        </tr>`;
    }
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
          <td>Person ${i + 1}</td>
          <td>${currency}${amount}</td>
        </tr>`;
    });
  }
}
