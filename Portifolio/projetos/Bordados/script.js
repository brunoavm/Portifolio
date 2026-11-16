/* ==========================================================
   Fabi Artes Personalizados — script
   ========================================================== */

/*
 * >>> EDITE SÓ AQUI <<<
 * Troque os valores abaixo pelos dados reais da Fabi.
 * O resto do site é montado sozinho a partir deste objeto.
 */
const CONFIGURACAO = {
  numeroWhatsapp: "5581985863605",       // DDI 55 + DDD + número, só dígitos
  whatsappExibicao: "(81) 98586-3605",
  mensagemWhatsapp: "Olá, Fabi! Vi seu site e gostaria de fazer um pedido personalizado.",

  usuarioInstagram: "fabi_artees",
  instagramExibicao: "@fabi_artees",

  telefoneExibicao: "(81) 98586-3605",
  telefoneLink: "+5581985863605",

  enderecoExibicao: "Rua do Colégio Aderbal Jurema, 302A — Centro, Ipojuca/PE, CEP 55590-026",
  urlMapa: "https://maps.app.goo.gl/Z6qD5gYoJ1nJA6XX6",
};

document.addEventListener("DOMContentLoaded", () => {
  configurarContatos();
  configurarCabecalho();
  configurarMenuMobile();
  configurarSlideshow();
  configurarBotaoVerMais();
  configurarLightbox();
});

/* ---------------- Contatos ---------------- */
function configurarContatos() {
  const urlWhatsapp = `https://wa.me/${CONFIGURACAO.numeroWhatsapp}?text=${encodeURIComponent(CONFIGURACAO.mensagemWhatsapp)}`;

  const whatsappCabecalho = document.getElementById("whatsapp-cabecalho");
  if (whatsappCabecalho) whatsappCabecalho.href = urlWhatsapp;

  const cartaoWhatsapp = document.getElementById("contato-whatsapp");
  if (cartaoWhatsapp) cartaoWhatsapp.href = urlWhatsapp;
  definirTexto("whatsapp-texto", CONFIGURACAO.whatsappExibicao);

  const instagram = document.getElementById("contato-instagram");
  if (instagram) instagram.href = `https://instagram.com/${CONFIGURACAO.usuarioInstagram}`;
  definirTexto("instagram-texto", CONFIGURACAO.instagramExibicao);

  const telefone = document.getElementById("contato-telefone");
  if (telefone) telefone.href = `tel:${CONFIGURACAO.telefoneLink}`;
  definirTexto("telefone-texto", CONFIGURACAO.telefoneExibicao);

  const endereco = document.getElementById("contato-endereco");
  if (endereco) endereco.href = CONFIGURACAO.urlMapa;
  definirTexto("endereco-texto", CONFIGURACAO.enderecoExibicao);
}

function definirTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = valor;
}

/* ---------------- Cabeçalho: some/aparece fundo ao rolar ---------------- */
function configurarCabecalho() {
  const cabecalho = document.getElementById("cabecalho-site");
  if (!cabecalho) return;

  const alternar = () => {
    cabecalho.classList.toggle("rolado", window.scrollY > 40);
  };
  alternar();
  window.addEventListener("scroll", alternar, { passive: true });
}

