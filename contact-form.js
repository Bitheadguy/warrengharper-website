(() => {
  const form = document.getElementById("authorContactForm");
  const status = document.getElementById("contactFormStatus");
  if (!form || !status) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    status.className = "contact-form-status";
    status.textContent = "Sending…";
    if (button) button.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      status.classList.add("success");
      status.textContent = "Thank you. Your message has been sent to Warren.";
    } catch (error) {
      status.classList.add("error");
      status.textContent = "Your message could not be sent. Please wait a moment and try again.";
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
