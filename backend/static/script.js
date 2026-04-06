(function () {
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  function getStatusEl() {
    return document.getElementById("cstat") || document.getElementById("form-status");
  }

  function setStatus(message, isError) {
    const el = getStatusEl();
    if (!el) return;
    el.textContent = message;
    if (isError) el.style.color = "crimson";
    else el.style.color = "green";
  }

  function clearStatus() {
    const el = getStatusEl();
    if (!el) return;
    el.textContent = "";
  }

  function setFormLoading(isLoading) {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = !!isLoading;
  }

  function getFormValues() {
    const name = (document.getElementById("name") || {}).value || "";
    const email = (document.getElementById("email") || {}).value || "";
    const message = (document.getElementById("message") || {}).value || "";
    return {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    };
  }

  function clearFormValues() {
    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const messageEl = document.getElementById("message");
    if (nameEl) nameEl.value = "";
    if (emailEl) emailEl.value = "";
    if (messageEl) messageEl.value = "";
  }

  async function incrementVisitorsOnce() {
    try {
      const res = await fetch("/api/visit", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      const visitorEl = document.getElementById("visitor-count");
      if (visitorEl && typeof data.visitors !== "undefined") {
        visitorEl.textContent = data.visitors;
      }
    } catch (e) {
      // Visitor counter is non-critical; don't block the form.
      // Intentionally no UI error here.
    }
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    clearStatus();

    const { name, email, message } = getFormValues();

    if (!name || !email || !message) {
      setStatus("Please fill out all fields.", true);
      return;
    }
    if (!emailRegex.test(email)) {
      setStatus("Please enter a valid email address.", true);
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || "Failed to send message. Please try again.", true);
        return;
      }

      setStatus("Message sent successfully!", false);
      clearFormValues();
    } catch (err) {
      setStatus("Failed to send message. Please try again.", true);
    } finally {
      setFormLoading(false);
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    incrementVisitorsOnce();

    const form = document.getElementById("contact-form");
    if (form) form.addEventListener("submit", handleContactSubmit);
  });
})();

