
document.getElementById("splitType").addEventListener("change", function () {
  document.getElementById("unequalInputs").style.display =
    this.value === "unequal" ? "block" : "none";
});

function calculateSplit() {
  const total = parseFloat(document.getElementById("totalAmount").value);
  const people = parseInt(document.getElementById("people").value);
  const type = document.getElementById("splitType").value;
  const currency = document.getElementById("currency").value;
  const result = document.getElementById("result");

  if (!total || !people || people <= 0) {
    result.innerHTML = "Please enter valid values.";
    return;
  }

  if (type === "equal") {
    const share = (total / people).toFixed(2);
    result.innerHTML = `Each person pays: <strong>${currency}${share}</strong>`;
  }

  if (type === "unequal") {
    const shares = document.getElementById("shares").value
      .split(",")
      .map(Number);

    if (shares.length !== people) {
      result.innerHTML = "Number of shares must match number of people.";
      return;
    }

    const sumShares = shares.reduce((a, b) => a + b, 0);
    let output = "<strong>Split Result:</strong><br>";

    shares.forEach((s, i) => {
      const amount = ((s / sumShares) * total).toFixed(2);
      output += `Person ${i + 1}: ${currency}${amount}<br>`;
    });

    result.innerHTML = output;
  }
}
