/*const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("profile");
const preview = document.getElementById("preview");
const uploadText = document.getElementById("upload-text");*/

// === Backend config ===
const BACKEND_BASE_URL = "http://localhost:8080"; // change if your Spring Boot server runs elsewhere
const SIGNUP_ENDPOINT = "/users/signup"; // change to match your backend route
// Optional: network timeout (ms)
const TIMEOUT_MS = 15000;

/*// When clicking the upload area
uploadArea.addEventListener("click", () => {
  fileInput.click();
});

// When a file is chosen
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
      uploadText.style.display = "none";
    };
    reader.readAsDataURL(file);
  }
});*/

// === Form submit -> send to backend ===
const form = document.getElementById("signup-form");
const submitBtn = document.getElementById("submit-btn");
const errorBox = document.getElementById("form-error");
const successBox = document.getElementById("form-success");

async function postSignup(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${BACKEND_BASE_URL}${SIGNUP_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // If your backend needs cookies, change to 'include'
      credentials: "omit",
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    // Most common: CORS blocked, server down, wrong URL/port, mixed content, or timeout
    const hint = err.name === "AbortError"
      ? "Request timed out. Is the backend reachable at the configured URL/port?"
      : "Network/CORS error. Check server is running, URL/port are correct, and CORS is enabled on the backend.";
    console.error("Signup fetch error:", err);
    throw new Error(`Failed to fetch: ${hint}`);
  }

  clearTimeout(timer);

  // Try to parse JSON, but don't crash if it's not JSON
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const text = data.message || data.error || data.detail || await res.text().catch(() => "");
    const msg = text || `Signup failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear messages
    if (errorBox) errorBox.textContent = "";
    if (successBox) successBox.textContent = "";

    // Build JSON payload from form fields (map to backend DTO names)
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const passwordCheck = document.getElementById("password2").value;
    const nickname = document.getElementById("username").value.trim();
    const profilePicture = "imageUrl";

    const payload = {
      email,
      password,
      passwordCheck,
      nickname,
      profilePicture
    };

    // Optional: disable button while submitting
    const prevText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing up...";
    }

    try {
      const result = await postSignup(payload);
      if (successBox) successBox.textContent = result.message || "회원가입 성공!";

      window.location.href = "/pages/login/login.html";

      // Example: redirect to login page after success — change path as needed
      // window.location.href = "/pages/login/index.html";
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || "Something went wrong.";
      } else {
        alert(err.message || "Signup failed");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevText || "Sign Up";
      }
    }
  });
}

document.addEventListener("click", (e) => {
  const target = e.target.closest && (e.target.closest("#go-login") || e.target.closest("#go-login-btn"));
  if (target) {
    e.preventDefault();
    window.location.href = "/pages/login/login.html"; // adjust path if needed
  }
});
