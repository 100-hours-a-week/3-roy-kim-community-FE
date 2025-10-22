// Reusable header injector + optional profile menu
// Usage:
//   import { mountHeader } from "/component/header/insertHeader.js";
//   const header = await mountHeader(); // adds avatar + dropdown by default
//   // or: await mountHeader("header-placeholder", { addProfileMenu: false });

export async function mountHeader(placeholderId = "header-placeholder", opts = {}) {
  const { addProfileMenu = true } = opts;
  const mount = document.getElementById(placeholderId);
  if (!mount) {
    console.warn(`[mountHeader] Placeholder #${placeholderId} not found.`);
    return null;
  }

  // Fetch and mount the shared header shell
  try {
    const res = await fetch("/component/header/header.html", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    mount.innerHTML = html;
  } catch (err) {
    console.error("[mountHeader] Failed to load header.html:", err);
    return null;
  }

  // Expose refs for per-page customization
  const refs = {
    root: mount.querySelector("header"),
    left: document.getElementById("header-left"),
    right: document.getElementById("header-right"),
    title: mount.querySelector(".header-title"),
  };

  // Optionally add the right-side profile avatar + dropdown
  if (addProfileMenu && refs.right) {
    addProfileDropdown(refs.right);
  }

  return refs;
}

function addProfileDropdown(container) {
  // Prefer a stored user profile image, else fallback initial
  let avatarUrl = "/assets/images/default-user.png";
  try { avatarUrl = localStorage.getItem("profilePicture"); } catch(_) {}
  if (!avatarUrl) {
    avatarUrl = "/assets/images/user.png"; // 기본 이미지
  }

  const img = document.createElement("img");
  img.className = "header-avatar";
  img.alt = "사용자 프로필";
  img.src = avatarUrl;
  container.appendChild(img);

  const menu = document.createElement("div");
  menu.className = "header-menu";
  menu.innerHTML = `
    <button type="button" data-action="profile">회원정보 수정</button>
    <button type="button" data-action="password">비밀번호 수정</button>
    <button type="button" data-action="logout">로그아웃</button>
  `;
  container.appendChild(menu);

  function toggleMenu() { menu.classList.toggle("open"); }
  function closeMenu() { menu.classList.remove("open"); }

  img.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) closeMenu();
  });

  menu.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.getAttribute("data-action");
    if (act === "profile") {
      window.location.href = "/pages/updateUserInfo/updateUserInfo.html"; // adjust if needed
    } else if (act === "password") {
      window.location.href = "/pages/updateUserPassword/updateUserPassword.html"; // adjust if needed
    } else if (act === "logout") {
      try {
        localStorage.removeItem("authToken");
        localStorage.removeItem("profilePicture");
        localStorage.removeItem("nickname");
        localStorage.removeItem("userId");
      } catch(_) {}
      window.location.href = "/pages/login/login.html";
    }
  });
}