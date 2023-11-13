function decodeEmail(encodedEmail) {
  return atob(encodedEmail).replace(".&;", "@");
}

function formatElement() {
  this.href = `mailto:${decodeEmail(this.dataset.hiddenEmail)}`;
  // this.querySelectorAll("div[aria-hidden]").forEach((div) => div.remove());
}

document.querySelectorAll("a[data-hidden-email]").forEach((element) => {
  element.addEventListener("focus", formatElement);
  element.addEventListener("pointerenter", formatElement);
});
