export async function mountHeader(placeholderId = "header-placeholder") {
  const mount = document.getElementById(placeholderId);
  if (!mount) return null;
  const html = await fetch("/component/header/header.html").then(r => r.text());
  mount.innerHTML = html;
  return {
    root: mount.querySelector("header"),
    left: document.getElementById("header-left"),
    right: document.getElementById("header-right"),
    title: mount.querySelector(".header-title"),
  };
}