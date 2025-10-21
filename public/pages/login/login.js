

// === Backend config ===
const BACKEND_BASE_URL = "http://localhost:8080"; // change if your Spring Boot server runs elsewhere
const LOGIN_ENDPOINT = "/users/login"; // matches UserController @PostMapping("/login")
const TIMEOUT_MS = 15000;

// Elements (optional – code checks for nulls)
const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("login-btn");
const errorBox = document.getElementById("login-error");
const successBox = document.getElementById("login-success");

async function postLogin(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${BACKEND_BASE_URL}${LOGIN_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit",
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const hint = err.name === "AbortError"
      ? "Request timed out. Is the backend reachable?"
      : "Network/CORS error. Check server, URL/port, and CORS settings.";
    throw new Error(`Failed to fetch: ${hint}`);
  }

  clearTimeout(timer);

  // Backend returns a String; try to read as text first, then fall back to JSON
  const contentType = res.headers.get("content-type") || "";
  let dataText = "";
  let dataJson = null;
  if (contentType.includes("application/json")) {
    dataJson = await res.json().catch(() => null);
  } else {
    dataText = await res.text().catch(() => "");
  }

  if (!res.ok) {
    const msg = (dataJson && (dataJson.message || dataJson.error || dataJson.detail)) || dataText || `Login failed (${res.status})`;
    throw new Error(msg);
  }

  // Prefer text for token/message, fallback to JSON
  return dataText || dataJson || {};
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (errorBox) errorBox.textContent = "";
    if (successBox) successBox.textContent = "";

    const email = (emailInput && emailInput.value.trim()) || "";
    const password = (passwordInput && passwordInput.value) || "";

    if (!email || !password) {
      if (errorBox) errorBox.textContent = "이메일과 비밀번호를 입력해주세요.";
      return;
    }

    const prevText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "로그인 중...";
    }

    try {
      const result = await postLogin({ email, password });

      // If the backend returns a token string, store it. Otherwise store whatever came back.
      const tokenLike = typeof result === "string" ? result : (result && (result.token || result.accessToken || result.message)) || "";
      if (tokenLike) {
        try { localStorage.setItem("authToken", tokenLike); } catch (_) {}
      } else {
        try { localStorage.setItem("loginResult", JSON.stringify(result)); } catch (_) {}
      }

      if (successBox) successBox.textContent = "로그인 성공!";

      // Redirect to post/boards page after successful login
      window.location.href = "/pages/post/boards.html"; // adjust path if needed
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || "로그인에 실패했습니다.";
      } else {
        alert(err.message || "로그인에 실패했습니다.");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevText || "로그인";
      }
    }
  });
}

// Go to signup (supports either #go-signup or #go-signup-btn)
document.addEventListener("click", (e) => {
  const t = e.target.closest && (e.target.closest("#go-signup") || e.target.closest("#go-signup-btn"));
  if (t) {
    e.preventDefault();
    // Adjust the path if needed based on your folder structure
    window.location.href = "/pages/signup/signup.html";
  }
});