if (window.top !== window.self) window.top.location = window.self.location.href;

(() => {
  const WHATS = "5511979504874";
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // De onde a pessoa veio (?origem=instagram). Só entra no texto do WhatsApp, nada é guardado.
  const ORIGENS = { instagram: "Instagram", facebook: "Facebook", qr: "QR Code", whatsapp: "WhatsApp", google: "Google" };
  const origem = ORIGENS[new URLSearchParams(location.search).get("origem")] || "";
  const linkWhats = texto => `https://wa.me/${WHATS}?text=${encodeURIComponent(texto)}`;
  const assinatura = origem ? `\n\n(Conheci a academia pelo ${origem})` : "";

  document.querySelectorAll("[data-whats]").forEach(a => {
    a.href = linkWhats(`Olá! Vim pelo site da Cipras Profit e quero saber sobre os planos.${assinatura}`);
  });

  /* ---------- Aberto agora (horário de Brasília) ---------- */
  // CONFIRMAR COM O DONO: sábado 8h-14h (TotalPass/Wellhub) ou 8h-15h (Instagram)
  const HORAS = { 0: null, 1: [6, 23], 2: [6, 23], 3: [6, 23], 4: [6, 23], 5: [6, 23], 6: [8, 15] };
  const NOMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const agoraSP = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).map(x => [x.type, x.value]));
    return { dia: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), hora: Number(p.hour) + Number(p.minute) / 60 };
  };
  const proximaAbertura = dia => {
    for (let i = 1; i <= 7; i++) {
      const d = (dia + i) % 7;
      if (HORAS[d]) return `${i === 1 ? "amanhã" : NOMES[d]} às ${HORAS[d][0]}h`;
    }
    return "";
  };
  const atualizarStatus = () => {
    const el = document.getElementById("status");
    const texto = el.querySelector(".status-texto");
    const { dia, hora } = agoraSP();
    const h = HORAS[dia];
    const aberto = h && hora >= h[0] && hora < h[1];
    el.classList.toggle("is-aberto", !!aberto);
    el.classList.toggle("is-fechado", !aberto);
    if (aberto) texto.textContent = `Aberto agora · fecha às ${h[1]}h`;
    else if (h && hora < h[0]) texto.textContent = `Fechado agora · abre hoje às ${h[0]}h`;
    else texto.textContent = `Fechado agora · abre ${proximaAbertura(dia)}`;
    document.querySelectorAll(".tabela-horas tr").forEach(tr => tr.classList.toggle("is-hoje", Number(tr.dataset.dia) === dia));
  };
  atualizarStatus();
  setInterval(atualizarStatus, 60000);

  /* ---------- Topo, menu e barra do celular ---------- */
  const topo = document.getElementById("topo");
  const barra = document.querySelector(".barra-celular");
  const aoRolar = () => {
    topo.classList.toggle("is-rolado", scrollY > 20);
    barra.classList.toggle("is-visivel", scrollY > innerHeight * 0.7);
  };
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  const menu = document.getElementById("menu");
  const botaoMenu = document.querySelector(".menu-botao");
  const fecharMenu = () => {
    menu.classList.remove("is-aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
  };
  botaoMenu.addEventListener("click", () => {
    const abrir = botaoMenu.getAttribute("aria-expanded") !== "true";
    menu.classList.toggle("is-aberto", abrir);
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    botaoMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  });
  menu.addEventListener("click", e => { if (e.target.closest("a")) fecharMenu(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") fecharMenu(); });

  /* ---------- Visor de fotos ---------- */
  const visor = document.getElementById("visor");
  const visorImg = visor.querySelector("img");
  const visorLegenda = visor.querySelector(".visor-legenda");
  document.addEventListener("click", e => {
    const alvo = e.target.closest("[data-foto]");
    if (!alvo) return;
    visorImg.src = alvo.dataset.foto;
    visorImg.alt = alvo.querySelector("img")?.alt || "";
    visorLegenda.textContent = alvo.dataset.legenda || "";
    visor.showModal();
  });
  visor.addEventListener("click", e => { if (e.target === visor || e.target.closest("[data-fechar]")) visor.close(); });
  visor.addEventListener("close", () => { visorImg.src = "data:,"; });

  /* ---------- Aula experimental guiada ---------- */
  const form = document.getElementById("form-comecar");
  const nome = document.getElementById("nome");
  const resumo = document.getElementById("resumo");
  const enviar = document.getElementById("enviar-whats");
  const valor = n => form.querySelector(`input[name="${n}"]:checked`).value;

  const montar = () => {
    const aulas = [...form.querySelectorAll('input[name="aula"]:checked')].map(i => i.value);
    // Só letras, números e pontuação simples no nome (nada de quebras de linha ou links)
    const quem = nome.value.replace(/[^\p{L}\p{N} .'-]/gu, "").trim().slice(0, 60);
    const linhas = [
      `Olá!${quem ? ` Aqui é ${quem}.` : ""} Quero agendar uma aula experimental na Cipras Profit.`,
      "",
      `• Objetivo: ${valor("objetivo")}`,
      `• Melhor horário: ${valor("periodo")}`,
      `• Vou treinar com: ${valor("forma")}`,
    ];
    if (aulas.length) linhas.push(`• Tenho interesse em: ${aulas.join(", ")}`);
    linhas.push("", "Qual o melhor dia para eu ir?");
    const texto = linhas.join("\n") + assinatura;
    resumo.textContent = texto;
    enviar.href = linkWhats(texto);
  };
  form.addEventListener("input", montar);
  form.addEventListener("change", montar);
  form.addEventListener("submit", e => e.preventDefault());
  montar();

  /* ---------- Compartilhar ---------- */
  const compartilhar = document.getElementById("compartilhar");
  compartilhar.addEventListener("click", async () => {
    const url = location.origin + location.pathname;
    try {
      if (navigator.share) await navigator.share({ title: "Cipras Profit", text: "Bora treinar junto na Cipras Profit?", url });
      else { await navigator.clipboard.writeText(url); compartilhar.textContent = "Link copiado!"; }
    } catch { /* a pessoa cancelou o compartilhamento */ }
  });

  /* ---------- Revelação suave (uma por seção) ---------- */
  if (!reduzir && "IntersectionObserver" in window) {
    const alvos = document.querySelectorAll(".secao-topo, .motivos, .galeria, .aulas, .planos, .horarios, .faq");
    const obs = new IntersectionObserver(entradas => entradas.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-visivel"); obs.unobserve(en.target); }
    }), { rootMargin: "0px 0px -10% 0px" });
    alvos.forEach(a => { a.classList.add("revelar"); obs.observe(a); });
  }
})();
