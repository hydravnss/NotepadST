(() => {
    "use strict";

    const STORAGE_KEY = "notepadst-content-v1";
    const BUTTON_ID = "notepadst-button";
    const OVERLAY_ID = "notepadst-overlay";

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    // Bouton d'ouverture du Notepad
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

    // Création de la fenêtre Notepad
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
                            id="notepadst-send"
                            type="button"
                            aria-label="Envoyer les notes"
                            title="Envoyer le message">
                            <i class="fa-solid fa-paper-plane"></i>
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

        // Récupérer les notes sauvegardées
        textarea.value = localStorage.getItem(STORAGE_KEY) || "";

        updateCount();

        // Sauvegarde automatique
        textarea.addEventListener("input", () => {
            localStorage.setItem(STORAGE_KEY, textarea.value);

            $("#notepadst-status").textContent = "Enregistré";

            updateCount();
        });

        // Fermer en cliquant à l'extérieur
        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                closeNotepad();
            }
        });

        // Fermer avec la croix
        $("#notepadst-close").addEventListener(
            "click",
            closeNotepad
        );

        // Envoyer le texte du Notepad au bot
        $("#notepadst-send").addEventListener("click", () => {
            const note = textarea.value.trim();

            if (!note) {
                $("#notepadst-status").textContent = "Note vide";
                return;
            }

            // Zone de saisie SillyTavern
            const sendInput =
                $("#send_textarea") ||
                $("#send_form textarea");

            // Bouton d'envoi natif de SillyTavern
            const sendButton =
                $("#send_but") ||
                $("#send_button");

            if (!sendInput) {
                $("#notepadst-status").textContent =
                    "Zone de message introuvable";
                return;
            }

            if (!sendButton) {
                $("#notepadst-status").textContent =
                    "Bouton d'envoi introuvable";
                return;
            }

            // Insérer le texte dans la zone de saisie
            sendInput.value = note;

            // Actualiser l'interface de SillyTavern
            sendInput.dispatchEvent(
                new Event("input", { bubbles: true })
            );

            sendInput.dispatchEvent(
                new Event("change", { bubbles: true })
            );

            // Fermer le Notepad
            closeNotepad();

            // Envoyer le message
            sendButton.click();
        });

        // Effacer les notes
        $("#notepadst-clear").addEventListener("click", () => {
            if (!textarea.value) return;

            if (confirm("Effacer toutes les notes ?")) {
                textarea.value = "";

                localStorage.setItem(STORAGE_KEY, "");

                $("#notepadst-status").textContent =
                    "Notes effacées";

                updateCount();

                textarea.focus();
            }
        });
    }

    // Compteur de caractères
    function updateCount() {
        const textarea = $("#notepadst-text");
        const counter = $("#notepadst-count");

        if (!textarea || !counter) return;

        const count = textarea.value.length;

        counter.textContent =
            `${count} caractère${count === 1 ? "" : "s"}`;
    }

    // Ouvrir le Notepad
    function openNotepad() {
        createNotepad();

        const overlay = $(`#${OVERLAY_ID}`);
        const textarea = $("#notepadst-text");

        if (!overlay || !textarea) return;

        overlay.classList.add("open");
        textarea.focus();
    }

    // Fermer le Notepad
    function closeNotepad() {
        $(`#${OVERLAY_ID}`)?.classList.remove("open");
    }

    // Ouvrir ou fermer
    function toggleNotepad() {
        const overlay = $(`#${OVERLAY_ID}`);

        if (overlay?.classList.contains("open")) {
            closeNotepad();
        } else {
            openNotepad();
        }
    }

    // Fermer avec Échap
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