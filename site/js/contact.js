// Contact form → Google Form. To connect a form, fill these in from the form's
// "Get pre-filled link" URL (see README → Contact form).
const GOOGLE_FORM = {
  action: "", // https://docs.google.com/forms/d/e/<FORM_ID>/formResponse
  fields: { name: "", email: "", message: "" }, // entry.123456789 etc.
};

const form = document.getElementById("contact-form");
const status = form.querySelector(".form-status");
const configured = GOOGLE_FORM.action && Object.values(GOOGLE_FORM.fields).every(Boolean);

const say = (msg, kind = "") => {
  status.textContent = msg;
  status.dataset.kind = kind;
};

if (!configured) {
  for (const el of form.elements) el.disabled = true;
  say("The contact form isn’t connected yet. Check back soon.");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!configured) return;
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const button = form.querySelector("button");
  // Bots fill the hidden field; pretend it worked and drop it.
  if (data.get("website")) {
    form.reset();
    say("Thanks! Your message has been sent.", "ok");
    return;
  }

  const body = new URLSearchParams();
  for (const [key, entry] of Object.entries(GOOGLE_FORM.fields)) body.append(entry, data.get(key).trim());

  button.disabled = true;
  say("Sending…");
  try {
    // Google Forms doesn't send CORS headers, so the response is opaque; a
    // network failure is the only error we can detect.
    await fetch(GOOGLE_FORM.action, { method: "POST", mode: "no-cors", body });
    form.reset();
    say("Thanks! Your message has been sent.", "ok");
  } catch {
    say("Sorry, something went wrong. Please try again in a moment.", "error");
  } finally {
    button.disabled = false;
  }
});
