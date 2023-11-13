const inputForm = document.querySelector(".input form");
const input = inputForm.elements;
const output = [...document.querySelectorAll(".output form")].map((form) => form.elements);
const outputLink = [...document.querySelectorAll(".output form a")];
const outputURL = new URL("./singleto.php", window.location);
const nf = new Intl.NumberFormat("pt-BR");

function getNumber(input) {
  if (isNaN(input.valueAsNumber)) {
    if ("infinity".startsWith(input.value.toLowerCase())) {
      return Infinity;
    } else if ("-infinity".startsWith(input.value.toLowerCase())) {
      return -Infinity;
    }
  }
  return input.valueAsNumber;
}

function update() {
  const fixed = input.fixed.value;
  const r2emr1 = input.r2emr1.checked;

  for (const field of input) {
    if (field.type === "number") {
      field.valueAsNumber += 0; // because browsers suck
    }
  }

  inputForm.classList.toggle("locked", r2emr1);
  input.fixed.forEach((radio) => {
    const input = radio.parentElement.nextElementSibling;
    input.disabled = input.name != fixed == r2emr1;
  });

  const no = input.no.valueAsNumber;
  const n1 = input.n1.valueAsNumber;
  const n2 = input.n2.valueAsNumber;
  const ni = input.ni.valueAsNumber;

  const d1 = input.d1.valueAsNumber;
  const d2 = input.d2.valueAsNumber;

  const v1 = input.v1.valueAsNumber;
  const v2 = input.v2.valueAsNumber;

  const phi = 1 / getNumber(input.f);
  const phi1 = phi * v1 / (v1 - v2);
  const phi2 = phi * v2 / (v2 - v1);

  let r1, r2, r3;

  if (fixed === "r1") {
    r1 = getNumber(input.r1);
    r2 = (1 - n1) * (1 - (n1 - no) * d1 / n1 / r1) / (phi1 - (n1 - no) / r1);
    r3 = (ni - n2) * (1 - (n2 - 1) * d2 / n2 / r2) / (phi2 - (n2 - 1) / r2);
  } else if (fixed === "r2") {
    r2 = getNumber(input.r2);
    r1 = (n1 - no) * (1 - (1 - n1) * d1 / n1 / r2) / (phi1 - (1 - n1) / r2);
    r3 = (ni - n2) * (1 - (n2 - 1) * d2 / n2 / r2) / (phi2 - (n2 - 1) / r2);
  } else if (fixed === "r3") {
    r3 = getNumber(input.r3);
    r2 = (n2 - 1) * (1 - (ni - n2) * d2 / n2 / r3) / (phi2 - (ni - n2) / r3);
    r1 = (n1 - no) * (1 - (1 - n1) * d1 / n1 / r2) / (phi1 - (1 - n1) / r2);
  } else { // f
    r1 = (-n1 + 2 * n1 * n1 - n1 * no + Math.sqrt((n1 - 2 * n1 * n1 + n1 * no) ** 2 - 4 * n1 * d1 * phi1 * (-n1 + n1 * n1 + no - n1 * no))) / (2 * n1 * phi1);
    r2 = -r1;
    r3 = (ni - n2) * (1 - (n2 - 1) * d2 / n2 / r2) / (phi2 - (n2 - 1) / r2);
  }

  if (fixed !== "r1") {
    input.r1.valueAsNumber = r1;
  }

  if (fixed !== "r2") {
    input.r2.valueAsNumber = r2;
  }

  if (fixed !== "r3") {
    input.r3.valueAsNumber = r3;
  }

  if (fixed !== "f") {
    input.f.valueAsNumber = f;
  }


  for (const [name, value] of Object.entries({ phi1, r1, r2, efl1: 1 / phi1 })) {
    output[0][name].value = nf.format(value);
  }

  for (const [name, value] of Object.entries({ phi2, r2, r3, efl2: 1 / phi2 })) {
    output[1][name].value = nf.format(value);
  }

  outputURL.search = `?${btoa(JSON.stringify({ ni: 1, no: 1, dl: d1, r2emr1: false, fixed: "f", r1, r2, nl: n1 }))}`;
  outputLink[0].href = outputURL;

  outputURL.search = `?${btoa(JSON.stringify({ ni: 1, no: 1, dl: d2, r2emr1: false, fixed: "f", r1: r2, r2: r3, nl: n2 }))}`;
  outputLink[1].href = outputURL;
}

function loadFromData(data) {
  const values = JSON.parse(atob(data));

  console.table(values);
  for (const key of ["no", "ni", "n1", "n2", "d1", "d2", "v1", "v2", "r1", "r2", "r3", "f"]) {
    input[key].valueAsNumber = values[key] ?? NaN;
  }

  input.fixed.value = values.fixed;
  input.r2emr1.checked = values.r2emr1;

  console.log(values);
}

try {
  if (window.location.search.startsWith("?")) {
    loadFromData(window.location.search.substring(1));
  }
} finally {
  document.querySelector(".input form").addEventListener("input", update)
  update();
}
