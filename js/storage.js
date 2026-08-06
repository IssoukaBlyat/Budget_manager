/* ==========================================================
   Budget Manager
   storage.js
   Gestion de la sauvegarde locale
   ========================================================== */

"use strict";

/* ==========================================================
   CONFIGURATION
   ========================================================== */

const STORAGE_KEY = "budgetManagerData";
const STORAGE_VERSION = 1;


/* ==========================================================
   STRUCTURE PAR DÉFAUT
   ========================================================== */

/**
 * Retourne une nouvelle structure de données vide.
 */
function createDefaultData() {
    return {
        version: STORAGE_VERSION,

        previsionnel: {
            incomes: [],
            expenses: []
        },

        reel: {
            incomes: [],
            expenses: []
        },

        settings: {
            darkMode: false
        },

        metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    };
}


/* ==========================================================
   VALIDATION DES DONNÉES
   ========================================================== */

/**
 * Vérifie qu'une ligne de budget possède une structure valide.
 */
function isValidBudgetItem(item) {
    return (
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.description === "string" &&
        Number.isFinite(Number(item.amount))
    );
}


/**
 * Nettoie une liste de revenus ou de dépenses.
 */
function sanitizeItems(items) {
    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter(isValidBudgetItem)
        .map((item) => ({
            id: item.id,
            description: item.description.trim(),
            amount: Math.max(0, Utils.toNumber(item.amount))
        }));
}


/**
 * Nettoie les données chargées depuis localStorage.
 */
function sanitizeData(data) {
    const defaultData = createDefaultData();

    if (!data || typeof data !== "object") {
        return defaultData;
    }

    return {
        version: STORAGE_VERSION,

        previsionnel: {
            incomes: sanitizeItems(data.previsionnel?.incomes),
            expenses: sanitizeItems(data.previsionnel?.expenses)
        },

        reel: {
            incomes: sanitizeItems(data.reel?.incomes),
            expenses: sanitizeItems(data.reel?.expenses)
        },

        settings: {
            darkMode: Boolean(data.settings?.darkMode)
        },

        metadata: {
            createdAt:
                typeof data.metadata?.createdAt === "string"
                    ? data.metadata.createdAt
                    : defaultData.metadata.createdAt,

            updatedAt:
                typeof data.metadata?.updatedAt === "string"
                    ? data.metadata.updatedAt
                    : defaultData.metadata.updatedAt
        }
    };
}


/* ==========================================================
   CHARGEMENT
   ========================================================== */

/**
 * Charge les données enregistrées.
 */
function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return createDefaultData();
        }

        const parsedData = JSON.parse(savedData);

        return sanitizeData(parsedData);
    } catch (error) {
        console.error(
            "Impossible de charger les données enregistrées :",
            error
        );

        return createDefaultData();
    }
}


/* ==========================================================
   SAUVEGARDE
   ========================================================== */

/**
 * Sauvegarde toutes les données de l'application.
 */
function saveData(data) {
    try {
        const sanitizedData = sanitizeData(data);

        sanitizedData.metadata.updatedAt =
            new Date().toISOString();

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(sanitizedData)
        );

        return true;
    } catch (error) {
        console.error(
            "Impossible de sauvegarder les données :",
            error
        );

        Utils.showNotification(
            "La sauvegarde a échoué.",
            "error"
        );

        return false;
    }
}


/* ==========================================================
   GESTION D'UN BUDGET
   ========================================================== */

/**
 * Retourne un budget précis.
 *
 * @param {"previsionnel"|"reel"} budgetType
 */
function getBudget(budgetType) {
    const data = loadData();

    if (!isValidBudgetType(budgetType)) {
        console.warn(
            `Type de budget invalide : ${budgetType}`
        );

        return {
            incomes: [],
            expenses: []
        };
    }

    return Utils.deepCopy(data[budgetType]);
}


/**
 * Remplace entièrement un budget.
 *
 * @param {"previsionnel"|"reel"} budgetType
 * @param {Object} budget
 */
function saveBudget(budgetType, budget) {
    if (!isValidBudgetType(budgetType)) {
        return false;
    }

    const data = loadData();

    data[budgetType] = {
        incomes: sanitizeItems(budget?.incomes),
        expenses: sanitizeItems(budget?.expenses)
    };

    return saveData(data);
}


/* ==========================================================
   AJOUT D'UNE LIGNE
   ========================================================== */

/**
 * Ajoute un revenu ou une dépense.
 *
 * @param {"previsionnel"|"reel"} budgetType
 * @param {"incomes"|"expenses"} itemType
 * @param {Object} item
 */
function addItem(budgetType, itemType, item) {
    if (
        !isValidBudgetType(budgetType) ||
        !isValidItemType(itemType)
    ) {
        return false;
    }

    const data = loadData();

    const newItem = {
        id:
            typeof item?.id === "string"
                ? item.id
                : Utils.generateId(),

        description:
            typeof item?.description === "string"
                ? item.description.trim()
                : "",

        amount: Math.max(
            0,
            Utils.toNumber(item?.amount)
        )
    };

    if (!Utils.isValidLabel(newItem.description)) {
        return false;
    }

    data[budgetType][itemType].push(newItem);

    return saveData(data);
}


