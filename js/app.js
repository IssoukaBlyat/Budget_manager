/* ==========================================================
   Budget Manager
   app.js
   Point d’entrée principal de l’application
   ========================================================== */

"use strict";


/* ==========================================================
   CONFIGURATION
   ========================================================== */

const APP_CONFIG = {
    name: "Budget Manager",
    version: "1.0.0"
};


/* ==========================================================
   VÉRIFICATION DES MODULES
   ========================================================== */

/**
 * Vérifie que tous les modules nécessaires sont disponibles.
 */
function checkRequiredModules() {
    const requiredModules = [
        {
            name: "Utils",
            value: window.Utils
        },
        {
            name: "StorageManager",
            value: window.StorageManager
        },
        {
            name: "BudgetManager",
            value: window.BudgetManager
        },
        {
            name: "ComparisonManager",
            value: window.ComparisonManager
        },
        {
            name: "UIManager",
            value: window.UIManager
        }
    ];

    const missingModules = requiredModules
        .filter((module) => !module.value)
        .map((module) => module.name);

    if (missingModules.length > 0) {
        console.error(
            "Modules manquants :",
            missingModules.join(", ")
        );

        return false;
    }

    return true;
}


/* ==========================================================
   GESTION DU STOCKAGE
   ========================================================== */

/**
 * Vérifie que le navigateur autorise localStorage.
 */
function checkStorageAvailability() {
    const isAvailable =
        StorageManager.isStorageAvailable();

    if (isAvailable) {
        return true;
    }

    console.warn(
        "Le stockage local n'est pas disponible."
    );

    Utils.showNotification(
        "La sauvegarde locale n'est pas disponible dans ce navigateur.",
        "warning"
    );

    return false;
}


/* ==========================================================
   INITIALISATION DES DONNÉES
   ========================================================== */

/**
 * Crée les données initiales si aucune sauvegarde n'existe.
 */
function initializeStoredData() {
    try {
        const savedData =
            localStorage.getItem(
                StorageManager.STORAGE_KEY
            );

        if (savedData) {
            return;
        }

        const defaultData =
            StorageManager.createDefaultData();

        StorageManager.saveData(
            defaultData
        );
    } catch (error) {
        console.warn(
            "Impossible d'initialiser les données locales.",
            error
        );
    }
}


/* ==========================================================
   GESTION DES ERREURS
   ========================================================== */

/**
 * Gère les erreurs JavaScript non interceptées.
 */
function initializeGlobalErrorHandling() {
    window.addEventListener(
        "error",
        (event) => {
            console.error(
                "Erreur JavaScript :",
                event.error || event.message
            );
        }
    );

    window.addEventListener(
        "unhandledrejection",
        (event) => {
            console.error(
                "Promesse rejetée :",
                event.reason
            );
        }
    );
}


/* ==========================================================
   INFORMATIONS DE L'APPLICATION
   ========================================================== */

/**
 * Affiche les informations de l'application dans la console.
 */
function displayApplicationInformation() {
    console.info(
        `%c${APP_CONFIG.name} v${APP_CONFIG.version}`,
        [
            "font-weight: bold",
            "font-size: 14px",
            "color: #2563eb"
        ].join(";")
    );

    console.info(
        "Application chargée avec succès."
    );
}


/* ==========================================================
   ÉTAT DE CHARGEMENT
   ========================================================== */

/**
 * Ajoute une classe indiquant que l'application est prête.
 */
function markApplicationAsReady() {
    document.body.classList.add(
        "app-ready"
    );

    document.body.setAttribute(
        "data-app-version",
        APP_CONFIG.version
    );
}


/**
 * Affiche un message d'erreur critique dans la page.
 */
function displayCriticalError() {
    const main =
        document.querySelector("main");

    if (!main) {
        return;
    }

    const errorContainer =
        document.createElement("section");

    errorContainer.className =
        "critical-error";

    const title =
        document.createElement("h1");

    title.textContent =
        "Une erreur empêche le démarrage de l'application";

    const message =
        document.createElement("p");

    message.textContent =
        "Vérifiez que tous les fichiers JavaScript sont présents et correctement liés dans index.html.";

    errorContainer.appendChild(title);
    errorContainer.appendChild(message);

    main.prepend(errorContainer);
}


/* ==========================================================
   INITIALISATION PRINCIPALE
   ========================================================== */

/**
 * Démarre tous les modules dans le bon ordre.
 */
function initializeApplication() {
    initializeGlobalErrorHandling();

    if (!checkRequiredModules()) {
        displayCriticalError();
        return;
    }

    const storageAvailable =
        checkStorageAvailability();

    if (storageAvailable) {
        initializeStoredData();
    }

    /*
     * Ordre important :
     *
     * 1. UIManager prépare les sections et le thème.
     * 2. ComparisonManager écoute l'événement budget:updated.
     * 3. BudgetManager charge les données et déclenche l'événement.
     */

    UIManager.initialize();

    ComparisonManager.initialize();

    BudgetManager.initialize();

    markApplicationAsReady();

    displayApplicationInformation();
}


/* ==========================================================
   DÉMARRAGE
   ========================================================== */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication,
        {
            once: true
        }
    );
} else {
    initializeApplication();
}


/* ==========================================================
   EXPORT GLOBAL
   ========================================================== */

window.BudgetApp = {
    config: APP_CONFIG,

    initialize:
        initializeApplication,

    refresh() {
        BudgetManager.loadBudgets();
        BudgetManager.renderAllBudgets();
        ComparisonManager.refresh();
        UIManager.displayCurrentDate();
    }
};
