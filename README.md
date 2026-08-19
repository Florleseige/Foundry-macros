# Foundry-macros

Recueil de macros personnalisées pour [Foundry Virtual Tabletop](https://foundryvtt.com/).

La plupart des macros sont génériques et fonctionnent sur n'importe quel système de jeu. Certaines sont en revanche écrites pour un système précis (elles utilisent son API ou ses données internes) et ne fonctionneront donc que si ce système est installé et activé sur le monde Foundry.

## Compatibilité

- **FoundryVTT** : toutes les macros sont testées sur la version **v14 (build 364)**.
- **Knight** : les macros spécifiques à ce système sont testées avec la version **3.58.35**.

La version FoundryVTT (et, le cas échéant, la version du système) compatible est rappelée dans l'en-tête de chaque fichier `.js`.

## Organisation du dépôt

- [`foundry/`](foundry/) — macros génériques, indépendantes du système de jeu.
- [`knight/`](knight/) — macros spécifiques au système **Knight**.

## Installation

Dans Foundry, créer une nouvelle macro de type **Script**, puis copier-coller le contenu du fichier `.js` correspondant dans l'éditeur de la macro.

---

## Macros génériques (`foundry/`)

Ces macros n'utilisent que l'API de base de Foundry et fonctionnent quel que soit le système de jeu activé.

Compatibilité : **FoundryVTT v14 (build 364)**.

### [`1-ancre-zero.js`](foundry/1-ancre-zero.js) — Définir l'ancre des tuiles/dessins

Ouvre une fenêtre permettant de repositionner le point d'ancrage (X/Y, entre 0 et 1, `0,0` par défaut) des tuiles et/ou des dessins de la scène.
- Si des tuiles/dessins sont sélectionnés, seuls ceux-ci sont modifiés.
- Sinon, la macro s'applique à toutes les tuiles et tous les dessins de la scène active.
- Neuf préréglages rapides (coins, centres, milieu) en plus de la saisie manuelle de X/Y.
- Des cases à cocher permettent de cibler uniquement les tuiles, uniquement les dessins, ou les deux.

### [`2-redimensionner-tuiles.js`](foundry/2-redimensionner-tuiles.js) — Redimensionner les tuiles

Redimensionne les tuiles sélectionnées (ou toutes celles de la scène si rien n'est sélectionné), en conservant leur ratio largeur/hauteur. Trois méthodes au choix :
- à une **hauteur cible** en pixels ;
- à une **largeur cible** en pixels ;
- à un **pourcentage** de la taille actuelle (ex : 50 % pour réduire de moitié).

La taille d'origine de chaque tuile est sauvegardée dans un flag lors du premier redimensionnement. Le mode **« Restaurer la taille d'origine »** permet de rendre aux tuiles déjà redimensionnées leur taille d'origine (les tuiles jamais redimensionnées ne sont pas affectées), avec un décompte des tuiles concernées.

### [`3-etiquettes-tuiles.js`](foundry/3-etiquettes-tuiles.js) — Étiquettes de tuiles

Crée automatiquement un texte (sous forme de dessin) sous ou au-dessus de chaque tuile sélectionnée (ou toutes celles de la scène), reprenant le nom du fichier image utilisé comme texture.
- Personnalisation du texte : police, taille, couleur, hauteur de la zone.
- Placement au choix : sous la tuile ou au-dessus.
- Fond de couleur optionnel derrière le texte (couleur + opacité).
- Options de nettoyage du nom de fichier : ne garder que ce qui suit un caractère séparateur (`-` par défaut) et/ou retirer un numéro en fin de nom (utile pour des noms de fichiers du type `monstre-gobelin-03.webp` → `gobelin`).

### [`4-cacher-scene.js`](foundry/4-cacher-scene.js) — Cacher / afficher la scène

Cache ou affiche en masse les éléments de la scène active : tokens, dessins, tuiles et sources de lumière ambiante, avec un choix indépendant pour chaque catégorie via des cases à cocher.
- Pour les tokens, possibilité de cibler soit tous ceux de la scène, soit uniquement ceux actuellement sélectionnés sur le plateau.
- Pratique pour préparer une scène (tout cacher) puis la révéler progressivement, ou tout dévoiler d'un coup.

---

## Macros spécifiques à un système

### Knight

Système : [Knight (foundry-knight)](https://github.com/Zakarik/foundry-knight)

Ces macros utilisent l'API et les données du système Knight (`CONFIG.KNIGHT`, `game.knight`, etc.) et ne fonctionneront pas sur un autre système.

Compatibilité : **FoundryVTT v14 (build 364)** · **Knight v3.58.35**.

#### [`k1-jet-combo-groupe-2carac.js`](knight/k1-jet-combo-groupe-2carac.js) — Jet combo Knight (demande groupée MJ → Joueurs)

Permet au MJ de demander à plusieurs joueurs de lancer un jet combo (deux caractéristiques ou plus) en une seule action, chaque joueur recevant une fenêtre pour compléter et lancer son propre jet.

**Fonctionnement :**
1. **Chaque joueur** exécute la macro une fois en début de session (clic dans la barre de sorts) pour activer l'écoute des demandes du MJ sur son client. Un message discret est envoyé au MJ pour confirmer que l'écoute est active (l'écoute est perdue au rechargement de la page, il faut alors recliquer).
2. **Le MJ** sélectionne un ou plusieurs tokens de Chevaliers/Méta-armures, lance la macro, puis :
   - choisit une ou deux caractéristiques de base à proposer aux joueurs (une case à cocher permet d'en imposer une seule) ;
   - un tableau récapitule les personnages sélectionnés, leur(s) joueur(s) associé(s), et si la macro est bien active chez eux (avec la version) ;
   - choisit d'utiliser la **fenêtre de jet native de Knight** (recommandé : gère overdrives, capacités d'armure, styles de combat, entraide...) ou une **fenêtre simplifiée** autonome permettant d'ajouter une troisième caractéristique ;
   - peut activer la fermeture automatique de la fenêtre native après le jet, forcer un jet **sans overdrive** (équivalent du bouton « Sans OD » du système), et ajouter des dés bonus/malus, des succès bonus/malus, ou un seuil de difficulté ;
   - envoie la demande.
3. **Chaque joueur concerné** reçoit une fenêtre pour choisir sa caractéristique de base (si deux sont proposées), sa seconde caractéristique (et éventuellement une troisième), puis lance le jet.

La macro respecte la mécanique réelle du système Knight : les dés lancés correspondent à la somme des caractéristiques, et l'overdrive n'ajoute pas de dé mais des réussites automatiques (uniquement si le personnage est en armure ou en ascension).
