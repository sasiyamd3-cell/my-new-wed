(() => {
  const config = window.MIYORA_CONFIG || {};
  const apiBase = String(config.API_BASE_URL || "").replace(/\/+$/, "");
  const phone = document.getElementById("phone");
  const generate = document.getElementById("generate");
  const message = document.getElementById("message");
  const codeBox = document.getElementById("code-box");
  const pairCode = document.getElementById("pair-code");
  const copy = document.getElementById("copy");
  document.getElementById("year").textContent = new Date().getFullYear();

  const showMessage = (text, success = false) => {
    message.textContent = text;
    message.className = success ? "message success" : "message";
  };

  generate.addEventListener("click", async () => {
    const number = phone.value.replace(/\D/g, "");
    codeBox.hidden = true;
    if (!apiBase || apiBase.includes("YOUR-HEROKU-APP")) {
      showMessage("Please configure API_BASE_URL in config.js first.");
      return;
    }
    if (number.length < 8 || number.length > 15) {
      showMessage("Enter a valid WhatsApp number with country code.");
      phone.focus();
      return;
    }

    generate.disabled = true;
    generate.querySelector("span").textContent = "Generating code...";
    showMessage("Connecting to MIYORA backend. Please wait...", true);

    try {
      const response = await fetch(`${apiBase}/?number=${encodeURIComponent(number)}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Server error (${response.status})`);

      if (data.code) {
        const cleanCode = String(data.code).replace(/[^A-Z0-9]/gi, "").toUpperCase();
        pairCode.textContent = cleanCode.match(/.{1,4}/g)?.join(" ") || cleanCode;
        codeBox.hidden = false;
        showMessage("Pairing code generated. Enter it in WhatsApp now.", true);
      } else if (data.status === "already_connected") {
        showMessage("This WhatsApp number is already connected.", true);
      } else if (data.status === "connecting") {
        showMessage("A connection request is already running for this number. Wait a moment and try again.");
      } else {
        throw new Error(data.error || data.message || "Pairing code was not returned. Check the backend logs.");
      }
    } catch (error) {
      showMessage(error.message || "Could not reach the pairing server. Check your connection.");
    } finally {
      generate.disabled = false;
      generate.querySelector("span").textContent = "Generate pairing code";
    }
  });

  phone.addEventListener("keydown", event => {
    if (event.key === "Enter") generate.click();
  });

  copy.addEventListener("click", async () => {
    const value = pairCode.textContent.replace(/\s/g, "");
    try {
      await navigator.clipboard.writeText(value);
      copy.textContent = "COPIED";
      setTimeout(() => copy.textContent = "COPY", 1500);
    } catch {
      showMessage("Copy failed. Select and copy the code manually.");
    }
  });
})();