
/*
 * ESPAÇO BÁRBARA RODRIGUES MASSOTERAPIA & SPA
 * Popup temporário de avisos
 */

// ==================================================
// 1. CONFIGURAÇÃO: EDITE SOMENTE ESTE BLOCO
// ==================================================

const BR_POPUP_CONFIG = {
  ativo: true,

  titulo: "Aviso importante",

  mensagem:
    "Olá! Temos um comunicado importante para você. Confira as informações antes de continuar. Nos dias 30/10 a 02/11/2026, não teremos agenda disponível. Agradecemos sua compreensão.",

  textoBotao: "Entendi, continuar",

  inicio: "2026-10-25T00:00:00-03:00",

  fim: "2026-11-02T23:59:59-03:00",

  id: "aviso-outubro-2026",

  mostrarNovamente: false
};

// ==================================================
// 2. FUNCIONAMENTO: NÃO PRECISA ALTERAR ESTA PARTE
// ==================================================

(function () {
  "use strict";

  function iniciarPopup() {
    const config = BR_POPUP_CONFIG;

    if (!config.ativo) return;
    if (!config.id || !config.titulo) return;

    const inicio = Date.parse(config.inicio);
    const fim = Date.parse(config.fim);
    const agora = Date.now();

    // Não exibe fora do período configurado.
    if (
      !Number.isFinite(inicio) ||
      !Number.isFinite(fim) ||
      fim < inicio ||
      agora < inicio ||
      agora > fim
    ) {
      return;
    }

    const chave = "br-popup-fechado-" + config.id;

    // Não repetir o mesmo aviso, se assim configurado.
    if (!config.mostrarNovamente) {
      try {
        if (localStorage.getItem(chave) === "sim") return;
      } catch (erro) {
        // Continua funcionando se o armazenamento estiver bloqueado.
      }
    }

    // Cria a estrutura do popup.
    const overlay = document.createElement("div");
    overlay.id = "br-popup-overlay";
    overlay.innerHTML = `
      <section
        id="br-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="br-popup-titulo"
        aria-describedby="br-popup-mensagem"
        tabindex="-1"
      >
        <button
          id="br-popup-fechar"
          type="button"
          aria-label="Fechar aviso"
        >&times;</button>

        <div class="br-popup-conteudo">
          <h2 id="br-popup-titulo"></h2>
          <p id="br-popup-mensagem"></p>
          <button id="br-popup-ok" type="button"></button>
        </div>
      </section>
    `;

    // Usa textContent para inserir o texto com segurança.
    overlay.querySelector("#br-popup-titulo").textContent =
      config.titulo;

    overlay.querySelector("#br-popup-mensagem").textContent =
      config.mensagem;

    overlay.querySelector("#br-popup-ok").textContent =
      config.textoBotao || "Fechar aviso";

    document.body.appendChild(overlay);

    const popup = overlay.querySelector("#br-popup");
    const botaoFechar = overlay.querySelector("#br-popup-fechar");
    const botaoOk = overlay.querySelector("#br-popup-ok");

    // Guarda o foco atual para devolvê-lo ao fechar.
    const focoAnterior = document.activeElement;

    function fecharPopup() {
      if (!overlay.isConnected) return;

      if (!config.mostrarNovamente) {
        try {
          localStorage.setItem(chave, "sim");
        } catch (erro) {
          // O fechamento continua funcionando.
        }
      }

      overlay.remove();
      document.removeEventListener("keydown", aoTeclar);

      if (focoAnterior && typeof focoAnterior.focus === "function") {
        focoAnterior.focus();
      }
    }

    function aoTeclar(evento) {
      if (evento.key === "Escape") {
        fecharPopup();
      }

      // Mantém a navegação por teclado dentro do popup.
      if (evento.key === "Tab") {
        const elementos = [botaoFechar, botaoOk];
        const primeiro = elementos[0];
        const ultimo = elementos[elementos.length - 1];

        if (evento.shiftKey && document.activeElement === primeiro) {
          evento.preventDefault();
          ultimo.focus();
        } else if (
          !evento.shiftKey &&
          document.activeElement === ultimo
        ) {
          evento.preventDefault();
          primeiro.focus();
        }
      }
    }

    botaoFechar.addEventListener("click", fecharPopup);
    botaoOk.addEventListener("click", fecharPopup);

    overlay.addEventListener("click", function (evento) {
      if (evento.target === overlay) fecharPopup();
    });

    document.addEventListener("keydown", aoTeclar);

    botaoOk.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarPopup);
  } else {
    iniciarPopup();
  }
})();
