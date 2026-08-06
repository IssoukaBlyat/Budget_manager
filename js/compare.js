/* ==========================================================
   Budget Manager
   compare.js
   Comparaison entre le budget prévisionnel et le budget réel
   ========================================================== */

"use strict";


/* ==========================================================
   CONFIGURATION DES ÉLÉMENTS HTML
   ========================================================== */

const COMPARISON_ELEMENTS = {
    incomes: {
        previsionnel: "compare-income-previsionnel",
        reel: "compare-income-reel",
        difference: "compare-income-diff"
    },

    expenses: {
        previsionnel: "compare-expense-previsionnel",
        reel: "compare-expense-reel",
        difference: "compare-expense-diff"
    },

    balance: {
        previsionnel: "compare-solde-previsionnel",
        reel: "compare-solde-reel",
        difference: "compare-solde-diff"
    }
};


const DASHBOARD_ELEMENTS = {
    previsionnelBalance:
        "dashboard-previsionnel-solde",

    reelBalance:
        "dashboard-reel-solde",

    difference:
        "dashboard-ecart"
};


/* ==========================================================
   CALCUL DES ÉCARTS
   ========================================================== */

/**
 * Calcule les écarts entre les deux budgets.
 *
 * Les revenus et le solde sont calculés avec :
 * réel - prévisionnel
 *
 * Les dépenses sont calculées avec :
 * prévisionnel - réel
 *
 * Ainsi, un résultat positif pour les dépenses signifie
 * que les dépenses réelles sont inférieures aux prévisions.
 */
function calculateComparison(
    previsionnelTotals,
    reelTotals
) {
    return {
        incomes: {
            previsionnel:
                previsionnelTotals.incomes,

            reel:
                reelTotals.incomes,

            difference:
                reelTotals.incomes -
                previsionnelTotals.incomes
        },

        expenses: {
            previsionnel:
                previsionnelTotals.expenses,

            reel:
                reelTotals.expenses,

            difference:
                previsionnelTotals.expenses -
                reelTotals.expenses
        },

        balance: {
            previsionnel:
                previsionnelTotals.balance,

            reel:
                reelTotals.balance,

            difference:
                reelTotals.balance -
                previsionnelTotals.balance
        }
    };
}


/* ==========================================================
   RÉCUPÉRATION DES TOTAUX
   ========================================================== */

/**
 * Récupère les totaux actuels depuis BudgetManager.
 */
function getCurrentComparison() {
    const previsionnelTotals =
        BudgetManager.calculateBudgetTotals(
            "previsionnel"
        );

    const reelTotals =
        BudgetManager.calculateBudgetTotals(
            "reel"
        );

    return calculateComparison(
        previsionnelTotals,
        reelTotals
    );
}


/* ==========================================================
   MISE À JOUR DU TABLEAU DE COMPARAISON
   ========================================================== */

/**
 * Met à jour une ligne du tableau.
 */
function updateComparisonRow(
    rowType,
    values
) {
    const config =
        COMPARISON_ELEMENTS[rowType];

    if (!config) {
        return;
    }

    const previsionnelElement =
        document.getElementById(
            config.previsionnel
        );

    const reelElement =
        document.getElementById(
            config.reel
        );

    const differenceElement =
        document.getElementById(
            config.difference
        );

    if (previsionnelElement) {
        previsionnelElement.textContent =
            Utils.formatCurrency(
                values.previsionnel
            );

        applyComparisonState(
            previsionnelElement,
            values.previsionnel
        );
    }

    if (reelElement) {
        reelElement.textContent =
            Utils.formatCurrency(
                values.reel
            );

        applyComparisonState(
            reelElement,
            values.reel
        );
    }

    if (differenceElement) {
        differenceElement.textContent =
            formatDifference(
                values.difference
            );

        applyComparisonState(
            differenceElement,
            values.difference
        );
    }
}


/**
 * Met à jour le tableau de comparaison complet.
 */
function updateComparisonTable(
    comparison = null
) {
    const currentComparison =
        comparison ||
        getCurrentComparison();

    updateComparisonRow(
        "incomes",
        currentComparison.incomes
    );

    updateComparisonRow(
        "expenses",
        currentComparison.expenses
    );

    updateComparisonRow(
        "balance",
        currentComparison.balance
    );
}


