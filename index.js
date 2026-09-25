(() => {
    "use strict";

    const STORAGE_KEY = "notepadst-content-v1";
    const BUTTON_ID = "notepadst-button";
    const OVERLAY_ID = "notepadst-overlay";

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    // ========================================
    // BOUTON DANS LA BARRE DE SILLYTAVERN
    // ========================================

    function createButton() {
        if ($(`#${BUTTON_ID}`)) return;

        // Emplacements possibles selon la version de ST
        const host =
            $("#top-settings-holder") ||
            $("#top-bar") ||
            $("#top-bar-holder");

        if (!host) return;

        const button = document.createElement("div");

        button.id = BUTTON_ID;
        button.className = "menu_button interactable";
        button.title = "NotepadST";
        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");

        button.innerHTML = `
            <i class="fa-solid fa-pen-to-square"></i>
            <span>NotepadST</span>
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

    // ========================================
    // CRÉATION DU BLOC-NOTES
    // ========================================

    function createNotepad() {
        if ($(`#${OVERLAY_ID}`)) return;

        const overlay = document.createElement("div");
        overlay.id = OVERLAY_ID;

        overlay.innerHTML = `
            <section id="notepadst-window">

                <header class="notepadst-header">

                    <div class="notepadst-title">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>NotepadST</span>
                    </div>

                    <div class="notepadst-actions">

                        <button
                            id="notepadst-clear"
                            type="button"
                            title="Effacer les notes">
                            <i class="fa-solid fa-trash"></i>
                        </button>

                        <button
                            id="notepadst-close"
                            type="button"
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
                    <span id="notepadst-status">
                        Sauvegarde automatique
                    </span>

                    <span id="notepadst-count">
                        0 caractère
                    </span>
                </footer>

            </section>
        `;

        document.body.appendChild(overlay);

        const textarea = $("#notepadst-text");

        // Récupération des notes précédentes
        textarea.value = localStorage.getItem(STORAGE_KEY) || "";

        updateCount();

        // Sauvegarde automatique
        textarea.addEventListener("input", () => {
            localStorage.setItem(STORAGE_KEY, textarea.value);

            $("#notepadst-status").textContent = "Enregistré";

            updateCount();
        });

        // Fermeture
        $("#notepadst-close").addEventListener(
            "click",
            closeNotepad
        );

        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                closeNotepad();
            }
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

    // ========================================
    // COMPTEUR
    // ========================================

    function updateCount() {
        const textarea = $("#notepadst-text");
        const counter = $("#notepadst-count");

        if (!textarea || !counter) return;

        const count = textarea.value.length;

        counter.textContent =
            `${count} caractère${count === 1 ? "" : "s"}`;
    }

    // ========================================
    // OUVRIR / FERMER
    // ========================================

    function openNotepad() {
        createNotepad();

        const overlay = $(`#${OVERLAY_ID}`);

        overlay.classList.add("open");

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

    // Fermer avec Échap
    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            $(`#${OVERLAY_ID}`)?.classList.contains("open")
        ) {
            closeNotepad();
        }
    });

    // ========================================
    // INITIALISATION
    // ========================================

    function init() {
        createButton();

        // Attend que SillyTavern crée sa barre supérieure
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