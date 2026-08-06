/* ==========================================================
   Budget Manager
   utils.js
   Fonctions utilitaires communes
   ========================================================== */

"use strict";

/* ==========================================================
   FORMATAGE DES MONTANTS
   ========================================================== */

/**
 * Formate un nombre au format euro français.
 * Exemple : 1234.5 -> "1 234,50 €"
 */
function formatCurrency(value) {
    const amount = Number(value) || 0;

    return amount.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Convertit une valeur utilisateur en nombre.
 */
function toNumber(value) {

    if (value === null || value === undefined)
        return 0;

    if (typeof value === "number")
        return value;

    const normalized = String(value)
        .replace(/\s/g, "")
        .replace(",", ".");

    const number = parseFloat(normalized);

    return isNaN(number) ? 0 : number;

}


/* ==========================================================
   IDENTIFIANTS
   ========================================================== */

/**
 * Génère un identifiant unique.
 */
function generateId() {

    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 9)
    );

}


/* ==========================================================
   DATE
   ========================================================== */

function getCurrentDate() {

    return new Date().toLocaleDateString("fr-FR", {

        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"

    });

}


/* ==========================================================
   CALCULS
   ========================================================== */

function calculateTotal(items) {

    if (!Array.isArray(items))
        return 0;

    return items.reduce((total, item) => {

        return total + toNumber(item.amount);

    }, 0);

}


function calculateBalance(incomes, expenses) {

    return calculateTotal(incomes) - calculateTotal(expenses);

}


/* ==========================================================
   VALIDATION
   ========================================================== */

function isValidLabel(text) {

    return typeof text === "string"
        && text.trim().length > 0;

}


function isValidAmount(amount) {

    return !isNaN(toNumber(amount));

}


/* ==========================================================
   DOM
   ========================================================== */

function $(selector) {

    return document.querySelector(selector);

}


function $$(selector) {

    return document.querySelectorAll(selector);

}


function clearElement(element) {

    while (element.firstChild) {

        element.removeChild(element.firstChild);

    }

}


/* ==========================================================
   CREATION D'ELEMENTS
   ========================================================== */

function createElement(tag, className = "", text = "") {

    const element = document.createElement(tag);

    if (className)
        element.className = className;

    if (text)
        element.textContent = text;

    return element;

}


/* ==========================================================
   CLONAGE
   ========================================================== */

function deepCopy(object) {

    return JSON.parse(JSON.stringify(object));

}


/* ==========================================================
   TRI
   ========================================================== */

function sortAlphabetically(array) {

    return [...array].sort((a, b) =>

        a.description.localeCompare(
            b.description,
            "fr"
        )

    );

}


/* ==========================================================
   MESSAGES
   ========================================================== */

function showNotification(message, type = "success") {

    const old = document.querySelector(".notification");

    if (old)
        old.remove();

    const notification = createElement(
        "div",
        `notification ${type}`,
        message
    );

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.remove();

    }, 3000);

}


/* ==========================================================
   EXPORT GLOBAL
   ========================================================== */

window.Utils = {

    formatCurrency,
    toNumber,

    generateId,

    getCurrentDate,

    calculateTotal,
    calculateBalance,

    isValidLabel,
    isValidAmount,

    clearElement,

    createElement,

    deepCopy,

    sortAlphabetically,

    showNotification,

    $,
    $$

};
