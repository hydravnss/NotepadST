(() => {
    "use strict";

    const STORAGE_KEY = "notepadst-content-v1";
    const BUTTON_ID = "notepadst-button";
    const OVERLAY_ID = "notepadst-overlay";

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    // Icône près de la barre de saisie
    function createButton() {
        if ($(`#${BUTTON_ID}`)) return;

        const host =
            $("#leftSendForm") ||
            $("#send_form");

        if (!host) return;

        const button = document.createElement("div");

        button.id = BUTTON_ID;
        button.className = "menu_button interactable";
        button.title = "Notepad";
        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-label", "Ouvrir le bloc-notes");

        button.innerHTML = `
            <i class="fa-solid fa-pen-to-square"></i>
        `;

        button.addEventListener("click", toggleNotepad);

        button.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleNotepad();
            }
        });

        host.appendChild(button);
    }

    // Création de la fenêtre
    function createNotepad() {
        if ($(`#${OVERLAY_ID}`)) return;

        const overlay = document.createElement("div");
        overlay.id = OVERLAY_ID;

        overlay.innerHTML = `
            <section id="notepadst-window">

                <header class="notepadst-header">
                    <div class="notepadst-title">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>Notepad</span>
                    </div>

                    <div class="notepadst-actions">
                        <button
                            id="notepadst-clear"
                            type="button"
                            aria-label="Effacer les notes"
                            title="Effacer">
                            <i class="fa-solid fa-trash"></i>
                        </button>

                        <button
                            id="notepadst-close"
                            type="button"
                            aria-label="Fermer"
                            title="Fermer">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </header>

                <textarea
                    id="notepadst-text"
                    placeholder="Écris tes notes ici…"
                    spellcheck="false"></textarea>

                <footer class="notepadst-footer">
                    <span id="notepadst-status">Enregistré</span>
                    <span id="notepadst-count">0 caractère</span>
                </footer>

            </section>
        `;

        document.body.appendChild(overlay);

        const textarea = $("#notepadst-text");

        textarea.value = localStorage.getItem(STORAGE_KEY) || "";
        updateCount();

        // Sauvegarde automatique
        textarea.addEventListener("input", () => {
            localStorage.setItem(STORAGE_KEY, textarea.value);
            $("#notepadst-status").textContent = "Enregistré";
            updateCount();
        });

        // Fermer en touchant l'extérieur
        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                closeNotepad();
            }
        });

        $("#notepadst-close").addEventListener(
            "click",
            closeNotepad
        );

        // Effacer les notes
        $("#notepadst-clear").addEventListener("click", () => {
            if (!textarea.value) return;

            if (confirm("Effacer toutes les notes ?")) {
                textarea.value = "";
                localStorage.setItem(STORAGE_KEY, "");

                $("#notepadst-status").textContent = "Notes effacées";
                updateCount();
                textarea.focus();
            }
        });
    }

    function updateCount() {
        const textarea = $("#notepadst-text");
        const counter = $("#notepadst-count");

        if (!textarea || !counter) return;

        const count = textarea.value.length;

        counter.textContent =
            `${count} caractère${count === 1 ? "" : "s"}`;
    }

    function openNotepad() {
        createNotepad();

        $(`#${OVERLAY_ID}`).classList.add("open");
        $("#notepadst-text").focus();
    }

    function closeNotepad() {
        $(`#${OVERLAY_ID}`)?.classList.remove("open");
    }

    function toggleNotepad() {
        const overlay = $(`#${OVERLAY_ID}`);

        if (overlay?.classList.contains("open")) {
            closeNotepad();
        } else {
            openNotepad();
        }
    }

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            $(`#${OVERLAY_ID}`)?.classList.contains("open")
        ) {
            closeNotepad();
        }
    });

    // Initialisation et détection de la barre de saisie
    function init() {
        createButton();

        const observer = new MutationObserver(() => {
            createButton();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {
            once: true
        });
    } else {
        init();
    }
})();