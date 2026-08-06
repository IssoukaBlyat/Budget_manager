/* ==========================================================
   Budget Manager
   budget.js
   Gestion des budgets, lignes, calculs et affichage
   ========================================================== */

"use strict";


/* ==========================================================
   CONFIGURATION
   ========================================================== */

const BUDGET_CONFIG = {
    previsionnel: {
        incomeBodyId: "income-previsionnel-body",
        expenseBodyId: "expense-previsionnel-body",

        incomeTotalId: "income-previsionnel-total",
        expenseTotalId: "expense-previsionnel-total",
        balanceId: "solde-previsionnel",

        addIncomeButtonId: "add-income-previsionnel",
        addExpenseButtonId: "add-expense-previsionnel"
    },

    reel: {
        incomeBodyId: "income-reel-body",
        expenseBodyId: "expense-reel-body",

        incomeTotalId: "income-reel-total",
        expenseTotalId: "expense-reel-total",
        balanceId: "solde-reel",

        addIncomeButtonId: "add-income-reel",
        addExpenseButtonId: "add-expense-reel"
    }
};


/* ==========================================================
   ÉTAT LOCAL
   ========================================================== */

const budgetsState = {
    previsionnel: {
        incomes: [],
        expenses: []
    },

    reel: {
        incomes: [],
        expenses: []
    }
};


/* ==========================================================
   CHARGEMENT DES DONNÉES
   ========================================================== */

/**
 * Charge les budgets enregistrés dans localStorage.
 */
function loadBudgets() {
    budgetsState.previsionnel =
        StorageManager.getBudget("previsionnel");

    budgetsState.reel =
        StorageManager.getBudget("reel");
}


/**
 * Recharge un budget précis depuis localStorage.
 */
function reloadBudget(budgetType) {
    if (!isKnownBudgetType(budgetType)) {
        return;
    }

    budgetsState[budgetType] =
        StorageManager.getBudget(budgetType);
}


/* ==========================================================
   CRÉATION D'UNE LIGNE
   ========================================================== */

/**
 * Crée une ligne HTML pour un revenu ou une dépense.
 *
 * @param {"previsionnel"|"reel"} budgetType
 * @param {"incomes"|"expenses"} itemType
 * @param {Object} item
 * @returns {HTMLTableRowElement}
 */
function createBudgetRow(
    budgetType,
    itemType,
    item
) {
    const row = document.createElement("tr");

    row.dataset.id = item.id;
    row.dataset.budgetType = budgetType;
    row.dataset.itemType = itemType;

    const descriptionCell =
        document.createElement("td");

    const amountCell =
        document.createElement("td");

    const actionCell =
        document.createElement("td");


    /* Champ description */

    const descriptionInput =
        document.createElement("input");

    descriptionInput.type = "text";
    descriptionInput.className =
        "budget-description-input";

    descriptionInput.value =
        item.description || "";

    descriptionInput.placeholder =
        itemType === "incomes"
            ? "Ex. Salaire"
            : "Ex. Loyer";

    descriptionInput.maxLength = 80;

    descriptionInput.setAttribute(
        "aria-label",
        itemType === "incomes"
            ? "Description du revenu"
            : "Description de la dépense"
    );


    /* Champ montant */

    const amountInput =
        document.createElement("input");

    amountInput.type = "number";
    amountInput.className =
        "budget-amount-input";

    amountInput.value =
        Number(item.amount) || 0;

    amountInput.min = "0";
    amountInput.step = "0.01";
    amountInput.inputMode = "decimal";
    amountInput.placeholder = "0,00";

    amountInput.setAttribute(
        "aria-label",
        itemType === "incomes"
            ? "Montant du revenu"
            : "Montant de la dépense"
    );


    /* Bouton de suppression */

    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "×";

    deleteButton.title = "Supprimer cette ligne";

    deleteButton.setAttribute(
        "aria-label",
        "Supprimer cette ligne"
    );


    /* Événements */

    descriptionInput.addEventListener(
        "change",
        () => {
            handleItemUpdate(
                budgetType,
                itemType,
                item.id,
                {
                    description:
                        descriptionInput.value
                },
                descriptionInput
            );
        }
    );

    descriptionInput.addEventListener(
        "blur",
        () => {
            handleItemUpdate(
                budgetType,
                itemType,
                item.id,
                {
                    description:
                        descriptionInput.value
                },
                descriptionInput
            );
        }
    );

    amountInput.addEventListener(
        "input",
        () => {
            handleItemUpdate(
                budgetType,
                itemType,
                item.id,
                {
                    amount:
                        amountInput.value
                },
                amountInput,
                false
            );
        }
    );

    amountInput.addEventListener(
        "change",
        () => {
            handleItemUpdate(
                budgetType,
                itemType,
                item.id,
                {
                    amount:
                        amountInput.value
                },
                amountInput
            );
        }
    );

    deleteButton.addEventListener(
        "click",
        () => {
            removeBudgetItem(
                budgetType,
                itemType,
                item.id
            );
        }
    );


    /* Assemblage */

    descriptionCell.appendChild(
        descriptionInput
    );

    amountCell.appendChild(
        amountInput
    );

    actionCell.appendChild(
        deleteButton
    );

    row.appendChild(descriptionCell);
    row.appendChild(amountCell);
    row.appendChild(actionCell);

    return row;
}


