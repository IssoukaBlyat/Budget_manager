# 💰 Budget Manager

Une application web moderne permettant de gérer un **budget mensuel prévisionnel** et un **budget réel**.

Le projet est développé en **HTML, CSS et JavaScript pur**, sans framework, afin d'être facilement hébergeable sur **GitHub Pages**.

---

# Aperçu

L'application permet de :

- 📊 Gérer un budget prévisionnel
- 💵 Gérer un budget réel
- ➕ Ajouter des revenus
- ➖ Ajouter des dépenses
- ✏️ Modifier les lignes directement
- ❌ Supprimer une ligne
- 📈 Comparer le prévisionnel avec le réel
- 💾 Sauvegarder automatiquement les données
- 🌙 Utiliser un mode sombre
- 📱 Fonctionner sur ordinateur, tablette et téléphone

---

# Fonctionnalités

## Tableau de bord

Le tableau de bord affiche :

- Solde prévisionnel
- Solde réel
- Différence entre les deux

---

## Budget prévisionnel

Pour chaque mois il est possible de :

- ajouter un revenu
- ajouter une dépense
- modifier une ligne
- supprimer une ligne

Le calcul est automatique.

---

## Budget réel

Même fonctionnement que le budget prévisionnel.

---

## Comparaison

Le tableau de comparaison affiche :

| Élément | Prévisionnel | Réel | Différence |
|----------|-------------:|------:|-----------:|
| Revenus | ✔ | ✔ | ✔ |
| Dépenses | ✔ | ✔ | ✔ |
| Solde | ✔ | ✔ | ✔ |

---

# Sauvegarde

Toutes les données sont enregistrées automatiquement dans le navigateur grâce à :

```
localStorage
```

Aucun compte utilisateur n'est nécessaire.

Aucune base de données n'est utilisée.

---

# Technologies

- HTML5
- CSS3
- JavaScript ES6
- LocalStorage

---

# Arborescence

```
budget-manager/

│
├── index.html
│
├── css/
│   ├── variables.css
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── utils.js
│   ├── storage.js
│   ├── budget.js
│   ├── compare.js
│   ├── ui.js
│   └── app.js
│
├── assets/
│   ├── images/
│   └── icons/
│
├── README.md
└── LICENSE
```

---

# Installation

Télécharger le projet :

```
git clone https://github.com/VOTRE-NOM/budget-manager.git
```

Puis ouvrir :

```
index.html
```

ou utiliser un serveur local.

Exemple :

```
Live Server
```

sous Visual Studio Code.

---

# Déploiement sur GitHub Pages

Créer un dépôt GitHub.

Exemple :

```
budget-manager
```

Ajouter tous les fichiers.

Faire un commit.

Aller dans :

```
Settings

↓

Pages
```

Choisir :

```
Deploy from a branch
```

Puis sélectionner :

```
Branch :

main

Folder :

/
```

GitHub génèrera automatiquement une adresse similaire à :

```
https://votre-utilisateur.github.io/budget-manager/
```

---

# Sauvegarde des données

Les données sont enregistrées dans :

```
localStorage
```

Changer de navigateur ou vider le cache supprimera les données.

Une future version permettra :

- export JSON
- import JSON
- export Excel
- export PDF

---

# Versions

## V1

- Budget prévisionnel
- Budget réel
- Comparaison
- Sauvegarde locale
- Mode sombre
- Responsive

---

## V2 (prévue)

- Plusieurs mois

- Historique

- Catégories

- Recherche

- Tri

- Graphiques

- Statistiques

---

## V3 (prévue)

- Export PDF

- Export Excel

- Import

- Objectifs d'épargne

- Alertes

---

## V4 (prévue)

- Comptes utilisateurs

- Synchronisation Cloud

- PWA

- Installation sur téléphone

- Notifications

---

# Compatibilité

Navigateurs supportés :

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari
- Opera

---

# Licence

Projet sous licence MIT.

Voir le fichier :

```
LICENSE
```

---

# Auteur

Projet réalisé avec l'aide de ChatGPT.

Libre de modification et d'utilisation.

---

# Remarques

Ce projet a été conçu pour être facilement évolutif.

L'ensemble du code est organisé en modules indépendants afin de faciliter l'ajout de nouvelles fonctionnalités sans devoir réécrire l'application.
