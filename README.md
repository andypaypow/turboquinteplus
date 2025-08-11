# Application de Filtrage de Combinaisons de Chevaux (HTML, CSS, JS)

Bienvenue dans l'application de filtrage de combinaisons de chevaux, une solution moderne et futuriste conçue pour optimiser vos stratégies de jeux de type turf/loterie. Développée entièrement en HTML, CSS et JavaScript, cette application vise à réduire drastiquement le nombre de combinaisons possibles via des filtres dynamiques et une interface intuitive.

## 1. Contexte et Objectif

Cette application est dédiée à la génération et au filtrage de combinaisons de chevaux. Son objectif principal est de permettre aux utilisateurs de passer d'un grand nombre de combinaisons potentielles (par exemple, de 3003 à seulement 25) en appliquant des filtres intelligents et personnalisables, adaptés aux exigences des jeux de turf ou de loterie hippique.

## 2. Architecture Fonctionnelle

L'interface utilisateur est conçue pour être réactive et visuellement attrayante, intégrant les éléments clés suivants :

*   **Filtres Dynamiques :**
    *   Des boutons dédiés (Tri groupe, Pairs, Impairs, Consécutifs, Somme) permettent d'activer ou de désactiver les filtres d'un simple clic.
    *   L'activation d'un filtre affiche automatiquement des champs numériques `min/max` intelligents, pré-remplis avec des bornes calculées dynamiquement.
*   **Les curseurs sont des Champs Numériques Intelligents :**
    *   Ces champs `min` et `max` s'ajustent en temps réel en fonction des filtres actifs.
    *   La contrainte `Min ≤ Max` est toujours respectée, avec un ajustement automatique en cas de conflit pour garantir la cohérence.
*   **Zone de Combinaisons :**
    *   Affiche les combinaisons restantes après l'application des filtres.
    *   Intègre une zone de recherche intelligente pour les numéros.
    *   **Formatage Visuel :** Les grands nombres sont mis en évidence (entourés), les nombres pairs sont affichés en bleu, et les séquences consécutives sont soulignées pour une meilleure lisibilité.
    *   **Affichage Optimisé :** Les combinaisons sont présentées en colonnes intelligentes pour éviter les coupures, avec une barre de défilement verticale si nécessaire.
*   **Bouton Flottant de Compteur :**
    *   Un bouton flottant et déplaçable affiche le nombre actuel de combinaisons (ex: `3003/3003`).
    *   Un clic sur ce bouton révèle des statistiques détaillées, telles que les numéros les plus récurrents aux moins récurrents.
*   **Bouton Réinitialiser :**
    *   Permet de remettre à zéro tous les filtres et les sélections manuelles.
    *   Affiche un historique des filtres appliqués avant la réinitialisation pour un suivi clair.

## 3. Génération des Combinaisons Initiales

Contrairement aux versions précédentes, les combinaisons initiales ne sont plus générées à partir de pronostics spécifiques. Elles sont désormais créées à partir d'un ensemble universel de numéros (de 1 à "Nombre de partants" configuré). Ces combinaisons brutes alimentent ensuite le système de filtrage.

## 4. Filtres Détaillés

L'application propose une gamme complète de filtres pour un contrôle précis :

*   **Filtre Groupe (avec Saisie des Groupes de Référence) :**
    Il gère la saisie des données, leur analyse, pour afficher les groupes à filtrer.
* saisie simple des numeros separés par des espaces, virgules ou tirets 
* saisie multiples des groupes de combinaisons contenant du txte: L'utilisateur copie-colle une liste de texte dans une zone dédiée. Cette liste peut contenir à la fois des noms descriptifs et des combinaisons de numéros de 8 chevaux par groupe nommé.
 * Analyse automatique : , à l’interieur de ce filtre , analyse le texte pour distinguer les noms des combinaisons numériques. Pour chaque ligne, elle extrait la séquence de numéros tout en conservant ou en ignorant le titre des combinaisons.
 * Sélection par défaut : L'application identifie et sélectionne automatiquement toutes les combinaisons de 8 chevaux parmi celles saisies. 
 * Réduction initiale : L'utilisateur dispose de champs de numérotation pour entrer une valeur. Ce contrôle lui permet de choisir de garder un nombre minimum de numéros (par exemple, "au moins 2", "3", etc.) ou de supprimer un nombre maximum de numéros. Cette règle est ensuite appliquée à chaque combinaison individuellement (par exemple, la première combinaison garde 3 numéros, la deuxième en garde 3, etc.), réduisant ainsi la taille de la liste initiale.
    *   Possibilité d'ajouter un filtre de groupe supplémentaire via un petit bouton + discret.
*   **Filtre Pairs :**
    *   Curseur `Min/Max`.
    *   Garde ou supprime les combinaisons avec X chevaux pairs (X étant entre `min` et `max`).
    *   Synchronisé avec le filtre Impairs.
*   **Filtre Impairs :**
    *   Curseur `Min/Max`.
    *   Garde ou supprime les combinaisons avec X chevaux impairs (X étant entre `min` et `max`).
*   **Filtre Petits Numéros :**
    *   Curseur `Min/Max` avec une limite par défaut inférieure ou égale à 10.
    *   Garde ou supprime les combinaisons avec X petits numéros (numéros ≤ Limite). La limite est configurable.
    *   Synchronisé avec le filtre Grands Numéros.
*   **Filtre Grands Numéros :**
    *   Curseur `Min/Max` avec une limite liée à celle des Petits Numéros.
    *   Garde ou supprime les combinaisons avec X grands numéros (numéros > Limite).
