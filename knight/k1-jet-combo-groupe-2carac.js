// =============================================================================
// Macro : Jet combo Knight — demande groupée MJ -> Joueurs
// Version : 1.18.0  (2026-08-20)
// Auteur  : Florleseige
// Système : Knight (foundry-knight)
// Compatibilité : FoundryVTT v14 (build 364) · Système Knight v3.58.35
// =============================================================================
//
// USAGE :
// - Chaque joueur exécute cette macro UNE FOIS par chargement de page (clic dans
//   la barre de sorts) pour activer l'écoute des demandes sur son client.
//   L'écoute est perdue s'il recharge sa page : il doit alors recliquer.
// - Le MJ sélectionne un ou plusieurs tokens de PJ, exécute la macro, choisit le
//   ou les caractéristiques de base proposées + les options, puis envoie.
// - Chaque joueur concerné reçoit une fenêtre lui demandant de compléter le jet.
//
// ENTRETIEN AUTOMATIQUE DES CLIENTS (depuis la v1.18) :
// - À chaque exécution par le MJ, la macro interroge les clients puis :
//     * joueur à l'écoute en version ANTÉRIEURE -> son client ré-exécute la macro
//       tout seul et repart sur la version du MJ. Aucun clic, rien à annoncer.
//     * joueur qui n'a PAS lancé la macro -> aucun code à nous ne tourne chez lui,
//       il est donc IMPOSSIBLE de l'atteindre. Il reçoit un message chuchoté avec
//       un lien cliquable qui active tout en un clic.
// - Le MJ peut donc lancer la macro SANS token sélectionné : la mise à jour et les
//   invitations sont faites, puis la macro s'arrête simplement.
// - Exception unique : les clients restés en version < 1.18 ne connaissent pas le
//   message de mise à jour. Ils passent par le lien chuchoté, une dernière fois.
//
// OPTIONS MJ :
// - 1 ou 2 caractéristiques de base : en imposer une, ou en proposer deux au choix.
// - Fenêtre native de Knight (recommandé) ou fenêtre simplifiée autonome.
// - Fermeture automatique de la fenêtre native après le jet.
// - Jet sans overdrive (équivaut au bouton « Sans OD » du système).
// - Troisième caractéristique autorisée (fenêtre simplifiée uniquement).
// - Dés bonus/malus (D6 ajoutés) et succès bonus/malus (réussites auto), séparés.
// - Seuil de difficulté.
//
// RAPPEL DE LA MÉCANIQUE (cf. roll-dialog.mjs / roll.mjs du système) :
//   dés lancés   = somme des caracteristiques.value  (SANS overdrive)
//   total du jet = nombre de dés pairs + somme des overdrive.value
//   -> l'Overdrive n'est PAS un dé de plus, mais une réussite AUTOMATIQUE,
//      appliquée seulement si wear vaut 'armure' ou 'ascension'.
//
// -----------------------------------------------------------------------------
// HISTORIQUE
// -----------------------------------------------------------------------------
// v1.18.0 - Les joueurs n'ont plus à relancer la macro après une mise à jour :
//           quand le MJ l'exécute, les clients à l'écoute en version antérieure
//           ré-exécutent la macro d'eux-mêmes (message socket à identifiant stable
//           + Macro#execute), et repartent donc sur le code du monde, c'est-à-dire
//           celui du MJ. Les joueurs qui n'ont jamais lancé la macro — hors de
//           portée par nature — reçoivent un lien cliquable chuchoté dans le chat
//           qui l'active en un clic. Le registre des clients est vidé avant chaque
//           interrogation : un joueur ayant rechargé sa page n'est plus affiché à
//           tort comme « à l'écoute ».
// v1.17.0 - Le message affiche les d6 lors du choix de la caractéristique.
// v1.16.0 - Ajout des versions compatibles (FoundryVTT et système Knight) dans
//           l'en-tête.
// v1.15.0 - CORRECTIF : relancer la macro après une mise à jour remplace bien
//           l'écouteur de l'ancienne version (auparavant le garde-fou anti-doublon
//           empêchait l'enregistrement du nouveau). Le type de message de requête
//           est désormais lié à la version, donc un client resté en version
//           antérieure n'ouvre plus de fenêtre obsolète. Avertissement à l'envoi
//           si un joueur ciblé est en version périmée.
// v1.14.0 - Refonte graphique de la fenêtre MJ : contenu réparti en 4 sections
//           encadrées avec titres, pastilles colorées pour l'état des macros,
//           champs stylisés, survol des lignes et des cases à cocher.
// v1.13.0 - Option MJ « Fermer la fenêtre de jet après le lancer » (le système
//           n'en propose pas : il ré-affiche la fenêtre après le jet). Détection
//           via le hook createChatMessage, avec filet de sécurité.
// v1.12.0 - Le joueur annonce dans le chat (chuchoté au MJ) qu'il a lancé la
//           macro. Nouvelle colonne « Macro » dans le tableau MJ indiquant si
//           chaque joueur est à l'écoute et en quelle version (ping/pong socket).
// v1.11.0 - Personnages sélectionnés affichés dans un tableau (Personnage /
//           Joueur), avec signalement des joueurs hors ligne ou non assignés.
//           Séparateurs ajoutés après la liste et avant les boutons.
// v1.10.0 - Renommage « Trait » -> « Caractéristique » dans toute l'interface.
//           Les 2 caractéristiques de base du MJ sont sur une même ligne.
//           Fenêtre joueur refondue : cartes cliquables côte à côte, agrandie
//           (520px), AUCUNE présélection pour forcer un choix explicite.
// v1.9.0 - Dés bonus, succès bonus et seuil regroupés sur une seule ligne
//          (3 colonnes) pour réduire la hauteur de la fenêtre MJ.
// v1.8.0 - Fenêtre MJ élargie (780px) et lisibilité renforcée : polices et
//          champs agrandis, espacements et interlignes augmentés.
// v1.7.0 - Fenêtre MJ agrandie (620px, redimensionnable) et mise en page aérée
//          pour une meilleure lisibilité. Correction : la constante VERSION
//          affichée dans le titre était restée à 1.5.0.
// v1.6.0 - Dés bonus et succès bonus séparés en deux champs distincts dans la
//          fenêtre MJ (auparavant seuls les dés bonus existaient). En mode natif,
//          transmis via 'modificateur' et 'succesbonus'.
// v1.5.0 - Option MJ « Jet sans overdrive » (pré-active le bouton natif « Sans OD »
//          en mode natif ; retire les OD du calcul et de l'affichage en mode
//          simplifié). Statut « sans OD » signalé dans le chat.
// v1.4.0 - Second trait de base rendu optionnel (le MJ peut imposer une seule
//          caractéristique). Ajout du mode « fenêtre de jet native de Knight ».
// v1.3.0 - CORRECTIF majeur : l'overdrive était ajouté aux dés au lieu d'être
//          compté en réussites automatiques. Affichage des scores au format
//          « A+B ». Ajout du statut en/hors armure dans le message de chat.
// v1.2.0 - Liste des personnages sélectionnés affichée en puces.
// v1.1.0 - Deux traits de base proposés au choix + troisième trait optionnel.
// v1.0.0 - Version initiale : demande groupée par socket, le MJ envoie la base,
//          chaque joueur choisit son second trait.
// =============================================================================

