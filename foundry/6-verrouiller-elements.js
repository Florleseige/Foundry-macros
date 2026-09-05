// =============================================================================
// Macro : Verrouiller / déverrouiller — bloquer ou libérer les éléments de la scène
// Version : 1.0.0  (2026-09-05)
// Auteur  : Florleseige
// Système : FoundryVTT (générique)
// Compatibilité : FoundryVTT v14 (build 364)
// =============================================================================
//
// USAGE :
// - Sélectionner des tuiles et/ou des dessins pour ne traiter que ceux-ci.
// - Sans sélection, toutes les tuiles et tous les dessins de la scène sont traités.
// - Un élément verrouillé ne peut plus être déplacé, redimensionné ni supprimé
//   sur le plateau tant qu'il n'est pas déverrouillé.
//
// OPTIONS :
// - Action : verrouiller, déverrouiller, ou inverser l'état de chaque élément.
// - Application sélective aux tuiles et/ou aux dessins.
//
// NOTE :
// - Seuls les tuiles et les dessins possèdent un état de verrouillage dans
//   FoundryVTT. Les tokens et les sources de lumière n'en ont pas ; pour les
//   masquer, utiliser la macro « Cacher / afficher ».
//
// -----------------------------------------------------------------------------
// HISTORIQUE
// -----------------------------------------------------------------------------
// v1.0.0 - Version initiale : tuiles et dessins, sélection ou scène entière,
//          actions verrouiller / déverrouiller / inverser.
// =============================================================================

const selectedTiles    = canvas.tiles.controlled;
const selectedDrawings = canvas.drawings.controlled;
const hasSelection     = selectedTiles.length > 0 || selectedDrawings.length > 0;

const targetTiles    = hasSelection ? selectedTiles.map(t => t.document)    : canvas.scene.tiles.contents;
const targetDrawings = hasSelection ? selectedDrawings.map(d => d.document) : canvas.scene.drawings.contents;

const countLocked = (docs) => docs.filter(d => d.locked).length;

const tilesLabel = hasSelection
  ? `${targetTiles.length} sélectionnée(s) · ${countLocked(targetTiles)} verrouillée(s)`
  : `${targetTiles.length} sur la scène · ${countLocked(targetTiles)} verrouillée(s)`;
const drawingsLabel = hasSelection
  ? `${targetDrawings.length} sélectionné(s) · ${countLocked(targetDrawings)} verrouillé(s)`
  : `${targetDrawings.length} sur la scène · ${countLocked(targetDrawings)} verrouillé(s)`;