*   **Filtre Consécutifs :**
    *   Curseur `Min/Max`.
    *   Garde ou supprime les combinaisons avec X séquences consécutives (ex: `[5,6,7]` = 3 consécutifs).
*   **Filtre Poids :**
    *   Curseur `Min/Max` avec configuration des poids.
    *   Garde ou supprime les combinaisons dont la somme des poids est entre `min` et `max`.
    *   Les poids sont personnalisables via une interface dédiée. Par défaut, le poids d'un cheval est son numéro (cheval 1 = poids 1).
    *   La séquence de référence des poids est visible et modifiable.
    *   Un petit bouton `+` discret permet d'ajouter un filtre de poids supplémentaire.

## 5. Mécanismes Clés

*   **Champs Numériques Intelligents - Adaptation Dynamique :**
    *   Les bornes `min` et `max` des champs numériques s'adaptent dynamiquement.
    *   **Exemple :** Pour une "Somme Numérique" avec 15 partants et une taille de combinaison de 4 : `Min = 1+2+3+4 = 10`, `Max = 12+13+14+15 = 54`. Si le filtre "Petits Numéros" (1-7) est activé, les bornes s'ajustent : `Min = 1+2+3+4 = 10`, `Max = 4+5+6+7 = 22`.
*   **Gestion des Conflits :**
    *   Si un filtre réduit les possibilités à zéro (ex: `somme min=50` mais filtre "Grands Numéros" désactivé), les champs numériques s'ajustent pour afficher les plages réelles.
    *   Si aucune combinaison n'est possible, les champs numériques sont grisés ou affichent un message d'erreur.
*   **Logique de Combinaisons - Génération :**
    *   La taille de combinaison est configurable de 3 à 10 chevaux.
    *   Le nombre total initial de combinaisons est calculé via `C(N, taille)` (ex: `C(15,4) = 1365`).
*   **Filtrage :**
    *   Les filtres s'appliquent avec une logique `ET` (tous les critères doivent être respectés).
    *   **Exemple :** Filtre "Pairs" `[2,2]` + "Poids" `[20,30]` + Taille=`4` → Seules les combinaisons avec 2 pairs et un poids entre 20 et 30 sont conservées.
*   **Séquence de Poids :**
    *   Par défaut, le poids d'un cheval est égal à son numéro.
    *   La personnalisation des poids est possible via une interface modale dédiée.
    *   L'impact sur la somme est direct : `Somme = Σ(poids_cheval_i)`. Si le cheval 1 a un poids de 100 et les autres un poids de 1, le calcul de la somme pour ce filtre en tiendra compte.

## 6. Flux Utilisateur Typique

1.  **Configuration Initiale :** Définir le "Nombre de partants" (entre 10 et 20) et la "Taille de la Combinaison" (entre 3 et 10). Cliquer sur "Générer les Combinaisons Initiales".
2.  **Activation des Filtres :** Cliquer sur "Tri Groupe" pour faire apparaître la zone de saisie des groupes de référence. Saisir ou importer les groupes, puis sélectionner ceux à utiliser. Cliquer sur "Pairs" (les chevaux pairs sont cochés), puis sur "Somme Numérique" (un champ numérique apparaît avec des bornes intelligentes).
3.  **Ajustement des Champs Numériques :** Modifier les champs numériques pour définir la plage souhaitée (ex: somme `[20,30]`).
4.  **Affichage des Résultats :** Les combinaisons restantes s'affichent dans la zone dédiée (ex: `25/1365`). Cliquer sur le bouton flottant pour accéder aux statistiques.
5.  **Export/Sauvegarde :** Exporter les combinaisons filtrées (CSV/JSON) ou sauvegarder la configuration actuelle.

## 7. Performance et Gestion des Données

*   **Rafraîchissement en Temps Réel :**
    *   Les combinaisons sont mises à jour instantanément lors de l'ajustement d'un champ numérique (un à la fois).
    *   L'application est optimisée pour gérer jusqu'à 50 combinaisons sans ralentissement (au-delà, une pagination peut être implémentée).
*   **Optimisation :**
    *   Les calculs sont optimisés pour éviter les redondances (ex: mise en cache des combinaisons de base).
    *   Les champs numériques intelligents ajustent dynamiquement les plages pour réduire la charge de calcul.

## 8. Cas d'Usage Avancés

*   **Filtres Incompatibles :**
    *   Si des filtres sont mutuellement exclusifs (ex: "Consécutifs" `[1,1]` + "Impairs" `[3,3]` → aucune combinaison possible), les curseurs sont grisés ou un message d'erreur est affiché.
*   **Changement de Taille de Combinaison :**
    *   Si la taille de combinaison passe de 4 à 6, le curseur "Somme" est recalculé (ex: `min=21, max=75`), et le compteur de combinaisons est mis à jour.
*   **Export :**
    *   Génère un fichier (CSV/JSON) contenant les combinaisons filtrées et les paramètres des filtres appliqués pour une analyse ultérieure.

## 9. Conclusion

Cette application, développée avec une approche moderne et futuriste en HTML, CSS et JavaScript, offre une solution puissante et flexible pour les turfistes exigeants. Ses points forts résident dans l'adaptabilité des curseurs aux contraintes, la priorité donnée à l'utilisateur (les sélections manuelles prévalent sur les filtres automatiques) et une performance en temps réel, garantissant une expérience fluide et efficace.
