export async function insertFooter() {
  const footerResponse = await fetch("/component/footer/footer.html");
  const footerHTML = await footerResponse.text();
  document.body.insertAdjacentHTML("beforeend", footerHTML);

  // footer.css 추가
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/component/footer/footer.css";
  document.head.appendChild(link);
}