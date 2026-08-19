// =============================================================================
// Macro : Ancre zéro — positionner l'ancre des tuiles et des dessins
// Version : 2.1.0  (2026-08-19)
// Auteur  : Florleseige
// Système : FoundryVTT (générique)
// Compatibilité : FoundryVTT v14 (build 364)
// =============================================================================
//
// USAGE :
// - Sélectionner des tuiles et/ou des dessins pour ne modifier que ceux-ci.
// - Sans sélection, toutes les tuiles et tous les dessins de la scène sont modifiés.
// - L'ancre définit le point de référence d'un objet : (0, 0) = coin haut-gauche,
//   (0.5, 0.5) = centre, (1, 1) = coin bas-droit.
//
// OPTIONS :
// - Préréglages rapides pour les neuf positions courantes.
// - Ancre X et Y saisies manuellement (0 à 1).
// - Application sélective aux tuiles et/ou aux dessins.
//
// -----------------------------------------------------------------------------
// HISTORIQUE
// -----------------------------------------------------------------------------
// v2.1.0 - Ajout de la version FoundryVTT compatible dans l'en-tête.
// v2.0.0 - Refonte graphique : sections encadrées, CSS variables, grille de
//          préréglages, sublabels, hints. Standards harmonisés avec les autres macros.
// v1.0.0 - Version initiale.
// =============================================================================

const selectedTiles    = canvas.tiles.controlled;
const selectedDrawings = canvas.drawings.controlled;
const hasSelection     = selectedTiles.length > 0 || selectedDrawings.length > 0;
const sceneTilesCount    = canvas.scene.tiles.contents.length;
const sceneDrawingsCount = canvas.scene.drawings.contents.length;

const tilesLabel    = hasSelection
  ? `${selectedTiles.length} sélectionnée(s)`
  : `${sceneTilesCount} sur la scène`;
const drawingsLabel = hasSelection
  ? `${selectedDrawings.length} sélectionné(s)`
  : `${sceneDrawingsCount} sur la scène`;

// Neuf préréglages couvrant les positions standard (3×3).
const PRESETS = [
  { label: "↖ Haut-gauche",   x: 0,   y: 0   },
  { label: "↑ Haut-centre",   x: 0.5, y: 0   },
  { label: "↗ Haut-droit",    x: 1,   y: 0   },
  { label: "← Centre-gauche", x: 0,   y: 0.5 },
  { label: "⊕ Centre",        x: 0.5, y: 0.5 },
  { label: "→ Centre-droit",  x: 1,   y: 0.5 },
  { label: "↙ Bas-gauche",    x: 0,   y: 1   },
  { label: "↓ Bas-centre",    x: 0.5, y: 1   },
  { label: "↘ Bas-droit",     x: 1,   y: 1   },
];