/* ---------------- Menu mobile ---------------- */
function configurarMenuMobile() {
  const cabecalho = document.getElementById("cabecalho-site");
  const botao = document.getElementById("botao-menu");
  if (!cabecalho || !botao) return;

  botao.addEventListener("click", () => {
    const menuAberto = cabecalho.classList.toggle("menu-aberto");
    botao.setAttribute("aria-expanded", String(menuAberto));
  });

  cabecalho.querySelectorAll(".menu-principal a").forEach((link) => {
    link.addEventListener("click", () => {
      cabecalho.classList.remove("menu-aberto");
      botao.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------- Ver mais trabalhos ---------------- */
function configurarBotaoVerMais() {
  const botao = document.getElementById("botao-ver-mais");
  const rotulo = document.getElementById("texto-botao-ver-mais");
  const galeriaExtra = document.getElementById("galeria-extra");
  if (!botao || !galeriaExtra) return;

  botao.addEventListener("click", () => {
    const estavaEscondida = galeriaExtra.hasAttribute("hidden");

    if (estavaEscondida) {
      galeriaExtra.hidden = false;
      // pequeno atraso para o navegador registrar o estado inicial antes de animar
      requestAnimationFrame(() => galeriaExtra.classList.add("visivel"));
      galeriaExtra.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      galeriaExtra.classList.remove("visivel");
      galeriaExtra.hidden = true;
    }

    botao.setAttribute("aria-expanded", String(estavaEscondida));
    rotulo.textContent = estavaEscondida ? "Ver menos trabalhos" : "Ver mais trabalhos";
  });
}

/* ---------------- Slideshow do topo ---------------- */
function configurarSlideshow() {
  const quadros = Array.from(document.querySelectorAll("[data-quadro]"));
  const areaPontos = document.getElementById("pontos-apresentacao");
  const botaoAnterior = document.getElementById("seta-anterior");
  const botaoProximo = document.getElementById("seta-proxima");
  if (!quadros.length || !areaPontos) return;

  let atual = 0;
  let temporizador = null;
  const ATRASO_AUTOMATICO = 6500;
  const prefereMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  quadros.forEach((_, i) => {
    const ponto = document.createElement("button");
    ponto.setAttribute("aria-label", `Ir para o quadro ${i + 1}`);
    if (i === 0) ponto.classList.add("ativo");
    ponto.addEventListener("click", () => irPara(i));
    areaPontos.appendChild(ponto);
  });
  const pontos = Array.from(areaPontos.children);

  function irPara(indice) {
    quadros[atual].classList.remove("ativo");
    pontos[atual].classList.remove("ativo");
    atual = (indice + quadros.length) % quadros.length;
    quadros[atual].classList.add("ativo");
    pontos[atual].classList.add("ativo");
    reiniciarAutoplay();
  }

  function proximo() { irPara(atual + 1); }
  function anterior() { irPara(atual - 1); }

  function reiniciarAutoplay() {
    if (prefereMenosMovimento) return;
    clearInterval(temporizador);
    temporizador = setInterval(proximo, ATRASO_AUTOMATICO);
  }

  if (botaoAnterior) botaoAnterior.addEventListener("click", anterior);
  if (botaoProximo) botaoProximo.addEventListener("click", proximo);

  // Arrastar com o dedo no celular: para a esquerda = próximo, para a direita = anterior.
  // Só conta se o movimento for mais horizontal que vertical, para não atrapalhar a rolagem da página.
  const areaToque = document.getElementById("apresentacao");
  let inicioX = 0;
  let inicioY = 0;
  let acompanhando = false;

  if (areaToque) {
    areaToque.addEventListener("touchstart", (evento) => {
      if (evento.touches.length !== 1) return;
      inicioX = evento.touches[0].clientX;
      inicioY = evento.touches[0].clientY;
      acompanhando = true;
    }, { passive: true });

    areaToque.addEventListener("touchend", (evento) => {
      if (!acompanhando) return;
      acompanhando = false;
      const toque = evento.changedTouches[0];
      const deslocamentoX = toque.clientX - inicioX;
      const deslocamentoY = toque.clientY - inicioY;
      const arrastouParaOLado = Math.abs(deslocamentoX) > 50 && Math.abs(deslocamentoX) > Math.abs(deslocamentoY) * 1.5;
      if (arrastouParaOLado) {
        if (deslocamentoX < 0) proximo(); else anterior();
      }
    }, { passive: true });
  }

  reiniciarAutoplay();
}

/* ---------------- Foto ampliada (lightbox) ---------------- */
function configurarLightbox() {
  const lightbox = document.getElementById("lightbox");
  const imagemLightbox = document.getElementById("lightbox-imagem");
  const legendaLightbox = document.getElementById("lightbox-legenda");
  const botaoFechar = document.getElementById("lightbox-fechar");
  if (!lightbox || !imagemLightbox || !botaoFechar) return;

  let elementoAnterior = null;

  function abrir(imagemOrigem) {
    if (!imagemOrigem || !imagemOrigem.getAttribute("src")) return;
    elementoAnterior = document.activeElement;
    imagemLightbox.src = imagemOrigem.currentSrc || imagemOrigem.src;
    imagemLightbox.alt = imagemOrigem.alt || "";
    legendaLightbox.textContent = imagemOrigem.alt || "";
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("visivel"));
    document.body.classList.add("bloquear-rolagem");
    botaoFechar.focus();
  }

  function fechar() {
    lightbox.classList.remove("visivel");
    document.body.classList.remove("bloquear-rolagem");
    window.setTimeout(() => { lightbox.hidden = true; }, 250);
    if (elementoAnterior) elementoAnterior.focus();
  }

  // Deixa clicável e navegável por teclado qualquer foto dentro de uma moldura,
  // inclusive as que estão dentro da galeria extra ("Ver mais trabalhos").
  document.querySelectorAll(".moldura-foto").forEach((moldura) => {
    const imagem = moldura.querySelector("img");
    if (!imagem) return;

    moldura.setAttribute("tabindex", "0");
    moldura.setAttribute("role", "button");
    moldura.setAttribute("aria-label", "Ampliar foto: " + (imagem.alt || "trabalho bordado"));

    moldura.addEventListener("click", () => abrir(imagem));
    moldura.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        abrir(imagem);
      }
    });
  });

  botaoFechar.addEventListener("click", fechar);

  lightbox.addEventListener("click", (evento) => {
    if (evento.target === lightbox) fechar();
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !lightbox.hidden) fechar();
  });
}
