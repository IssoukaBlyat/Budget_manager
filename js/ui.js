/* ==========================================================
   Budget Manager
   ui.js
   Navigation, thème sombre et interactions générales
   ========================================================== */

"use strict";


/* ==========================================================
   CONFIGURATION
   ========================================================== */

const UI_CONFIG = {
    defaultSection: "dashboard",
    activeSectionKey: "budgetManagerActiveSection",
    darkModeButtonId: "dark-mode-toggle"
};


/* ==========================================================
   NAVIGATION
   ========================================================== */

/**
 * Retourne toutes les sections principales.
 */
function getPages() {
    return Array.from(
        document.querySelectorAll(".page")
    );
}


/**
 * Retourne tous les boutons de navigation.
 */
function getNavigationButtons() {
    return Array.from(
        document.querySelectorAll(".nav-btn")
    );
}


/**
 * Vérifie qu'une section existe.
 */
function sectionExists(sectionId) {
    return Boolean(
        document.getElementById(sectionId)
    );
}


/**
 * Affiche une section et masque les autres.
 */
function showSection(
    sectionId,
    saveSelection = true
) {
    const targetSection =
        sectionExists(sectionId)
            ? sectionId
            : UI_CONFIG.defaultSection;

    getPages().forEach((page) => {
        const isActive =
            page.id === targetSection;

        page.classList.toggle(
            "active",
            isActive
        );

        page.setAttribute(
            "aria-hidden",
            String(!isActive)
        );
    });

    getNavigationButtons().forEach(
        (button) => {
            const isActive =
                button.dataset.section ===
                targetSection;

            button.classList.toggle(
                "active",
                isActive
            );

            button.setAttribute(
                "aria-current",
                isActive
                    ? "page"
                    : "false"
            );
        }
    );

    if (saveSelection) {
        saveActiveSection(
            targetSection
        );
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/**
 * Enregistre la section actuellement affichée.
 */
function saveActiveSection(sectionId) {
    try {
        sessionStorage.setItem(
            UI_CONFIG.activeSectionKey,
            sectionId
        );
    } catch (error) {
        console.warn(
            "Impossible d'enregistrer la section active.",
            error
        );
    }
}


/**
 * Charge la dernière section affichée.
 */
function loadActiveSection() {
    try {
        const savedSection =
            sessionStorage.getItem(
                UI_CONFIG.activeSectionKey
            );

        if (
            savedSection &&
            sectionExists(savedSection)
        ) {
            return savedSection;
        }
    } catch (error) {
        console.warn(
            "Impossible de charger la section active.",
            error
        );
    }

    return UI_CONFIG.defaultSection;
}


/**
 * Connecte les boutons de navigation.
 */
function initializeNavigation() {
    getNavigationButtons().forEach(
        (button) => {
            button.type = "button";

            button.addEventListener(
                "click",
                () => {
                    const sectionId =
                        button.dataset.section;

                    if (!sectionId) {
                        return;
                    }

                    showSection(sectionId);
                }
            );
        }
    );

    showSection(
        loadActiveSection(),
        false
    );
}


/* ==========================================================
   MODE SOMBRE
   ========================================================== */

/**
 * Crée dynamiquement le bouton clair/sombre.
 */
function createDarkModeButton() {
    const existingButton =
        document.getElementById(
            UI_CONFIG.darkModeButtonId
        );

    if (existingButton) {
        return existingButton;
    }

    const header =
        document.querySelector("header");

    if (!header) {
        return null;
    }

    const button =
        document.createElement("button");

    button.id =
        UI_CONFIG.darkModeButtonId;

    button.type = "button";
    button.className =
        "dark-mode-toggle";

    button.setAttribute(
        "aria-label",
        "Activer le mode sombre"
    );

    button.setAttribute(
        "title",
        "Changer le thème"
    );

    header.appendChild(button);

    return button;
}


/**
 * Applique le thème sélectionné.
 */
function applyDarkMode(
    isDarkMode,
    savePreference = true
) {
    document.body.classList.toggle(
        "dark",
        isDarkMode
    );

    updateDarkModeButton(
        isDarkMode
    );

    if (savePreference) {
        StorageManager.saveSetting(
            "darkMode",
            isDarkMode
        );
    }
}


/**
 * Actualise le texte et l'accessibilité du bouton.
 */
function updateDarkModeButton(
    isDarkMode
) {
    const button =
        document.getElementById(
            UI_CONFIG.darkModeButtonId
        );

    if (!button) {
        return;
    }

    button.textContent =
        isDarkMode
            ? "☀️ Mode clair"
            : "🌙 Mode sombre";

    button.setAttribute(
        "aria-label",
        isDarkMode
            ? "Activer le mode clair"
            : "Activer le mode sombre"
    );

    button.setAttribute(
        "aria-pressed",
        String(isDarkMode)
    );
}


/**
 * Active ou désactive le mode sombre.
 */
function toggleDarkMode() {
    const isDarkMode =
        !document.body.classList.contains(
            "dark"
        );

    applyDarkMode(isDarkMode);
}


/**
 * Charge le thème enregistré.
 */
function initializeDarkMode() {
    const button =
        createDarkModeButton();

    const settings =
        StorageManager.getSettings();

    applyDarkMode(
        Boolean(settings.darkMode),
        false
    );

    if (button) {
        button.addEventListener(
            "click",
            toggleDarkMode
        );
    }
}


/* ==========================================================
   DATE DU TABLEAU DE BORD
   ========================================================== */

/**
 * Ajoute la date actuelle sous le titre du tableau de bord.
 */
function displayCurrentDate() {
    const dashboard =
        document.getElementById(
            "dashboard"
        );

    if (!dashboard) {
        return;
    }

    let dateElement =
        dashboard.querySelector(
            ".current-date"
        );

    if (!dateElement) {
        dateElement =
            document.createElement("p");

        dateElement.className =
            "current-date";

        const welcomeText =
            dashboard.querySelector(
                ":scope > p"
            );

        if (welcomeText) {
            welcomeText.insertAdjacentElement(
                "afterend",
                dateElement
            );
        } else {
            dashboard.prepend(
                dateElement
            );
        }
    }

    const currentDate =
        Utils.getCurrentDate();

    dateElement.textContent =
        currentDate.charAt(0).toUpperCase() +
        currentDate.slice(1);
}


/* ==========================================================
   RACCOURCIS CLAVIER
   ========================================================== */

/**
 * Permet de changer de page au clavier.
 *
 * Alt + 1 : tableau de bord
 * Alt + 2 : budget prévisionnel
 * Alt + 3 : budget réel
 * Alt + 4 : comparaison
 * Alt + D : mode sombre
 */
function initializeKeyboardShortcuts() {
    const shortcuts = {
        "1": "dashboard",
        "2": "previsionnel",
        "3": "reel",
        "4": "comparaison"
    };

    document.addEventListener(
        "keydown",
        (event) => {
            if (!event.altKey) {
                return;
            }

            const activeElement =
                document.activeElement;

            const isTyping =
                activeElement &&
                (
                    activeElement.tagName ===
                        "INPUT" ||
                    activeElement.tagName ===
                        "TEXTAREA" ||
                    activeElement.tagName ===
                        "SELECT"
                );

            if (isTyping) {
                return;
            }

            const pressedKey =
                event.key.toLowerCase();

            if (shortcuts[pressedKey]) {
                event.preventDefault();

                showSection(
                    shortcuts[pressedKey]
                );

                return;
            }

            if (pressedKey === "d") {
                event.preventDefault();
                toggleDarkMode();
            }
        }
    );
}


/* ==========================================================
   GESTION DE L'AFFICHAGE
   ========================================================== */

/**
 * Actualise les données lorsqu'une page devient visible.
 */
function initializeVisibilityHandling() {
    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.hidden) {
                return;
            }

            if (
                window.BudgetManager &&
                typeof BudgetManager
                    .loadBudgets ===
                    "function"
            ) {
                BudgetManager.loadBudgets();
                BudgetManager.renderAllBudgets();
            }

            if (
                window.ComparisonManager &&
                typeof ComparisonManager
                    .refresh ===
                    "function"
            ) {
                ComparisonManager.refresh();
            }
        }
    );
}