/* ==========================================================
   MODIFICATION D'UNE LIGNE
   ========================================================== */

/**
 * Met à jour une ligne existante.
 */
function updateItem(
    budgetType,
    itemType,
    itemId,
    updatedValues
) {
    if (
        !isValidBudgetType(budgetType) ||
        !isValidItemType(itemType) ||
        typeof itemId !== "string"
    ) {
        return false;
    }

    const data = loadData();
    const items = data[budgetType][itemType];

    const itemIndex = items.findIndex(
        (item) => item.id === itemId
    );

    if (itemIndex === -1) {
        return false;
    }

    const currentItem = items[itemIndex];

    const updatedItem = {
        id: currentItem.id,

        description:
            typeof updatedValues?.description === "string"
                ? updatedValues.description.trim()
                : currentItem.description,

        amount:
            updatedValues?.amount !== undefined
                ? Math.max(
                    0,
                    Utils.toNumber(updatedValues.amount)
                )
                : currentItem.amount
    };

    if (!Utils.isValidLabel(updatedItem.description)) {
        return false;
    }

    items[itemIndex] = updatedItem;

    return saveData(data);
}


/* ==========================================================
   SUPPRESSION D'UNE LIGNE
   ========================================================== */

/**
 * Supprime une ligne à partir de son identifiant.
 */
function deleteItem(
    budgetType,
    itemType,
    itemId
) {
    if (
        !isValidBudgetType(budgetType) ||
        !isValidItemType(itemType) ||
        typeof itemId !== "string"
    ) {
        return false;
    }

    const data = loadData();
    const items = data[budgetType][itemType];

    const filteredItems = items.filter(
        (item) => item.id !== itemId
    );

    if (filteredItems.length === items.length) {
        return false;
    }

    data[budgetType][itemType] = filteredItems;

    return saveData(data);
}


/* ==========================================================
   RÉINITIALISATION
   ========================================================== */

/**
 * Réinitialise uniquement un budget.
 */
function resetBudget(budgetType) {
    if (!isValidBudgetType(budgetType)) {
        return false;
    }

    const data = loadData();

    data[budgetType] = {
        incomes: [],
        expenses: []
    };

    return saveData(data);
}


/**
 * Réinitialise toutes les données de l'application.
 */
function resetAllData() {
    try {
        localStorage.removeItem(STORAGE_KEY);

        return true;
    } catch (error) {
        console.error(
            "Impossible de réinitialiser les données :",
            error
        );

        return false;
    }
}


/* ==========================================================
   PARAMÈTRES
   ========================================================== */

/**
 * Retourne les paramètres enregistrés.
 */
function getSettings() {
    const data = loadData();

    return Utils.deepCopy(data.settings);
}


/**
 * Sauvegarde un paramètre.
 */
function saveSetting(settingName, value) {
    const data = loadData();

    if (!(settingName in data.settings)) {
        console.warn(
            `Paramètre inconnu : ${settingName}`
        );

        return false;
    }

    data.settings[settingName] = value;

    return saveData(data);
}


/* ==========================================================
   EXPORT ET IMPORT
   ========================================================== */

/**
 * Retourne les données sous forme de texte JSON.
 */
function exportData() {
    const data = loadData();

    return JSON.stringify(data, null, 2);
}


/**
 * Importe des données JSON.
 */
function importData(jsonData) {
    try {
        const parsedData =
            typeof jsonData === "string"
                ? JSON.parse(jsonData)
                : jsonData;

        const sanitizedData =
            sanitizeData(parsedData);

        return saveData(sanitizedData);
    } catch (error) {
        console.error(
            "Impossible d'importer les données :",
            error
        );

        return false;
    }
}


/* ==========================================================
   VÉRIFICATIONS
   ========================================================== */

function isValidBudgetType(budgetType) {
    return (
        budgetType === "previsionnel" ||
        budgetType === "reel"
    );
}


function isValidItemType(itemType) {
    return (
        itemType === "incomes" ||
        itemType === "expenses"
    );
}


/* ==========================================================
   TEST DE DISPONIBILITÉ DU STOCKAGE
   ========================================================== */

/**
 * Vérifie que localStorage fonctionne dans le navigateur.
 */
function isStorageAvailable() {
    const testKey = "__budget_manager_test__";

    try {
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);

        return true;
    } catch (error) {
        return false;
    }
}


/* ==========================================================
   EXPORT GLOBAL
   ========================================================== */

window.StorageManager = {
    STORAGE_KEY,
    STORAGE_VERSION,

    createDefaultData,
    loadData,
    saveData,

    getBudget,
    saveBudget,

    addItem,
    updateItem,
    deleteItem,

    resetBudget,
    resetAllData,

    getSettings,
    saveSetting,

    exportData,
    importData,

    isStorageAvailable
};
