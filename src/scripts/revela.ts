/**
 * Entradas da home: [data-revela] quebra o texto em palavras que sobem da linha; [data-sobe]
 * entra junto com um atraso curto (--d). Só roda com JS; sem JS (ou movimento reduzido) o texto
 * já está lá.
 */
const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduzido && "IntersectionObserver" in window) {
  document.documentElement.classList.add("js-rv");

  document.querySelectorAll<HTMLElement>("[data-revela]").forEach((el) => {
    const palavras = (el.textContent ?? "").trim().split(/\s+/);
    el.setAttribute("aria-label", palavras.join(" "));
    el.innerHTML = palavras
      .map((p, i) => `<span class="c-rv-palavra" aria-hidden="true"><span style="--i:${i}">${p}</span></span>`)
      .join(" ");
  });

  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-visto");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  document.querySelectorAll("[data-revela], [data-sobe]").forEach((el) => io.observe(el));
}