/* ==========================================================
   AFFICHAGE D'UN BUDGET
   ========================================================== */

/**
 * Affiche un budget complet.
 */
function renderBudget(budgetType) {
    if (!isKnownBudgetType(budgetType)) {
        return;
    }

    const config =
        BUDGET_CONFIG[budgetType];

    const budget =
        budgetsState[budgetType];

    const incomeBody =
        document.getElementById(
            config.incomeBodyId
        );

    const expenseBody =
        document.getElementById(
            config.expenseBodyId
        );

    if (!incomeBody || !expenseBody) {
        return;
    }

    Utils.clearElement(incomeBody);
    Utils.clearElement(expenseBody);

    budget.incomes.forEach((item) => {
        incomeBody.appendChild(
            createBudgetRow(
                budgetType,
                "incomes",
                item
            )
        );
    });

    budget.expenses.forEach((item) => {
        expenseBody.appendChild(
            createBudgetRow(
                budgetType,
                "expenses",
                item
            )
        );
    });

    updateBudgetSummary(budgetType);
}


/**
 * Affiche les deux budgets.
 */
function renderAllBudgets() {
    renderBudget("previsionnel");
    renderBudget("reel");
}


/* ==========================================================
   AJOUT D'UNE LIGNE
   ========================================================== */

/**
 * Ajoute un revenu ou une dépense vide.
 */
function addBudgetItem(
    budgetType,
    itemType
) {
    if (
        !isKnownBudgetType(budgetType) ||
        !isKnownItemType(itemType)
    ) {
        return;
    }

    const defaultDescription =
        itemType === "incomes"
            ? "Nouveau revenu"
            : "Nouvelle dépense";

    const newItem = {
        id: Utils.generateId(),
        description: defaultDescription,
        amount: 0
    };

    const wasAdded =
        StorageManager.addItem(
            budgetType,
            itemType,
            newItem
        );

    if (!wasAdded) {
        Utils.showNotification(
            "Impossible d'ajouter la ligne.",
            "error"
        );

        return;
    }

    budgetsState[budgetType][itemType]
        .push(newItem);

    renderBudget(budgetType);

    focusLastCreatedRow(
        budgetType,
        itemType,
        newItem.id
    );

    notifyApplicationUpdate();
}


/**
 * Place le curseur dans la nouvelle description.
 */
function focusLastCreatedRow(
    budgetType,
    itemType,
    itemId
) {
    const selector = [
        `tr[data-id="${itemId}"]`,
        `[data-budget-type="${budgetType}"]`,
        `[data-item-type="${itemType}"]`,
        ".budget-description-input"
    ].join(" ");

    const input =
        document.querySelector(selector);

    if (!input) {
        return;
    }

    input.focus();
    input.select();
}


/* ==========================================================
   MODIFICATION D'UNE LIGNE
   ========================================================== */

/**
 * Met à jour une ligne et recalcule le budget.
 */