new Dialog({
  title: "Verrouiller / Déverrouiller — Éléments de la scène",
  content: `
    <style>
      .lock-form {
        font-size: 14px; line-height: 1.55;
        --k-gold: #b08d3f; --k-gold-soft: rgba(176,141,63,0.14);
        --k-line: rgba(130,120,100,0.32);
      }
      .lock-form .section {
        border: 1px solid var(--k-line); border-radius: 8px;
        padding: 12px 14px 14px 14px; margin-bottom: 12px;
        background: rgba(255,255,255,0.045);
      }
      .lock-form .section > h3 {
        margin: 0 0 10px 0; padding: 0 0 6px 0; border: none;
        border-bottom: 1px solid var(--k-line);
        font-size: 12px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.09em; color: var(--k-gold);
        display: flex; align-items: center; gap: 7px;
      }
      .lock-form .form-group { display: block; margin-bottom: 8px; }
      .lock-form .form-group:last-child { margin-bottom: 0; }
      .lock-form .hint {
        font-size: 12px; opacity: 0.72; line-height: 1.4;
        margin: 4px 0 0 33px; font-weight: normal; font-style: italic;
      }
      .lock-form label.check {
        font-weight: 600; display: flex; align-items: flex-start; gap: 8px;
        cursor: pointer; padding: 5px 7px; border-radius: 5px;
        transition: background 0.12s; font-size: 14px; opacity: 1;
        text-transform: none; letter-spacing: normal; margin-bottom: 0;
      }
      .lock-form label.check:hover { background: var(--k-gold-soft); }
      .lock-form label.check input { margin: 3px 0 0 0; flex: 0 0 auto; transform: scale(1.1); }
      .lock-form label.check.disabled { opacity: 0.45; pointer-events: none; }
      .lock-form .count-tag {
        margin-left: auto; font-size: 12px; font-weight: 600;
        opacity: 0.65; font-style: italic;
      }
      .lock-form .scope-note {
        font-size: 12px; opacity: 0.78; font-style: italic;
        margin: 0 0 12px 2px;
      }
    </style>
    <form class="lock-form">

      <p class="scope-note">
        ${hasSelection
          ? "🎯 Portée : la sélection en cours sur le plateau."
          : "🌍 Portée : tous les éléments de la scène (aucune sélection en cours)."}
      </p>

      <div class="section">
        <h3>🔒 Action</h3>
        <div class="form-group">
          <label class="check"><input type="radio" name="mode" value="lock" checked/> Verrouiller les éléments</label>
        </div>
        <div class="form-group">
          <label class="check"><input type="radio" name="mode" value="unlock"/> Déverrouiller les éléments</label>
        </div>
        <div class="form-group">
          <label class="check"><input type="radio" name="mode" value="toggle"/> Inverser le verrouillage</label>
          <p class="hint">Chaque élément passe de verrouillé à déverrouillé, et inversement.</p>
        </div>
      </div>

      <div class="section">
        <h3>📋 Éléments à traiter</h3>

        <div class="form-group">
          <label class="check ${targetTiles.length === 0 ? "disabled" : ""}">
            <input type="checkbox" id="doTiles" checked ${targetTiles.length === 0 ? "disabled" : ""}/>
            Tuiles
            <span class="count-tag">${tilesLabel}</span>
          </label>
        </div>

        <div class="form-group">
          <label class="check ${targetDrawings.length === 0 ? "disabled" : ""}">
            <input type="checkbox" id="doDrawings" checked ${targetDrawings.length === 0 ? "disabled" : ""}/>
            Dessins
            <span class="count-tag">${drawingsLabel}</span>
          </label>
          <p class="hint">Seuls les tuiles et les dessins possèdent un état de verrouillage dans FoundryVTT.</p>
        </div>

      </div>

    </form>
  `,
  buttons: {
    ok: {
      icon: '<i class="fas fa-check"></i>',
      label: "Appliquer",
      callback: async (html) => {
        const mode       = html.find("input[name='mode']:checked").val();
        const doTiles    = html.find("#doTiles").is(":checked");
        const doDrawings = html.find("#doDrawings").is(":checked");

        const tiles    = doTiles    ? targetTiles    : [];
        const drawings = doDrawings ? targetDrawings : [];

        if (tiles.length === 0 && drawings.length === 0) {
          ui.notifications.warn("Aucune tuile ni dessin à traiter (catégories vides ou non sélectionnées).");
          return;
        }

        // En mode "toggle", chaque élément est inversé individuellement.
        const nextState = (doc) => mode === "toggle" ? !doc.locked : mode === "lock";
        const updates   = (docs) => docs.map(d => ({ _id: d.id, locked: nextState(d) }));

        if (tiles.length > 0)
          await canvas.scene.updateEmbeddedDocuments("Tile", updates(tiles));
        if (drawings.length > 0)
          await canvas.scene.updateEmbeddedDocuments("Drawing", updates(drawings));

        const verbe = mode === "lock" ? "Verrouillés" : mode === "unlock" ? "Déverrouillés" : "Inversés";
        const parts = [
          tiles.length    > 0 && `${tiles.length} tuile(s)`,
          drawings.length > 0 && `${drawings.length} dessin(s)`,
        ].filter(Boolean);
        ui.notifications.info(`${verbe} : ${parts.join(", ")}.`);
      }
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: "Annuler"
    }
  },
  default: "ok"
}, {
  width: 520,
  height: "auto",
  resizable: true
}).render(true);