// Foundry exécute le script d'une macro avec `this` lié au document Macro
// (Macro##executeScript : fn.call(this, ...)). On le capture ici pour pouvoir
// construire un lien cliquable vers nous-mêmes et demander une ré-exécution.
// Test par documentName plutôt que `instanceof Macro` : la classe globale a changé
// de place au fil des versions de Foundry, pas le nom du document.
const MACRO_SELF = this?.documentName === "Macro" ? this : null;

(async () => {

  const VERSION = "1.18.0";

  if (game.system.id !== "knight") {
    ui.notifications.error("Cette macro est prévue pour le système Knight.");
    return;
  }

  // Posé par la version précédente juste avant une ré-exécution automatique :
  // la mise à jour est alors silencieuse (pas d'annonce dans le chat).
  const silentReload = !!game.knight?._comboSilentReload;
  if (game.knight) delete game.knight._comboSilentReload;

  const ASPECTS = CONFIG.KNIGHT.LIST.aspects;
  const CARACS_BY_ASPECT = CONFIG.KNIGHT.LIST.caracteristiques;
  const LABELS = CONFIG.KNIGHT.LIST.aspectsCaracteristiques;
  const PJ_TYPES = ["knight", "mechaarmure"];
  const SOCKET_CHANNEL = "system.knight";

  // Le type de REQUÊTE est lié à la version : un client resté sur une ancienne
  // version n'y répondra pas (au lieu d'ouvrir une fenêtre obsolète en doublon).
  const MSG_TYPE = `knight-combo-macro-request-v${VERSION}`;

  // Ces identifiants restent STABLES entre versions : c'est ce qui permet au MJ de
  // parler aux clients restés en version antérieure, donc de les détecter ET de les
  // mettre à jour. Ne JAMAIS y introduire le numéro de version.
  const MSG_PING = "knight-combo-macro-ping";       // MJ -> tous : « qui est à l'écoute ? »
  const MSG_PONG = "knight-combo-macro-pong";       // client -> MJ : « je suis à l'écoute, en vX »
  const MSG_RELOAD = "knight-combo-macro-reload";   // MJ -> client périmé : « ré-exécute la macro »

  // Le code de la macro vit dans le monde : dès que le MJ l'enregistre, tous les
  // clients en ont déjà la nouvelle version. Seul leur écouteur EN COURS est périmé.
  // Une simple ré-exécution suffit donc à les remettre à niveau.
  const RELOAD_COOLDOWN_MS = 5 * 1000;        // anti-boucle sur les ré-exécutions
  const INVITE_COOLDOWN_MS = 10 * 60 * 1000;  // anti-spam sur les invitations en chat

  const label = (key) => game.i18n.localize(LABELS[key] ?? key);

  // IMPORTANT — mécanique réelle du système (cf. roll-dialog.mjs / roll.mjs) :
  //   dés lancés      = somme des caracteristiques.value   (SANS overdrive)
  //   total du jet    = nombre de dés pairs + somme des overdrive.value
  // L'Overdrive n'est donc PAS un dé supplémentaire, mais un bonus de RÉUSSITES
  // AUTOMATIQUES, appliqué uniquement si la méta-armure est portée.

  // Nombre de dés apporté par un trait (jamais l'overdrive).
  function traitDice(actor, key) {
    const [type, a, c] = key.split(":");

    if (type === "carac") {
      return Number(actor.system.aspects?.[a]?.caracteristiques?.[c]?.value) || 0;
    }

    return Number(actor.system.aspects?.[a]?.value) || 0;
  }

  // Réussites automatiques apportées par un trait.
  // - PJ : overdrive de la caractéristique, seulement en méta-armure.
  // - PNJ/Créature/IA : aspects exceptionnels mineur + majeur.
  // noOd : le MJ a demandé un jet sans overdrive (équivalent du bouton natif "Sans OD").
  function traitOD(actor, key, noOd = false) {
    if (noOd) return 0;

    const [type, a, c] = key.split(":");

    if (type === "carac") {
      if (!isArmed(actor)) return 0;
      return Number(actor.system.aspects?.[a]?.caracteristiques?.[c]?.overdrive?.value) || 0;
    }

    const ae = actor.system.aspects?.[a]?.ae;
    return (Number(ae?.mineur?.value) || 0) + (Number(ae?.majeur?.value) || 0);
  }

  // Statut d'armure. Reprend la logique du système : wear vaut 'armure' ou 'ascension'.
  function isArmed(actor) {
    const wear = actor.system?.wear ?? "";
    return wear === "armure" || wear === "ascension";
  }

  // Affichage d'un trait sous la forme "A+B" (valeur + overdrive) ou "A" seul.
  function traitDisplay(actor, key, noOd = false) {
    const dice = traitDice(actor, key);
    const od = traitOD(actor, key, noOd);
    return od > 0 ? `${dice}d6+${od}` : `${dice}d6`;
  }

  function traitLabel(key) {
    const [type, a, c] = key.split(":");
    return type === "carac" ? label(c) : label(a);
  }

  // Liste d'options <option>/<optgroup>, en excluant certaines clés déjà choisies.
  // Si un acteur est fourni, affiche le score sous la forme "A+B" (valeur + overdrive).
  function traitOptionsHtml(actor, excludeKeys = [], noOd = false) {
    const hasCarac = actor ? PJ_TYPES.includes(actor.type) : true;
    let opts = "";

    for (const asp of ASPECTS) {
      const aspLabel = label(asp);

      if (hasCarac) {
        let groupOpts = "";
        for (const c of CARACS_BY_ASPECT[asp]) {
          const key = `carac:${asp}:${c}`;
          if (excludeKeys.includes(key)) continue;
          const suffix = actor ? ` (${traitDisplay(actor, key, noOd)})` : "";
          groupOpts += `<option value="${key}">${label(c)}${suffix}</option>`;
        }
        if (groupOpts) opts += `<optgroup label="${aspLabel}">${groupOpts}</optgroup>`;
      } else {
        const key = `aspect:${asp}`;
        if (excludeKeys.includes(key)) continue;
        const suffix = actor ? ` (${traitDisplay(actor, key, noOd)})` : "";
        opts += `<option value="${key}">${aspLabel}${suffix}</option>`;
      }
    }

    return opts;
  }

  // Lance les dés et poste le résultat dans le chat.
  // traits : [{ label, dice, od }] — dice = D6 lancés, od = réussites automatiques.
  async function rollAndPost({ actor, traits, extraDice, bonusSucces, seuil, armed, noOd }) {
    extraDice = Number(extraDice) || 0;
    bonusSucces = Number(bonusSucces) || 0;

    const sumDice = traits.reduce((acc, t) => acc + t.dice, 0);
    const sumOD = traits.reduce((acc, t) => acc + t.od, 0);
    const totalDice = Math.max(sumDice + extraDice, 0);

    if (totalDice <= 0) {
      ui.notifications.warn("Aucun dé à lancer (total à 0 ou moins).");
      return;
    }

    const roll = new Roll(`${totalDice}d6`);
    await roll.evaluate();

    const results = roll.terms[0].results.map(r => r.result);
    const pairs = results.filter(r => r % 2 === 0).length;
    const echecs = results.length - pairs;
    const successes = pairs + sumOD + bonusSucces; // pairs + overdrives + succès bonus

    const diceHtml = results.map(r => `
      <span style="display:inline-block;min-width:26px;height:26px;line-height:26px;
        text-align:center;border-radius:4px;margin:2px;font-weight:bold;color:#fff;
        background:${r % 2 === 0 ? "#2e7d32" : "#8a2e2e"};">${r}</span>
    `).join("");

    let seuilHtml = "";
    if (seuil !== null && seuil !== undefined) {
      const marge = successes - seuil;
      const verdict = marge >= 0
        ? `<span style="color:#2e7d32;">Réussite (marge +${marge})</span>`
        : `<span style="color:#8a2e2e;">Échec (manque ${Math.abs(marge)})</span>`;
      seuilHtml = `<p style="margin:2px 0;">Seuil : <b>${seuil}</b> — ${verdict}</p>`;
    }

    const extraText = extraDice !== 0
      ? (extraDice > 0 ? ` + ${extraDice}` : ` - ${Math.abs(extraDice)}`)
      : "";

    // Détail du combo : "Force (6+2) + Combat (4)"
    const comboLabel = traits
      .map(t => `${t.label} (${t.od > 0 ? `${t.dice}+${t.od}` : t.dice})`)
      .join(" + ");

    const armureHtml = armed !== undefined
      ? `<p style="margin:2px 0;">${armed
          ? (noOd
              ? "🛡️ <b>En méta-armure</b> — ⛔ jet <b>sans overdrive</b> (imposé par le MJ)"
              : "🛡️ <b>En méta-armure</b> — overdrives appliqués")
          : "👤 <b>Hors armure</b> (tenue civile) — pas d'overdrive"}</p>`
      : (noOd ? `<p style="margin:2px 0;">⛔ Jet <b>sans overdrive</b> (imposé par le MJ)</p>` : "");

    const odHtml = sumOD > 0
      ? `<p style="margin:2px 0;">Overdrive : <b>+${sumOD}</b> réussite(s) automatique(s)</p>`
      : "";

    const bonusHtml = bonusSucces !== 0
      ? `<p style="margin:2px 0;">Succès bonus : <b>${bonusSucces > 0 ? "+" : ""}${bonusSucces}</b></p>`
      : "";

    // Détail du calcul : "4 dé(s) pair(s) + 3 overdrive − 1 succès"
    let detail = `${pairs} dé(s) pair(s)`;
    if (sumOD > 0) detail += ` + ${sumOD} overdrive`;
    if (bonusSucces > 0) detail += ` + ${bonusSucces} succès bonus`;
    else if (bonusSucces < 0) detail += ` − ${Math.abs(bonusSucces)} succès`;

    const hasDetail = sumOD > 0 || bonusSucces !== 0;

    const totalHtml = hasDetail
      ? `<p style="margin:2px 0;"><b>${successes}</b> réussite(s) au total <span style="opacity:0.75;">(${detail})</span> / ${echecs} échec(s)</p>`
      : `<p style="margin:2px 0;"><b>${successes}</b> réussite(s) / ${echecs} échec(s)</p>`;

    const content = `
      <div class="knight-combo-roll">
        <h3 style="margin-bottom:2px;">${comboLabel}</h3>
        ${armureHtml}
        <p style="margin:2px 0;">${totalDice}D6 &nbsp;(${traits.map(t => t.dice).join(" + ")}${extraText})</p>
        <div style="margin:4px 0;">${diceHtml}</div>
        ${odHtml}
        ${bonusHtml}
        ${totalHtml}
        ${seuilHtml}
      </div>
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      rolls: [roll],
      sound: CONFIG.sounds.dice,
      content
    });
  }

  // Ouvre la fenêtre de jet NATIVE du système Knight, avec la base présélectionnée.
  // Avantage : tous les calculs du système s'appliquent (overdrives, capacités
  // d'armure, styles de combat, effets, coûts d'espoir/énergie, entraide...).
  function openNativeKnightDialog(actor, baseKey, data) {
    const [, , carac] = baseKey.split(":");
    const rollId = data.tokenId && canvas.tokens.get(data.tokenId) ? data.tokenId : actor.id;

    const dialog = new game.knight.applications.KnightRollDialog(rollId, {
      label: data.label || "Jet demandé par le MJ",
      base: carac,
      difficulte: data.seuil ?? 0,
      modificateur: data.extraDice ?? 0,
      // ATTENTION : le constructeur du système lit bien 'succesbonus' en minuscules
      // (roll-dialog.mjs ligne 23 : succesBonus:data?.succesbonus ?? 0).
      succesbonus: data.bonusSucces ?? 0,
      // Pré-active le bouton natif "Sans OD" du système si le MJ l'a demandé.
      btn: data.noOd ? { nood: true } : {}
    });

    dialog.open ? dialog.open() : dialog.render(true);

    // Fermeture automatique après le jet (le système ne propose pas cette option :
    // roll-dialog.mjs fait this.render(true) après le lancer, la fenêtre reste ouverte).
    // On surveille donc l'arrivée du message de chat produit par ce jet.
    if (!data.autoClose) return;

    let hookId = null;
    let timer = null;

    const cleanup = () => {
      if (hookId !== null) Hooks.off("createChatMessage", hookId);
      if (timer !== null) clearTimeout(timer);
    };

    hookId = Hooks.on("createChatMessage", (msg) => {
      // Seulement les messages émis par ce client...
      const authorId = msg.author?.id ?? msg.user?.id;
      if (authorId !== game.user.id) return;

      // ...et concernant bien cet acteur.
      const speakerActor = msg.speaker?.actor;
      if (speakerActor && speakerActor !== actor.id) return;

      cleanup();

      // Léger délai : le système ré-affiche la fenêtre juste après avoir lancé le jet.
      setTimeout(() => {
        try { dialog.close(); } catch (e) { /* déjà fermée */ }
      }, 200);
    });

    // Filet de sécurité : on retire le hook si aucun jet n'est fait (fenêtre abandonnée).
    timer = setTimeout(cleanup, 15 * 60 * 1000);
  }

  // Fenêtre affichée chez le joueur qui reçoit la demande.
  async function openPlayerDialog(data) {
    const actor = await fromUuid(data.actorUuid);
    if (!actor) return;

    const armed = isArmed(actor);
    const hasTwoBases = !!data.base2Key;

    // --- Mode fenêtre native du système ---
    if (data.useNative) {
      // Une seule base imposée : on ouvre directement la fenêtre de Knight.
      if (!hasTwoBases) {
        openNativeKnightDialog(actor, data.base1Key, data);
        return;
      }

      // Deux bases proposées : choix préalable, puis fenêtre native.
      new Dialog({
        title: `Jet demandé : ${actor.name}`,
        content: `
          <style>
            .knight-choice { font-size: 15px; line-height: 1.5; text-align: center; }
            .knight-choice .intro { margin: 0 0 4px 0; font-size: 16px; }
            .knight-choice .status { margin: 0 0 14px 0; font-size: 13px; opacity: 0.8; }
            .knight-choice .cards { display: flex; gap: 14px; align-items: stretch; }
            .knight-choice .card { flex: 1 1 0; min-width: 0; cursor: pointer;
              border: 2px solid rgba(120,120,120,0.45); border-radius: 8px;
              padding: 14px 10px; background: rgba(255,255,255,0.06);
              transition: border-color 0.15s, background 0.15s, transform 0.1s; }
            .knight-choice .card:hover { border-color: #7a6a3a;
              background: rgba(200,170,90,0.16); transform: translateY(-2px); }
            .knight-choice .card.selected { border-color: #b08d3f;
              background: rgba(200,170,90,0.28); box-shadow: 0 0 8px rgba(176,141,63,0.5); }
            .knight-choice .card .name { font-size: 17px; font-weight: 700;
              margin-bottom: 6px; }
            .knight-choice .card .score { font-size: 24px; font-weight: 700;
              font-family: monospace; }
            .knight-choice .card .od { display: block; font-size: 12px;
              opacity: 0.75; font-weight: normal; margin-top: 4px; }
            .knight-choice .card input { display: none; }
            .knight-choice .footer { margin: 16px 0 0 0; font-size: 13px;
              opacity: 0.8; font-style: italic; }
            .knight-choice .warn { color: #a33; font-weight: 600; }
          </style>
          <div class="knight-choice">
            <p class="intro">Le MJ propose deux caractéristiques de base pour <b>${actor.name}</b>.</p>
            <p class="status">${data.noOd
              ? "⛔ Jet sans overdrive (imposé par le MJ)"
              : (armed
                  ? "🛡️ En méta-armure — overdrives inclus (dés + overdrive)"
                  : "👤 Hors armure — pas d'overdrive")}</p>
            <div class="cards">
              <label class="card" data-choice="0">
                <input type="radio" name="baseChoice" value="0"/>
                <div class="name">${data.base1Label}</div>
                <div class="score">${traitDisplay(actor, data.base1Key, data.noOd)}</div>
                ${traitOD(actor, data.base1Key, data.noOd) > 0
                  ? `<span class="od">dés + overdrive</span>` : `<span class="od">dés</span>`}
              </label>
              <label class="card" data-choice="1">
                <input type="radio" name="baseChoice" value="1"/>
                <div class="name">${data.base2Label}</div>
                <div class="score">${traitDisplay(actor, data.base2Key, data.noOd)}</div>
                ${traitOD(actor, data.base2Key, data.noOd) > 0
                  ? `<span class="od">dés + overdrive</span>` : `<span class="od">dés</span>`}
              </label>
            </div>
            <p class="footer">Cliquez sur une caractéristique : la fenêtre de jet de Knight s'ouvrira ensuite.</p>
          </div>
        `,
        render: (html) => {
          html.find(".knight-choice .card").on("click", function () {
            html.find(".knight-choice .card").removeClass("selected");
            $(this).addClass("selected");
            $(this).find("input").prop("checked", true);
          });
        },
        buttons: {
          ok: {
            icon: '<i class="fas fa-dice"></i>',
            label: "Continuer",
            callback: (html) => {
              const checked = html.find("input[name='baseChoice']:checked");

              // Aucune présélection : on force un choix explicite du joueur.
              if (checked.length === 0) {
                ui.notifications.warn("Choisissez d'abord une caractéristique de base.");
                openPlayerDialog(data);
                return;
              }

              const idx = checked.val();
              openNativeKnightDialog(actor, idx === "0" ? data.base1Key : data.base2Key, data);
            }
          },
          cancel: { icon: '<i class="fas fa-times"></i>', label: "Ignorer" }
        },
        default: "ok"
      }, {
        width: 520,
        height: "auto",
        resizable: true
      }).render(true);

      return;
    }

    // --- Mode fenêtre simplifiée (macro autonome) ---
    const statusLine = data.noOd
      ? "\u26D4 Jet sans overdrive (imposé par le MJ)"
      : (armed
          ? "\uD83D\uDEE1\uFE0F En méta-armure — overdrives inclus (dés + overdrive)"
          : "\uD83D\uDC64 Hors armure — pas d'overdrive");

    const baseCard = (idx, key, lbl) => `
      <label class="card" data-choice="${idx}">
        <input type="radio" name="baseChoice" value="${idx}"/>
        <div class="name">${lbl}</div>
        <div class="score">${traitDisplay(actor, key, data.noOd)}</div>
      </label>`;

    const baseBlock = hasTwoBases
      ? `
        <p class="intro">Le MJ propose deux caractéristiques de base pour <b>${actor.name}</b>.</p>
        <p class="status">${statusLine}</p>
        <div class="cards">
          ${baseCard(0, data.base1Key, data.base1Label)}
          ${baseCard(1, data.base2Key, data.base2Label)}
        </div>
      `
      : `
        <p class="intro">Caractéristique de base imposée : <b>${data.base1Label} (${traitDisplay(actor, data.base1Key, data.noOd)})</b> pour <b>${actor.name}</b>.</p>
        <p class="status">${statusLine}</p>
        <input type="radio" name="baseChoice" value="0" checked style="display:none;"/>
      `;

    new Dialog({
      title: `Jet demandé : ${actor.name}`,
      content: `
        <style>
          .knight-choice { font-size: 15px; line-height: 1.5; }
          .knight-choice .intro { margin: 0 0 4px 0; text-align: center; }
          .knight-choice .status { margin: 0 0 12px 0; font-size: 13px;
            opacity: 0.8; text-align: center; }
          .knight-choice .cards { display: flex; gap: 12px; align-items: stretch; }
          .knight-choice .card { flex: 1 1 0; min-width: 0; cursor: pointer;
            text-align: center; border: 2px solid rgba(120,120,120,0.45);
            border-radius: 8px; padding: 12px 8px; background: rgba(255,255,255,0.06);
            transition: border-color 0.15s, background 0.15s, transform 0.1s; }
          .knight-choice .card:hover { border-color: #7a6a3a;
            background: rgba(200,170,90,0.16); transform: translateY(-2px); }
          .knight-choice .card.selected { border-color: #b08d3f;
            background: rgba(200,170,90,0.28); box-shadow: 0 0 8px rgba(176,141,63,0.5); }
          .knight-choice .card .name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
          .knight-choice .card .score { font-size: 22px; font-weight: 700; font-family: monospace; }
          .knight-choice .card input { display: none; }
          .knight-choice select { width: 100%; height: 32px; font-size: 15px; }
          .knight-choice .form-group { margin-bottom: 10px; }
          .knight-choice .form-group > label { display: block; font-weight: 600;
            margin-bottom: 4px; }
          .knight-choice hr { margin: 14px 0; }
          .knight-choice .locked { opacity: 0.45; pointer-events: none; }
        </style>
        <div class="knight-choice">
          ${baseBlock}
          <hr/>
          <div id="restBlock" class="${hasTwoBases ? "locked" : ""}">
            <div class="form-group">
              <label>Seconde caractéristique</label>
              <select id="trait2"></select>
            </div>
            ${data.allowThirdTrait ? `
            <div class="form-group">
              <label><input type="checkbox" id="useThird"/> Ajouter une troisième caractéristique (circonstance exceptionnelle)</label>
            </div>
            <div class="form-group" id="thirdGroup" style="display:none;">
              <label>Troisième caractéristique</label>
              <select id="trait3"></select>
            </div>
            ` : ``}
          </div>
        </div>
      `,
      render: (html) => {
        const currentBaseKey = () => {
          const idx = html.find("input[name='baseChoice']:checked").val();
          return idx === "1" && data.base2Key ? data.base2Key : data.base1Key;
        };

        const refreshTrait2 = () => {
          const baseKey = currentBaseKey();
          const prev = html.find("#trait2").val();
          html.find("#trait2").html(traitOptionsHtml(actor, [baseKey], data.noOd));
          if (prev && prev !== baseKey) html.find("#trait2").val(prev);
          refreshTrait3();
        };

        const refreshTrait3 = () => {
          if (!data.allowThirdTrait) return;
          const baseKey = currentBaseKey();
          const t2 = html.find("#trait2").val();
          const prev = html.find("#trait3").val();
          html.find("#trait3").html(traitOptionsHtml(actor, [baseKey, t2], data.noOd));
          if (prev && prev !== baseKey && prev !== t2) html.find("#trait3").val(prev);
        };

        html.find(".knight-choice .card").on("click", function () {
          html.find(".knight-choice .card").removeClass("selected");
          $(this).addClass("selected");
          $(this).find("input").prop("checked", true);
          html.find("#restBlock").removeClass("locked");
          refreshTrait2();
        });

        html.find("#trait2").on("change", refreshTrait3);

        if (data.allowThirdTrait) {
          html.find("#useThird").on("change", function () {
            html.find("#thirdGroup").toggle(this.checked);
            if (this.checked) refreshTrait3();
          });
        }

        refreshTrait2();
      },
      buttons: {
        ok: {
          icon: '<i class="fas fa-dice"></i>',
          label: "Lancer",
          callback: async (html) => {
            const checked = html.find("input[name='baseChoice']:checked");

            // Aucune présélection quand deux bases sont proposées : on force un choix.
            if (checked.length === 0) {
              ui.notifications.warn("Choisissez d'abord une caractéristique de base.");
              openPlayerDialog(data);
              return;
            }

            const baseIdx = checked.val();
            const useBase2 = baseIdx === "1" && data.base2Key;
            const baseKey = useBase2 ? data.base2Key : data.base1Key;

            const t2 = html.find("#trait2").val();
            const useThird = data.allowThirdTrait && html.find("#useThird").is(":checked");
            const t3 = useThird ? html.find("#trait3").val() : null;

            const keys = [baseKey, t2];
            if (useThird && t3) keys.push(t3);

            const traits = keys.map(k => ({
              label: traitLabel(k),
              dice: traitDice(actor, k),
              od: traitOD(actor, k, data.noOd)
            }));

            await rollAndPost({
              actor,
              traits,
              extraDice: data.extraDice,
              bonusSucces: data.bonusSucces,
              seuil: data.seuil,
              noOd: data.noOd,
              armed: PJ_TYPES.includes(actor.type) ? isArmed(actor) : undefined
            });
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Ignorer"
        }
      },
      default: "ok"
    }, {
      width: 520,
      height: "auto",
      resizable: true
    }).render(true);
  }

  // ---- Registre des clients à l'écoute (rempli par les réponses « pong ») ----
  function registry() {
    if (!game.knight) game.knight = {};
    if (!game.knight._comboActive) game.knight._comboActive = {};
    return game.knight._comboActive;
  }

  // Vidé avant chaque interrogation : sans cela, un joueur ayant rechargé sa page
  // resterait affiché « à l'écoute » sur la foi d'une réponse périmée.
  function resetRegistry() {
    if (!game.knight) game.knight = {};
    game.knight._comboActive = {};
  }

  // Horodatage des invitations déjà envoyées, par joueur (anti-spam du chat).
  function inviteLog() {
    if (!game.knight) game.knight = {};
    if (!game.knight._comboInvites) game.knight._comboInvites = {};
    return game.knight._comboInvites;
  }

  // Retrouve le document Macro correspondant à ce script.
  // `this` est la source fiable ; le repli par contenu couvre les cas où la macro
  // est exécutée autrement (console, appel indirect).
  function findSelfMacro() {
    if (MACRO_SELF) return MACRO_SELF;
    return game.macros?.find(m => m.command?.includes(MSG_PING)) ?? null;
  }

  // Chuchote aux joueurs hors de portée un lien cliquable vers cette macro.
  // Foundry exécute directement les liens @UUID pointant sur une Macro : un clic
  // suffit donc à activer l'écoute (ou à la mettre à jour).
  // C'est le SEUL recours pour un client où aucun de notre code ne tourne encore.
  async function sendActivationInvite(users, { force = false } = {}) {
    if (!users.length) return 0;

    const macro = findSelfMacro();
    if (!macro) {
      ui.notifications.warn(
        "Impossible de retrouver cette macro dans le répertoire : aucune invitation envoyée."
      );
      return 0;
    }

    const now = Date.now();
    const log = inviteLog();
    const targets = force
      ? users
      : users.filter(u => now - (log[u.id] ?? 0) >= INVITE_COOLDOWN_MS);

    if (!targets.length) return 0;
    for (const u of targets) log[u.id] = now;

    await ChatMessage.create({
      speaker: { alias: "Jet combo" },
      whisper: targets.map(u => u.id),
      content: `
        <div style="border-left:3px solid #b08d3f;padding-left:10px;">
          <b>🎲 Jets combo — activation nécessaire</b><br/>
          <span style="opacity:0.85;font-size:0.92em;">
            Votre client ne reçoit pas les demandes de jet du MJ.
            Un clic suffit, à refaire après chaque rechargement de page.
          </span>
          <p style="margin:8px 0 2px 0;font-size:1.05em;">
            👉 @UUID[${macro.uuid}]{Activer les jets combo}
          </p>
        </div>
      `
    });

    return targets.length;
  }

  // ---- Active l'écoute des demandes sur ce client ----
  // Relancer la macro après une mise à jour remplace l'écouteur de l'ancienne version.
  function ensureListener() {
    if (!game.knight) game.knight = {};

    const prev = game.knight._comboListener;

    if (prev) {
      // Déjà à l'écoute dans cette version : rien à faire.
      if (prev.version === VERSION) return false;

      // Version différente : on retire proprement l'ancien écouteur.
      // (possible seulement si l'ancienne version stockait sa référence, soit >= 1.15.0 ;
      //  sinon l'ancien écouteur reste en place mais devient inerte, car le type de
      //  message de requête est lié à la version.)
      if (prev.handler) {
        try { game.socket.off(SOCKET_CHANNEL, prev.handler); } catch (e) { /* ignoré */ }
      }
    }

    const handler = (data) => {
      if (!data) return;

      // Demande de jet adressée à ce client (type lié à la version).
      if (data.type === MSG_TYPE) {
        if (!data.targetUserIds?.includes(game.user.id)) return;
        openPlayerDialog(data);
        return;
      }

      // Le MJ nous signale que notre version est périmée : on ré-exécute la macro.
      // Son code est celui du monde, donc déjà celui du MJ — la ré-exécution suffit
      // à remplacer cet écouteur-ci par celui de la nouvelle version.
      if (data.type === MSG_RELOAD) {
        if (!data.targetUserIds?.includes(game.user.id)) return;
        if (data.version === VERSION) return; // déjà à jour

        const now = Date.now();
        if (now - (game.knight._comboLastReload ?? 0) < RELOAD_COOLDOWN_MS) return;
        game.knight._comboLastReload = now;

        // Lu par la nouvelle exécution : la mise à jour se fait sans annonce.
        game.knight._comboSilentReload = true;

        // Filet : si la ré-exécution n'aboutit pas (droits insuffisants, macro
        // introuvable), l'indicateur ne doit pas museler la prochaine exécution.
        setTimeout(() => { delete game.knight._comboSilentReload; }, 5000);

        fromUuid(data.macroUuid)
          .then(macro => macro?.execute())
          .catch(() => ui.notifications.warn(
            "Mise à jour automatique de la macro de jet combo impossible : relancez-la à la main."
          ));

        return;
      }

      // Le MJ demande qui est à l'écoute : on se signale.
      if (data.type === MSG_PING) {
        game.socket.emit(SOCKET_CHANNEL, {
          type: MSG_PONG,
          userId: game.user.id,
          userName: game.user.name,
          version: VERSION
        });
        return;
      }

      // Réponse d'un client : on l'enregistre (utile côté MJ).
      if (data.type === MSG_PONG) {
        registry()[data.userId] = { version: data.version, at: Date.now() };
        return;
      }
    };

    game.socket.on(SOCKET_CHANNEL, handler);
    game.knight._comboListener = { version: VERSION, handler };

    // Renvoie true s'il s'agit d'une mise à jour depuis une version antérieure.
    return !!prev;
  }

  const wasUpdated = ensureListener();

  // On se signale aux autres clients (dont le MJ) dès l'activation.
  game.socket.emit(SOCKET_CHANNEL, {
    type: MSG_PONG,
    userId: game.user.id,
    userName: game.user.name,
    version: VERSION
  });
  registry()[game.user.id] = { version: VERSION, at: Date.now() };

  // ---- Côté joueur : rien d'autre à faire, l'écoute est active ----
  if (!game.user.isGM) {
    ui.notifications.info(wasUpdated
      ? `Macro de jet combo mise à jour en v${VERSION} pour cette session.`
      : `Écoute des demandes de jet combo activée pour cette session. (v${VERSION})`);

    // Mise à jour déclenchée par le MJ : il la voit dans son tableau, inutile de
    // le prévenir une seconde fois dans le chat.
    if (silentReload) return;

    // Message dans le chat pour que le MJ voie qui a bien lancé la macro.
    await ChatMessage.create({
      speaker: { alias: game.user.name },
      whisper: ChatMessage.getWhisperRecipients("GM").map(u => u.id),
      content: `
        <div style="border-left:3px solid #2e7d32;padding-left:8px;">
          <b>${wasUpdated ? "🔄 Macro de jet combo mise à jour" : "✅ Macro de jet combo activée"}</b><br/>
          <span style="opacity:0.8;font-size:0.9em;">
            ${game.user.name} — version ${VERSION}
          </span>
        </div>
      `
    });

    return;
  }

  // ---- Côté MJ : interroger les clients, puis les remettre à niveau ----
  resetRegistry();
  registry()[game.user.id] = { version: VERSION, at: Date.now() };

  game.socket.emit(SOCKET_CHANNEL, { type: MSG_PING });
  await new Promise(resolve => setTimeout(resolve, 400));

  const players = game.users.filter(u => u.active && !u.isGM);

  // 1. À l'écoute mais en version antérieure : on les met à jour sans aucun clic.
  const outdatedUsers = players.filter(u => {
    const entry = registry()[u.id];
    return entry && entry.version !== VERSION;
  });

  if (outdatedUsers.length > 0) {
    const macro = findSelfMacro();

    if (macro) {
      game.socket.emit(SOCKET_CHANNEL, {
        type: MSG_RELOAD,
        targetUserIds: outdatedUsers.map(u => u.id),
        macroUuid: macro.uuid,
        version: VERSION
      });

      // Laisse aux clients le temps de ré-exécuter puis de se re-signaler, afin que
      // le tableau ci-dessous reflète l'état réel et non celui d'avant la mise à jour.
      await new Promise(resolve => setTimeout(resolve, 900));
    }
  }

  // 2. Toujours pas à jour après cette tentative. Deux cas, même remède :
  //    - macro jamais lancée : aucun de notre code ne tourne chez eux ;
  //    - version antérieure à 1.18 : leur écouteur ignore MSG_RELOAD.
  //    Dans les deux cas, seul un clic de leur part peut débloquer la situation.
  const strandedUsers = players.filter(u => registry()[u.id]?.version !== VERSION);
  const invited = strandedUsers.length > 0 ? await sendActivationInvite(strandedUsers) : 0;

  // ---- Côté MJ : préparer et envoyer la demande ----
  const tokens = canvas.tokens.controlled.filter(t => t.actor && PJ_TYPES.includes(t.actor.type));

  if (tokens.length === 0) {
    ui.notifications.info(
      `Clients passés en revue${invited ? `, ${invited} lien(s) d'activation envoyé(s)` : ", tous à jour"}. ` +
      `Sélectionnez des tokens de Chevalier/Méta-armure pour demander un jet.`
    );
    return;
  }

  new Dialog({
    title: `Demander un jet combo (v${VERSION})`,
    content: `
      <style>
        .knight-mj-form {
          font-size: 14px; line-height: 1.55;
          --k-gold: #b08d3f; --k-gold-soft: rgba(176,141,63,0.14);
          --k-line: rgba(130,120,100,0.32);
          --k-ok: #2e7d32; --k-ko: #a33; --k-warn: #a8730b;
        }

        /* ---- Sections ---- */
        .knight-mj-form .section {
          border: 1px solid var(--k-line); border-radius: 8px;
          padding: 12px 14px 14px 14px; margin-bottom: 12px;
          background: rgba(255,255,255,0.045);
        }
        .knight-mj-form .section > h3 {
          margin: 0 0 10px 0; padding: 0 0 6px 0; border: none;
          border-bottom: 1px solid var(--k-line);
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.09em; color: var(--k-gold);
          display: flex; align-items: center; gap: 7px;
        }
        .knight-mj-form .section > h3 .count {
          margin-left: auto; font-size: 11px; letter-spacing: 0;
          text-transform: none; opacity: 0.75; font-weight: 600;
        }

        /* ---- Champs ---- */
        .knight-mj-form .form-group { display: block; margin-bottom: 11px; }
        .knight-mj-form .form-group:last-child { margin-bottom: 0; }
        .knight-mj-form .form-group > label {
          display: block; flex: none; font-weight: 600; margin-bottom: 4px;
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
          opacity: 0.78;
        }
        .knight-mj-form select,
        .knight-mj-form input[type="number"] {
          width: 100%; height: 32px; font-size: 14px; padding: 2px 7px;
          border: 1px solid var(--k-line); border-radius: 5px;
          background: rgba(0,0,0,0.06);
        }
        .knight-mj-form select:focus,
        .knight-mj-form input[type="number"]:focus {
          border-color: var(--k-gold); outline: none;
          box-shadow: 0 0 5px rgba(176,141,63,0.45);
        }
        .knight-mj-form optgroup { font-size: 13px; font-style: normal; }
        .knight-mj-form option { font-size: 14px; }

        /* ---- Cases à cocher ---- */
        .knight-mj-form label.check {
          font-weight: 600; display: flex; align-items: flex-start; gap: 8px;
          margin-bottom: 0; cursor: pointer; padding: 5px 7px;
          border-radius: 5px; transition: background 0.12s;
          text-transform: none; letter-spacing: normal;
          font-size: 14px; opacity: 1;
        }
        .knight-mj-form label.check:hover { background: var(--k-gold-soft); }
        .knight-mj-form label.check input[type="checkbox"] {
          margin: 3px 0 0 0; flex: 0 0 auto; transform: scale(1.1);
        }
        .knight-mj-form .hint {
          font-size: 12px; opacity: 0.72; line-height: 1.4;
          margin: 1px 0 0 33px; font-weight: normal; font-style: italic;
        }

        /* ---- Tableau des personnages ---- */
        .knight-mj-form table.chars { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .knight-mj-form table.chars th {
          text-align: left; font-weight: 700; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.07em; opacity: 0.65;
          padding: 0 8px 5px 0; border-bottom: 1px solid var(--k-line);
        }
        .knight-mj-form table.chars td {
          padding: 6px 8px 6px 0; vertical-align: top;
          border-bottom: 1px solid rgba(130,120,100,0.15);
        }
        .knight-mj-form table.chars tbody tr:last-child td { border-bottom: none; }
        .knight-mj-form table.chars tbody tr:hover { background: var(--k-gold-soft); }
        .knight-mj-form table.chars td:first-child { font-weight: 600; width: 40%; }
        .knight-mj-form table.chars td:nth-child(3),
        .knight-mj-form table.chars th:nth-child(3) { width: 26%; white-space: nowrap; }
        .knight-mj-form table.chars .off { opacity: 0.5; font-style: italic; }
        .knight-mj-form table.chars .none { color: var(--k-ko); font-style: italic; }
        .knight-mj-form .badge {
          display: inline-block; padding: 1px 7px; border-radius: 10px;
          font-size: 11.5px; font-weight: 700; border: 1px solid currentColor;
        }
        .knight-mj-form .badge.ok { color: var(--k-ok); background: rgba(46,125,50,0.12); }
        .knight-mj-form .badge.ko { color: var(--k-ko); background: rgba(170,51,51,0.12); }
        .knight-mj-form .badge.warn { color: var(--k-warn); background: rgba(168,115,11,0.12); }
        .knight-mj-form .badge.idle { color: #777; background: rgba(120,120,120,0.12); }

        /* ---- Rangées multi-colonnes ---- */
        .knight-mj-form .form-row { display: flex; gap: 12px; align-items: flex-start; }
        .knight-mj-form .form-row .form-group { flex: 1 1 0; min-width: 0; margin-bottom: 0; }
        .knight-mj-form .sublabel {
          display: block; font-size: 11.5px; opacity: 0.65; font-weight: normal;
          margin-top: 3px; line-height: 1.3; text-transform: none; letter-spacing: 0;
        }
        .knight-mj-form .legend {
          font-size: 11.5px; opacity: 0.7; font-style: italic;
          margin: 9px 0 0 0; line-height: 1.45;
        }

        /* ---- Bouton d'action secondaire ---- */
        .knight-mj-form .actions { margin: 9px 0 0 0; text-align: right; }
        .knight-mj-form .actions button {
          width: auto; font-size: 12.5px; line-height: 1.3; padding: 4px 12px;
          border: 1px solid var(--k-line); border-radius: 5px; cursor: pointer;
          background: rgba(255,255,255,0.07);
        }
        .knight-mj-form .actions button:hover {
          border-color: var(--k-gold); background: var(--k-gold-soft);
        }
      </style>
      <form class="knight-mj-form">

        <div class="section">
          <h3>👥 Destinataires <span class="count">${tokens.length} personnage(s)</span></h3>
          <table class="chars">
            <thead>
              <tr><th>Personnage</th><th>Joueur</th><th>Macro</th></tr>
            </thead>
            <tbody>
              ${tokens.map(t => {
                const owners = game.users
                  .filter(u => !u.isGM && t.actor.testUserPermission(u, "OWNER"));

                if (owners.length === 0) {
                  return `<tr><td>${t.actor.name}</td>
                    <td colspan="2"><span class="none">aucun joueur assigné</span></td></tr>`;
                }

                const joueurs = owners
                  .map(u => `<span class="${u.active ? "on" : "off"}">${u.name}${u.active ? "" : " (hors ligne)"}</span>`)
                  .join("<br/>");

                const etats = owners.map(u => {
                  if (!u.active) return `<span class="badge idle">hors ligne</span>`;

                  const entry = registry()[u.id];
                  if (!entry) return `<span class="badge ko">✖ non lancée</span>`;

                  const same = entry.version === VERSION;
                  return `<span class="badge ${same ? "ok" : "warn"}">${same ? "✔" : "⚠"} v${entry.version}</span>`;
                }).join("<br/>");

                return `<tr><td>${t.actor.name}</td><td>${joueurs}</td><td>${etats}</td></tr>`;
              }).join("")}
            </tbody>
          </table>
          <p class="legend">
            Version de référence : v${VERSION}. Les clients à l'écoute en version antérieure
            viennent d'être mis à jour automatiquement. « ✖ non lancée » = le joueur n'a rien
            lancé de la session : seul un clic de sa part peut l'activer.
          </p>
          <p class="actions">
            <button type="button" id="inviteMissing">📣 Renvoyer le lien d'activation</button>
          </p>
        </div>

        <div class="section">
          <h3>🎯 Caractéristiques de base</h3>
          <div class="form-group">
            <label class="check"><input type="checkbox" id="useSecondBase" checked/> Proposer une seconde caractéristique au choix du joueur</label>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Caractéristique 1</label>
              <select id="traitBase1">${traitOptionsHtml(null)}</select>
            </div>
            <div class="form-group" id="base2Group">
              <label>Caractéristique 2</label>
              <select id="traitBase2"></select>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>⚙️ Options du jet</h3>
          <div class="form-group">
            <label class="check"><input type="checkbox" id="noOd"/> Jet sans overdrive (ignorer les OD des méta-armures)</label>
            <p class="hint">
              Équivaut au bouton « Sans OD » du système. Utile hors combat ou quand
              l'armure n'apporte aucune aide.
            </p>
          </div>
          <div class="form-group">
            <label class="check"><input type="checkbox" id="useNative" checked/> Utiliser la fenêtre de jet native de Knight</label>
            <p class="hint">
              Recommandé : gère overdrives, capacités d'armure, styles, effets et entraide.
              Décochez pour la fenêtre simplifiée.
            </p>
          </div>
          <div class="form-group" id="autoCloseGroup">
            <label class="check"><input type="checkbox" id="autoClose" checked/> Fermer la fenêtre de jet après le lancer</label>
            <p class="hint">
              Le système la laisse ouverte par défaut. Décochez si vos joueurs
              enchaînent plusieurs jets.
            </p>
          </div>
          <div class="form-group" id="thirdGroup">
            <label class="check"><input type="checkbox" id="allowThird"/> Autoriser une troisième caractéristique (circonstance exceptionnelle)</label>
          </div>
        </div>

        <div class="section">
          <h3>🎲 Modificateurs</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Dés bonus/malus</label>
              <input type="number" id="extraDice" value="0"/>
              <span class="sublabel">D6 ajoutés au jet</span>
            </div>
            <div class="form-group">
              <label>Succès bonus/malus</label>
              <input type="number" id="bonusSucces" value="0"/>
              <span class="sublabel">Réussites automatiques</span>
            </div>
            <div class="form-group">
              <label>Seuil / difficulté</label>
              <input type="number" id="seuil" placeholder="—"/>
              <span class="sublabel">Vide si non applicable</span>
            </div>
          </div>
        </div>

      </form>
    `,
    render: (html) => {
      const refreshBase2 = () => {
        const b1 = html.find("#traitBase1").val();
        const prev = html.find("#traitBase2").val();
        html.find("#traitBase2").html(traitOptionsHtml(null, [b1]));
        if (prev && prev !== b1) html.find("#traitBase2").val(prev);
      };

      html.find("#traitBase1").on("change", refreshBase2);

      html.find("#useSecondBase").on("change", function () {
        html.find("#base2Group").toggle(this.checked);
      });

      // Relance manuelle de l'invitation, hors délai anti-spam.
      html.find("#inviteMissing").on("click", async (ev) => {
        ev.preventDefault();

        const missing = game.users
          .filter(u => u.active && !u.isGM && registry()[u.id]?.version !== VERSION);

        if (missing.length === 0) {
          ui.notifications.info(`Tous les joueurs connectés sont à l'écoute en v${VERSION}.`);
          return;
        }

        const sent = await sendActivationInvite(missing, { force: true });
        if (sent > 0) ui.notifications.info(`Lien d'activation envoyé à ${sent} joueur(s).`);
      });

      // Le 3e trait n'existe que dans la fenêtre simplifiée, la fermeture auto
      // que dans la fenêtre native.
      html.find("#useNative").on("change", function () {
        html.find("#thirdGroup").toggle(!this.checked);
        html.find("#autoCloseGroup").toggle(this.checked);
        if (this.checked) html.find("#allowThird").prop("checked", false);
      }).trigger("change");

      refreshBase2();
    },
    buttons: {
      ok: {
        icon: '<i class="fas fa-paper-plane"></i>',
        label: "Envoyer aux joueurs",
        callback: async (html) => {
          const traitBase1 = html.find("#traitBase1").val();
          const useSecondBase = html.find("#useSecondBase").is(":checked");
          const traitBase2 = useSecondBase ? html.find("#traitBase2").val() : null;
          const useNative = html.find("#useNative").is(":checked");
          const noOd = html.find("#noOd").is(":checked");
          const autoClose = useNative && html.find("#autoClose").is(":checked");
          const allowThirdTrait = !useNative && html.find("#allowThird").is(":checked");
          const extraDice = Number(html.find("#extraDice").val()) || 0;
          const bonusSucces = Number(html.find("#bonusSucces").val()) || 0;
          const seuilRaw = html.find("#seuil").val();
          const seuil = seuilRaw === "" ? null : Number(seuilRaw);

          let sent = 0;
          const skipped = [];
          const unreachable = new Map(); // id -> User, dédoublonné entre tokens

          for (const token of tokens) {
            const actor = token.actor;

            const owners = game.users
              .filter(u => u.active && !u.isGM && actor.testUserPermission(u, "OWNER"));
            const ownerIds = owners.map(u => u.id);

            // Un joueur en version différente ne réagira pas : le type de message
            // de requête est lié à la version. La mise à jour automatique a déjà eu
            // lieu à l'ouverture, donc ceux qui restent sont bien hors de portée.
            for (const u of owners) {
              const entry = registry()[u.id];
              if (!entry || entry.version !== VERSION) unreachable.set(u.id, u);
            }

            if (ownerIds.length === 0) {
              skipped.push(actor.name);
              continue;
            }

            game.socket.emit(SOCKET_CHANNEL, {
              type: MSG_TYPE,
              targetUserIds: ownerIds,
              actorUuid: actor.uuid,
              tokenId: token.id,
              useNative,
              autoClose,
              noOd,
              label: noOd ? "Jet demandé par le MJ (sans OD)" : "Jet demandé par le MJ",
              base1Key: traitBase1,
              base1Label: traitLabel(traitBase1),
              base2Key: traitBase2,
              base2Label: traitBase2 ? traitLabel(traitBase2) : null,
              allowThirdTrait,
              extraDice,
              bonusSucces,
              seuil
            });

            sent++;
          }

          if (sent > 0) {
            const modes = [];
            if (useNative) modes.push("fenêtre native Knight");
            if (noOd) modes.push("sans OD");
            ui.notifications.info(
              `Demande de jet envoyée à ${sent} joueur(s)${modes.length ? ` (${modes.join(", ")})` : ""}.`
            );
          }
          if (skipped.length > 0) {
            ui.notifications.warn(
              `Aucun joueur connecté pour : ${skipped.join(", ")}. Utilisez la macro individuelle "Jet combo" pour ces personnages.`
            );
          }
          if (unreachable.size > 0) {
            // Ces joueurs viennent d'être ciblés : le rappel est utile maintenant,
            // on force donc l'envoi sans attendre la fin du délai anti-spam.
            const names = [...unreachable.values()].map(u => u.name).join(", ");
            await sendActivationInvite([...unreachable.values()], { force: true });

            ui.notifications.warn(
              `Macro non lancée ou version incompatible pour : ${names}. ` +
              `Un lien d'activation vient de leur être chuchoté dans le chat ; ` +
              `leur demande de jet sera à renvoyer après leur clic.`
            );
          }
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annuler"
      }
    },
    default: "ok"
  }, {
    width: 780,
    height: "auto",
    resizable: true
  }).render(true);

})();