function handleItemUpdate(
    budgetType,
    itemType,
    itemId,
    updatedValues,
    inputElement = null,
    showError = true
) {
    if (
        !isKnownBudgetType(budgetType) ||
        !isKnownItemType(itemType)
    ) {
        return false;
    }

    const items =
        budgetsState[budgetType][itemType];

    const item =
        items.find(
            (currentItem) =>
                currentItem.id === itemId
        );

    if (!item) {
        return false;
    }

    const nextDescription =
        updatedValues.description !== undefined
            ? String(
                updatedValues.description
            ).trim()
            : item.description;

    const nextAmount =
        updatedValues.amount !== undefined
            ? Math.max(
                0,
                Utils.toNumber(
                    updatedValues.amount
                )
            )
            : item.amount;


    /* Validation du libellé */

    if (
        updatedValues.description !== undefined &&
        !Utils.isValidLabel(nextDescription)
    ) {
        if (inputElement) {
            inputElement.value =
                item.description;

            inputElement.classList.add(
                "input-error"
            );

            window.setTimeout(() => {
                inputElement.classList.remove(
                    "input-error"
                );
            }, 1000);
        }

        if (showError) {
            Utils.showNotification(
                "La description ne peut pas être vide.",
                "error"
            );
        }

        return false;
    }


    /* Mise à jour du stockage */

    const wasUpdated =
        StorageManager.updateItem(
            budgetType,
            itemType,
            itemId,
            {
                description:
                    nextDescription,

                amount:
                    nextAmount
            }
        );

    if (!wasUpdated) {
        if (showError) {
            Utils.showNotification(
                "La modification n'a pas été enregistrée.",
                "error"
            );
        }

        return false;
    }


    /* Mise à jour de l'état local */

    item.description =
        nextDescription;

    item.amount =
        nextAmount;

    if (
        inputElement &&
        inputElement.classList.contains(
            "budget-amount-input"
        ) &&
        document.activeElement !== inputElement
    ) {
        inputElement.value =
            nextAmount.toFixed(2);
    }

    updateBudgetSummary(budgetType);
    notifyApplicationUpdate();

    return true;
}


/* ==========================================================
   SUPPRESSION D'UNE LIGNE
   ========================================================== */

/**
 * Supprime une ligne du budget.
 */
function removeBudgetItem(
    budgetType,
    itemType,
    itemId
) {
    if (
        !isKnownBudgetType(budgetType) ||
        !isKnownItemType(itemType)
    ) {
        return;
    }

    const wasDeleted =
        StorageManager.deleteItem(
            budgetType,
            itemType,
            itemId
        );

    if (!wasDeleted) {
        Utils.showNotification(
            "Impossible de supprimer la ligne.",
            "error"
        );

        return;
    }

    budgetsState[budgetType][itemType] =
        budgetsState[budgetType][itemType]
            .filter(
                (item) =>
                    item.id !== itemId
            );

    renderBudget(budgetType);

    Utils.showNotification(
        "Ligne supprimée.",
        "success"
    );

    notifyApplicationUpdate();
}


/* ==========================================================
   CALCULS
   ========================================================== */

/**
 * Calcule les totaux d'un budget.
 */
function calculateBudgetTotals(
    budgetType
) {
    if (!isKnownBudgetType(budgetType)) {
        return {
            incomes: 0,
            expenses: 0,
            balance: 0
        };
    }

    const budget =
        budgetsState[budgetType];

    const incomes =
        Utils.calculateTotal(
            budget.incomes
        );

    const expenses =
        Utils.calculateTotal(
            budget.expenses
        );

    const balance =
        incomes - expenses;

    return {
        incomes,
        expenses,
        balance
    };
}


/* ==========================================================
   MISE À JOUR DU RÉSUMÉ
   ========================================================== */

/**
 * Met à jour les montants du résumé.
 */
