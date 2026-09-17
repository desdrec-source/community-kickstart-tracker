function burstGlitter() {
  const box = document.getElementById("glitter");
  if (!box) return;
  box.innerHTML = "";
  const colours = ["#C45C26", "#1B2A4A", "#E8C547", "#F4F1EC", "#D7C4B2"];
  for (let i = 0; i < 48; i++) {
    const bit = document.createElement("span");
    bit.style.left = Math.random() * 100 + "%";
    bit.style.setProperty("--dx", Math.random() * 80 - 40 + "px");
    bit.style.background = colours[i % colours.length];
    bit.style.animationDelay = Math.random() * 0.35 + "s";
    bit.style.width = bit.style.height = 5 + Math.random() * 7 + "px";
    box.appendChild(bit);
  }
  setTimeout(() => { box.innerHTML = ""; }, 2400);
}

const confirmScreen = document.getElementById("screen-confirm");
if (confirmScreen) {
  const watch = new MutationObserver(() => {
    if (confirmScreen.classList.contains("active")) burstGlitter();
  });
  watch.observe(confirmScreen, { attributes: true, attributeFilter: ["class"] });
}
