const inputForm = document.querySelector(".input form");
const input = inputForm.elements;
const output = document.querySelector(".output form").elements;
const outputLink = document.querySelector(".output form a");
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
  const nl = input.nl.valueAsNumber;
  const variable = input.variable.value;

  for (const field of input) {
    if (field.type === "number") {
      field.valueAsNumber += 0; // because browsers suck
    }
  }

  input.variable.forEach((radio) => {
    const field = radio.parentElement.nextElementSibling;
    field.disabled = field.name == variable;
  });

  let i, o, f, p;

  if (variable === "f") {
    i = getNumber(input.i);
    o = getNumber(input.o);
    f = 1 / (1 / i + 1 / o);
    input.f.valueAsNumber = f; // = nf.format(f);
  } else if (variable == "i") {
    o = getNumber(input.o);
    f = getNumber(input.f);
    i = 1 / (1 / f - 1 / o);
    input.i.valueAsNumber = i; // = nf.format(i);
  } else {
    i = getNumber(input.i);
    f = getNumber(input.f);
    o = 1 / (1 / f - 1 / i);
    input.o.valueAsNumber = o; // nf.format(o);
  }

  if (!isFinite(i) && !isFinite(o)) {
    p = (i === o) ? i : 0;
  } else if (!isFinite(i)) {
    p = 1;
  } else if (!isFinite(o)) {
    p = -1;
  } else {
    p = (i + o) / (i - o);
  }

  const c = -2 * p * (nl * nl - 1) / (nl + 2);
  const r1 = 2 * f * (nl - 1) / (c + 1);
  const r2 = 2 * f * (nl - 1) / (c - 1);

  for (const [name, value] of Object.entries({ p, c, r1, r2 })) {
    output[name].value = nf.format(value);
  }

  outputURL.search = `?${btoa(JSON.stringify({ ni: 1, no: 1, dl: 0, r2emr1: false, fixed: "f", r1, r2, nl }))}`;
  outputLink.href = outputURL;
}

document.querySelector(".input form").addEventListener("input", update)
update();