function updateBudgetSummary(
    budgetType
) {
    if (!isKnownBudgetType(budgetType)) {
        return;
    }

    const config =
        BUDGET_CONFIG[budgetType];

    const totals =
        calculateBudgetTotals(
            budgetType
        );

    const incomeTotalElement =
        document.getElementById(
            config.incomeTotalId
        );

    const expenseTotalElement =
        document.getElementById(
            config.expenseTotalId
        );

    const balanceElement =
        document.getElementById(
            config.balanceId
        );

    if (incomeTotalElement) {
        incomeTotalElement.textContent =
            Utils.formatCurrency(
                totals.incomes
            );
    }

    if (expenseTotalElement) {
        expenseTotalElement.textContent =
            Utils.formatCurrency(
                totals.expenses
            );
    }

    if (balanceElement) {
        balanceElement.textContent =
            Utils.formatCurrency(
                totals.balance
            );

        applyAmountState(
            balanceElement,
            totals.balance
        );
    }
}


/**
 * Applique une classe positive, négative ou neutre.
 */
function applyAmountState(
    element,
    amount
) {
    if (!element) {
        return;
    }

    element.classList.remove(
        "positive",
        "negative"
    );

    if (amount > 0) {
        element.classList.add(
            "positive"
        );
    } else if (amount < 0) {
        element.classList.add(
            "negative"
        );
    }
}


/* ==========================================================
   RÉINITIALISATION
   ========================================================== */

/**
 * Réinitialise un budget complet.
 */
function resetBudgetData(
    budgetType
) {
    if (!isKnownBudgetType(budgetType)) {
        return false;
    }

    const wasReset =
        StorageManager.resetBudget(
            budgetType
        );

    if (!wasReset) {
        Utils.showNotification(
            "Impossible de réinitialiser le budget.",
            "error"
        );

        return false;
    }

    budgetsState[budgetType] = {
        incomes: [],
        expenses: []
    };

    renderBudget(budgetType);

    Utils.showNotification(
        "Budget réinitialisé.",
        "success"
    );

    notifyApplicationUpdate();

    return true;
}


/* ==========================================================
   ÉVÉNEMENTS DES BOUTONS
   ========================================================== */

/**
 * Connecte les boutons d'ajout.
 */
function initializeBudgetButtons() {
    Object.entries(
        BUDGET_CONFIG
    ).forEach(
        ([budgetType, config]) => {
            const addIncomeButton =
                document.getElementById(
                    config.addIncomeButtonId
                );

            const addExpenseButton =
                document.getElementById(
                    config.addExpenseButtonId
                );

            if (addIncomeButton) {
                addIncomeButton.addEventListener(
                    "click",
                    () => {
                        addBudgetItem(
                            budgetType,
                            "incomes"
                        );
                    }
                );
            }

            if (addExpenseButton) {
                addExpenseButton.addEventListener(
                    "click",
                    () => {
                        addBudgetItem(
                            budgetType,
                            "expenses"
                        );
                    }
                );
            }
        }
    );
}


/* ==========================================================
   COMMUNICATION ENTRE MODULES
   ========================================================== */

/**
 * Informe les autres fichiers qu'un budget a changé.
 */
function notifyApplicationUpdate() {
    document.dispatchEvent(
        new CustomEvent(
            "budget:updated",
            {
                detail: {
                    previsionnel:
                        calculateBudgetTotals(
                            "previsionnel"
                        ),

                    reel:
                        calculateBudgetTotals(
                            "reel"
                        )
                }
            }
        )
    );
}


/* ==========================================================
   VÉRIFICATIONS
   ========================================================== */

function isKnownBudgetType(
    budgetType
) {
    return (
        budgetType === "previsionnel" ||
        budgetType === "reel"
    );
}


function isKnownItemType(
    itemType
) {
    return (
        itemType === "incomes" ||
        itemType === "expenses"
    );
}


/* ==========================================================
   INITIALISATION
   ========================================================== */

/**
 * Initialise le module BudgetManager.
 */
function initializeBudgetManager() {
    loadBudgets();
    initializeBudgetButtons();
    renderAllBudgets();
    notifyApplicationUpdate();
}


/* ==========================================================
   EXPORT GLOBAL
   ========================================================== */

window.BudgetManager = {
    initialize:
        initializeBudgetManager,

    loadBudgets,
    reloadBudget,

    renderBudget,
    renderAllBudgets,

    addBudgetItem,
    removeBudgetItem,
    resetBudget:
        resetBudgetData,

    calculateBudgetTotals,
    updateBudgetSummary,

    getState() {
        return Utils.deepCopy(
            budgetsState
        );
    }
};