/* ==========================================================
   MISE À JOUR DU TABLEAU DE BORD
   ========================================================== */

/**
 * Met à jour les trois cartes du tableau de bord.
 */
function updateDashboard(
    comparison = null
) {
    const currentComparison =
        comparison ||
        getCurrentComparison();

    const previsionnelElement =
        document.getElementById(
            DASHBOARD_ELEMENTS
                .previsionnelBalance
        );

    const reelElement =
        document.getElementById(
            DASHBOARD_ELEMENTS
                .reelBalance
        );

    const differenceElement =
        document.getElementById(
            DASHBOARD_ELEMENTS
                .difference
        );

    const previsionnelBalance =
        currentComparison
            .balance
            .previsionnel;

    const reelBalance =
        currentComparison
            .balance
            .reel;

    const difference =
        currentComparison
            .balance
            .difference;

    if (previsionnelElement) {
        previsionnelElement.textContent =
            Utils.formatCurrency(
                previsionnelBalance
            );

        applyComparisonState(
            previsionnelElement,
            previsionnelBalance
        );
    }

    if (reelElement) {
        reelElement.textContent =
            Utils.formatCurrency(
                reelBalance
            );

        applyComparisonState(
            reelElement,
            reelBalance
        );
    }

    if (differenceElement) {
        differenceElement.textContent =
            formatDifference(
                difference
            );

        applyComparisonState(
            differenceElement,
            difference
        );
    }
}


/* ==========================================================
   ÉTATS VISUELS
   ========================================================== */

/**
 * Ajoute une classe positive ou négative selon le montant.
 */
function applyComparisonState(
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


/**
 * Affiche explicitement le signe positif d'un écart.
 *
 * Exemple :
 * 150 devient "+150,00 €"
 * -50 devient "-50,00 €"
 */
function formatDifference(value) {
    const amount =
        Utils.toNumber(value);

    if (amount > 0) {
        return `+${Utils.formatCurrency(amount)}`;
    }

    return Utils.formatCurrency(amount);
}


/* ==========================================================
   MESSAGE D'INTERPRÉTATION
   ========================================================== */

/**
 * Retourne une interprétation textuelle de la comparaison.
 * Cette fonction pourra servir dans une future version.
 */
function getComparisonMessage(
    comparison = null
) {
    const currentComparison =
        comparison ||
        getCurrentComparison();

    const balanceDifference =
        currentComparison
            .balance
            .difference;

    if (balanceDifference > 0) {
        return (
            "Votre solde réel est supérieur " +
            "à votre solde prévisionnel."
        );
    }

    if (balanceDifference < 0) {
        return (
            "Votre solde réel est inférieur " +
            "à votre solde prévisionnel."
        );
    }

    return (
        "Votre solde réel correspond " +
        "exactement à votre prévision."
    );
}


/* ==========================================================
   ACTUALISATION GÉNÉRALE
   ========================================================== */

/**
 * Actualise le tableau de comparaison
 * et le tableau de bord.
 */
function refreshComparison() {
    const comparison =
        getCurrentComparison();

    updateComparisonTable(
        comparison
    );

    updateDashboard(
        comparison
    );

    return comparison;
}


/* ==========================================================
   ÉCOUTE DES MODIFICATIONS
   ========================================================== */

/**
 * Réagit à l'événement envoyé par budget.js.
 */
function handleBudgetUpdated(event) {
    if (
        event.detail?.previsionnel &&
        event.detail?.reel
    ) {
        const comparison =
            calculateComparison(
                event.detail.previsionnel,
                event.detail.reel
            );

        updateComparisonTable(
            comparison
        );

        updateDashboard(
            comparison
        );

        return;
    }

    refreshComparison();
}


/* ==========================================================
   INITIALISATION
   ========================================================== */

/**
 * Initialise le module de comparaison.
 */
function initializeComparisonManager() {
    document.addEventListener(
        "budget:updated",
        handleBudgetUpdated
    );

    refreshComparison();
}


/* ==========================================================
   EXPORT GLOBAL
   ========================================================== */

window.ComparisonManager = {
    initialize:
        initializeComparisonManager,

    calculateComparison,
    getCurrentComparison,

    updateComparisonTable,
    updateDashboard,

    refresh:
        refreshComparison,

    getMessage:
        getComparisonMessage
};
