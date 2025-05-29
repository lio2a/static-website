const inputForm = document.querySelector(".input form");
const input = inputForm.elements;
const output = document.querySelector(".output form").elements;
const outputLink = document.querySelector(".output form a");
const outputURL = new URL("./acromatizador.php", window.location);
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

function curve(radius, invert) {
  if (isFinite(radius) && isFinite(1 / radius)) {
    if (radius > 0) {
      return invert ? "a 5 5 180 0 1 0 -3" : "a 5 5 180 0 0 0 3";
    }
    return invert ? "a 5 5 180 0 0 0 -3" : "a 5 5 180 0 1 0 3";
  }
  return invert ? "v -3" : "v 3";
}

function update() {
  const fixed = input.fixed.value;
  const r2emr1 = input.r2emr1.checked;

  inputForm.classList.toggle("locked", r2emr1);
  input.fixed.forEach((radio) => {
    const input = radio.parentElement.nextElementSibling;

    radio.checked = radio.value == fixed;
    input.disabled = (input.name != fixed) == r2emr1;
  });

  const no = input.no.valueAsNumber;
  const nl = input.nl.valueAsNumber;
  const ni = input.ni.valueAsNumber;
  const dl = input.dl.valueAsNumber;

  let r1, r2, phi, phio, phii, efl, bfl, ffl, nps, p1, p2, fr, ff;

  if (r2emr1) {
    if (fixed === "f") {
      phi = 1 / getNumber(input.f);
      const a = nl * (ni - 2 * nl + no);
      const b = dl * (-ni * nl + nl * nl + ni * no - nl * no);
      const c = a * a - 4 * nl * b * phi;

      r1 = (nl * (-ni + 2 * nl - no) + Math.sqrt(c)) / (2 * nl * phi);
      r2 = -r1;
      input.r1.valueAsNumber = r1;
      input.r2.valueAsNumber = r2;
    } else {
      if (fixed === "r1") {
        r2 = -(r1 = getNumber(input.r1));
      } else {
        r1 = -(r2 = getNumber(input.r2));
      }
      phi =
        (dl * ni * nl -
          dl * nl * nl -
          dl * ni * no +
          dl * nl * no -
          ni * nl * r1 +
          2 * nl * nl * r1 -
          nl * no * r1) /
        (nl * r1 * r1);
      input.f.valueAsNumber = 1 / phi;
    }
  } else {
    if (fixed === "f") {
      r1 = getNumber(input.r1);
      r2 = getNumber(input.r2);
      phio = (nl - no) / r1;
      phii = (ni - nl) / r2;
      phi = phii + phio - (phii * phio * dl) / nl;
      input.f.valueAsNumber = 1 / phi;
    } else if (fixed === "r1") {
      phi = 1 / getNumber(input.f);
      r2 = getNumber(input.r2);
      r1 =
        ((nl - no) * (-(dl * ni) + dl * nl + nl * r2)) /
        (nl * (-ni + nl + phi * r2));
      input.r1.valueAsNumber = r1;
    } else {
      phi = 1 / getNumber(input.f);
      r1 = getNumber(input.r1);
      r2 =
        ((ni - nl) * (dl * nl - dl * no - nl * r1)) /
        (nl * (nl - no - phi * r1));
      input.r2.valueAsNumber = r2;
    }
  }

  phio = (nl - no) / r1;
  phii = (ni - nl) / r2;
  phi = phio + phii - (phio * phii * dl) / nl;
  efl = 1 / phi;
  ff = -no * efl;
  fr = ni * efl;
  nps = ff + fr;
  p1 = (((phii / phi) * dl) / nl) * no;
  p2 = (((-phio / phi) * dl) / nl) * ni;
  bfl = fr + p2;
  ffl = ff + p1;

  for (const [name, value] of Object.entries({
    phi,
    phio,
    phii,
    r1,
    r2,
    efl,
    bfl,
    ffl,
    nps,
    p1,
    p2,
    fr,
    ff,
  })) {
    output[name].value = nf.format(value);
  }

  outputURL.search = `?${btoa(JSON.stringify({ ni, no, n1: nl, n2: null, v1: null, v2: null, d1: dl, d2: 0, fixed: "f", f: efl, r2emr1: true }))}`;
  outputLink.href = outputURL;
}

function loadFromData(data) {
  const values = JSON.parse(atob(data));

  for (const key of ["no", "ni", "nl", "dl", "r1", "r2", "f"]) {
    input[key].valueAsNumber = values[key] ?? NaN;
  }

  input.fixed.value = values.fixed;
  input.r2emr1.checked = values.r2emr1;
}

try {
  for (const field of input) {
    if (field.type === "number") {
      field.valueAsNumber += 0; // because browsers suck
    }
  }

  if (window.location.search.startsWith("?")) {
    loadFromData(window.location.search.substring(1));
  }
} finally {
  document.querySelector(".input form").addEventListener("input", update);
  update();
}