new Dialog({
  title: "Définir l'ancre — Ancre Zéro",
  content: `
    <style>
      .ancre-form {
        font-size: 14px; line-height: 1.55;
        --k-gold: #b08d3f; --k-gold-soft: rgba(176,141,63,0.14);
        --k-line: rgba(130,120,100,0.32);
      }
      .ancre-form .section {
        border: 1px solid var(--k-line); border-radius: 8px;
        padding: 12px 14px 14px 14px; margin-bottom: 12px;
        background: rgba(255,255,255,0.045);
      }
      .ancre-form .section > h3 {
        margin: 0 0 10px 0; padding: 0 0 6px 0; border: none;
        border-bottom: 1px solid var(--k-line);
        font-size: 12px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.09em; color: var(--k-gold);
        display: flex; align-items: center; gap: 7px;
      }
      .ancre-form .section > h3 .count {
        margin-left: auto; font-size: 11px; letter-spacing: 0;
        text-transform: none; opacity: 0.75; font-weight: 600;
      }
      .ancre-form .form-group { display: block; margin-bottom: 11px; }
      .ancre-form .form-group:last-child { margin-bottom: 0; }
      .ancre-form .form-group > label {
        display: block; font-weight: 600; margin-bottom: 4px;
        font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
        opacity: 0.78;
      }
      .ancre-form input[type="number"] {
        width: 100%; height: 32px; font-size: 14px; padding: 2px 7px;
        border: 1px solid var(--k-line); border-radius: 5px;
        background: rgba(0,0,0,0.06);
      }
      .ancre-form input[type="number"]:focus {
        border-color: var(--k-gold); outline: none;
        box-shadow: 0 0 5px rgba(176,141,63,0.45);
      }
      .ancre-form .sublabel {
        display: block; font-size: 11.5px; opacity: 0.65; font-weight: normal;
        margin-top: 3px; line-height: 1.3; text-transform: none; letter-spacing: 0;
      }
      .ancre-form .hint {
        font-size: 12px; opacity: 0.72; line-height: 1.4;
        margin: 6px 0 0 0; font-weight: normal; font-style: italic;
      }
      .ancre-form .form-row { display: flex; gap: 12px; align-items: flex-start; }
      .ancre-form .form-row .form-group { flex: 1 1 0; min-width: 0; margin-bottom: 0; }
      .ancre-form label.check {
        font-weight: 600; display: flex; align-items: flex-start; gap: 8px;
        cursor: pointer; padding: 5px 7px; border-radius: 5px;
        transition: background 0.12s; font-size: 14px; opacity: 1;
        text-transform: none; letter-spacing: normal; margin-bottom: 0;
      }
      .ancre-form label.check:hover { background: var(--k-gold-soft); }
      .ancre-form label.check input[type="checkbox"] {
        margin: 3px 0 0 0; flex: 0 0 auto; transform: scale(1.1);
      }
      .ancre-form .preset-grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
      }
      .ancre-form .preset-btn {
        cursor: pointer; border: 1px solid var(--k-line); border-radius: 5px;
        padding: 7px 4px; text-align: center; font-size: 12px; font-weight: 600;
        background: rgba(0,0,0,0.04); transition: border-color 0.12s, background 0.12s;
        user-select: none;
      }
      .ancre-form .preset-btn:hover { border-color: var(--k-gold); background: var(--k-gold-soft); }
      .ancre-form .preset-btn.active {
        border-color: #b08d3f; background: rgba(200,170,90,0.28);
        box-shadow: 0 0 6px rgba(176,141,63,0.4);
      }
      .ancre-form table.info { width: 100%; border-collapse: collapse; font-size: 13.5px; }
      .ancre-form table.info td { padding: 4px 8px 4px 0; vertical-align: top; }
      .ancre-form table.info td:first-child { font-weight: 600; opacity: 0.7; width: 50%; }
    </style>
    <form class="ancre-form">

      <div class="section">
        <h3>📌 Sélection
          <span class="count">${hasSelection ? "sélection active" : "toute la scène"}</span>
        </h3>
        <table class="info">
          <tr><td>Tuiles</td><td>${tilesLabel}</td></tr>
          <tr><td>Dessins</td><td>${drawingsLabel}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>⚓ Position de l'ancre</h3>
        <div class="form-group">
          <label>Préréglages</label>
          <div class="preset-grid">
            ${PRESETS.map((p, i) => `
              <div class="preset-btn" data-x="${p.x}" data-y="${p.y}" data-idx="${i}">${p.label}</div>
            `).join("")}
          </div>
        </div>
        <div class="form-row" style="margin-top:12px;">
          <div class="form-group">
            <label>Ancre X</label>
            <input type="number" id="anchorX" step="0.1" min="0" max="1" value="0"/>
            <span class="sublabel">0 = gauche · 0.5 = centre · 1 = droite</span>
          </div>
          <div class="form-group">
            <label>Ancre Y</label>
            <input type="number" id="anchorY" step="0.1" min="0" max="1" value="0"/>
            <span class="sublabel">0 = haut · 0.5 = milieu · 1 = bas</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>⚙️ Appliquer à</h3>
        <div class="form-group">
          <label class="check">
            <input type="checkbox" id="doTiles" checked/>
            Tuiles <span style="opacity:0.6;font-weight:normal;margin-left:4px;">(${tilesLabel})</span>
          </label>
        </div>
        <div class="form-group">
          <label class="check">
            <input type="checkbox" id="doDrawings" checked/>
            Dessins <span style="opacity:0.6;font-weight:normal;margin-left:4px;">(${drawingsLabel})</span>
          </label>
        </div>
        <p class="hint">Sans sélection active, toutes les tuiles et tous les dessins de la scène sont modifiés.</p>
      </div>

    </form>
  `,
  render: (html) => {
    html.find(".preset-btn").on("click", function () {
      html.find(".preset-btn").removeClass("active");
      $(this).addClass("active");
      html.find("#anchorX").val($(this).data("x"));
      html.find("#anchorY").val($(this).data("y"));
    });

    // Préréglage "Haut-gauche" (x=0, y=0) actif par défaut.
    html.find(".preset-btn[data-idx='0']").addClass("active");
  },
  buttons: {
    ok: {
      icon: '<i class="fas fa-check"></i>',
      label: "Appliquer",
      callback: async (html) => {
        const anchorX    = Number(html.find("#anchorX").val());
        const anchorY    = Number(html.find("#anchorY").val());
        const doTiles    = html.find("#doTiles").is(":checked");
        const doDrawings = html.find("#doDrawings").is(":checked");

        const tiles = doTiles
          ? (hasSelection ? selectedTiles.map(t => t.document) : canvas.scene.tiles.contents)
          : [];
        const drawings = doDrawings
          ? (hasSelection ? selectedDrawings.map(d => d.document) : canvas.scene.drawings.contents)
          : [];

        if (tiles.length === 0 && drawings.length === 0) {
          ui.notifications.warn("Aucune tuile ni dessin trouvé (ou sélection vide) sur cette scène.");
          return;
        }

        if (tiles.length > 0) {
          await canvas.scene.updateEmbeddedDocuments("Tile",
            tiles.map(t => ({ _id: t.id, texture: { anchorX, anchorY } }))
          );
        }
        if (drawings.length > 0) {
          await canvas.scene.updateEmbeddedDocuments("Drawing",
            drawings.map(d => ({ _id: d.id, shape: { anchorX, anchorY } }))
          );
        }

        ui.notifications.info(`Ancre mise à (${anchorX}, ${anchorY}) pour ${tiles.length} tuile(s) et ${drawings.length} dessin(s).`);
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
