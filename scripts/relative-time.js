const rtf = new Intl.RelativeTimeFormat("pt-BR", {
  localeMatcher: "best fit",
  numeric: "auto",
  style: "long",
});
const dtf = new Intl.DateTimeFormat("pt-BR", {
  localeMatcher: "best fit",
  month: "long",
  day: "numeric",
  year: "numeric"
});
const now = new Date();

document.querySelectorAll("time[data-locale-datetime]").forEach((element) => {
  const then = new Date(element.dateTime);
  let value = element.innerHTML;

  if (then.getUTCFullYear() !== now.getUTCFullYear()) {
    value = dtf.format(then);
  } else {
    const months = then.getUTCMonth() - now.getUTCMonth();
    if (months < 0) {
      value = rtf.format(months, "month");
    } else {
      value = rtf.format(then.getUTCDay() - now.getUTCDay(), "days");
    }
  }

  element.innerHTML = value.substring(0, 1).toLocaleUpperCase("pt-BR") + value.substring(1);
});
