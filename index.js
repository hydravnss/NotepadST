(() => {
    const STORAGE_KEY = "notepadst-content-v1";

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    // Création du bouton NotepadST
    function createButton() {
        if ($("#notepadst-button")) return;

        const button = document.createElement("div");

        button.id = "notepadst-button";
        button.className = "interactable";
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

        const host =
            $("#top-bar") ||
            $("#top-bar-buttons") ||
            $("#extensions_settings");

        if (host) {
            host.appendChild(button);
        }
    }

    // Création de la fenêtre
    function createModal() {
        if ($("#notepadst-overlay")) return;

        const overlay = document.createElement("div");

        overlay.id = "notepadst-overlay";

        overlay.innerHTML = `
            <section
                id="notepadst-window"
                role="dialog"
                aria-modal="true"
                aria-label="NotepadST"
            >
                <header class="notepadst-header">

                    <div class="notepadst-title">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>NotepadST</span>
                    </div>

                    <div class="notepadst-actions">

                        <button
                            type="button"
                            id="notepadst-clear"
                            title="Effacer les notes"
                            aria-label="Effacer les notes"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                        <button
                            type="button"
                            id="notepadst-close"
                            title="Fermer"
                            aria-label="Fermer"
                        >
                            <i class="fa-solid fa-xmark"></i>
                        </button>

                    </div>
                </header>

                <textarea
                    id="notepadst-text"
                    placeholder="Écris tes notes ici…"
                    spellcheck="false"
                ></textarea>

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

        // Fermer en cliquant à l'extérieur
        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                closeNotepad();
            }
        });

        document.body.appendChild(overlay);

        const textarea = $("#notepadst-text");

        // Restaurer les notes sauvegardées
        textarea.value =
            localStorage.getItem(STORAGE_KEY) || "";

        updateCount();

        // Sauvegarde automatique
        textarea.addEventListener("input", () => {
            localStorage.setItem(
                STORAGE_KEY,
                textarea.value
            );

            $("#notepadst-status").textContent =
                "Enregistré";

            updateCount();
        });

        // Bouton fermer
        $("#notepadst-close").addEventListener(
            "click",
            closeNotepad
        );

        // Bouton effacer
        $("#notepadst-clear").addEventListener(
            "click",
            () => {
                if (!textarea.value) return;

                if (confirm("Effacer toutes les notes ?")) {
                    textarea.value = "";

                    localStorage.setItem(
                        STORAGE_KEY,
                        ""
                    );

                    updateCount();

                    $("#notepadst-status").textContent =
                        "Notes effacées";

                    textarea.focus();
                }
            }
        );
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

    // Ouvrir le bloc-notes
    function openNotepad() {
        createModal();

        $("#notepadst-overlay").classList.add("open");

        $("#notepadst-text").focus();
    }

    // Fermer le bloc-notes
    function closeNotepad() {
        $("#notepadst-overlay")?.classList.remove("open");
    }

    // Basculer entre ouvert et fermé
    function toggleNotepad() {
        const overlay = $("#notepadst-overlay");

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
            $("#notepadst-overlay")?.classList.contains("open")
        ) {
            closeNotepad();
        }
    });

    // Initialisation
    function init() {
        createButton();

        // Surveille la barre d'interface de SillyTavern
        const observer = new MutationObserver(() => {
            createButton();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }
})();