/* ==========================================================
   PROTECTION AVANT FERMETURE
   ========================================================== */

/**
 * Force la sauvegarde des champs actuellement modifiés
 * lorsque l'utilisateur quitte la page.
 */
function initializeBeforeUnloadHandling() {
    window.addEventListener(
        "beforeunload",
        () => {
            const activeElement =
                document.activeElement;

            if (
                activeElement &&
                (
                    activeElement.classList.contains(
                        "budget-description-input"
                    ) ||
                    activeElement.classList.contains(
                        "budget-amount-input"
                    )
                )
            ) {
                activeElement.blur();
            }
        }
    );
}


/* ==========================================================
   ACCESSIBILITÉ
   ========================================================== */

/**
 * Ajoute les attributs d'accessibilité manquants.
 */
function initializeAccessibility() {
    const navigation =
        document.querySelector("nav");

    if (navigation) {
        navigation.setAttribute(
            "aria-label",
            "Navigation principale"
        );
    }

    getPages().forEach((page) => {
        page.setAttribute(
            "role",
            "region"
        );

        const title =
            page.querySelector("h1");

        if (!title) {
            return;
        }

        if (!title.id) {
            title.id =
                `${page.id}-title`;
        }

        page.setAttribute(
            "aria-labelledby",
            title.id
        );
    });

    document.querySelectorAll(
        "table"
    ).forEach((table) => {
        table.setAttribute(
            "role",
            "table"
        );
    });
}


/* ==========================================================
   INITIALISATION
   ========================================================== */

/**
 * Initialise toutes les interactions de l'interface.
 */
function initializeUI() {
    initializeAccessibility();
    initializeNavigation();
    initializeDarkMode();
    initializeKeyboardShortcuts();
    initializeVisibilityHandling();
    initializeBeforeUnloadHandling();
    displayCurrentDate();
}


/* ==========================================================
   EXPORT GLOBAL
   ========================================================== */

window.UIManager = {
    initialize:
        initializeUI,

    showSection,

    applyDarkMode,
    toggleDarkMode,

    displayCurrentDate
};
