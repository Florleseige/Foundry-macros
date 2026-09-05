// =============================================================================
// Macro : Aligner les éléments — aligner et répartir tuiles, dessins et tokens
// Version : 1.0.0  (2026-09-05)
// Auteur  : Florleseige
// Système : FoundryVTT (générique)
// Compatibilité : FoundryVTT v14 (build 364)
// =============================================================================
//
// USAGE :
// - Sélectionner au moins deux éléments sur le plateau (tuiles, dessins ou
//   tokens), puis lancer la macro. Le type est détecté automatiquement à partir
//   de la sélection ; les trois types peuvent être traités ensemble.
// - L'alignement horizontal et l'alignement vertical se choisissent séparément :
//   on peut n'en utiliser qu'un seul, ou les deux à la fois.
// - Les calculs se font sur la boîte englobante non pivotée (la rotation des
//   éléments n'est pas prise en compte).
//
// OPTIONS :
// - Alignement horizontal : bords gauches, centres, bords droits.
// - Alignement vertical : bords hauts, milieux, bords bas.
// - Référence : bornes de la sélection ou premier élément sélectionné.
// - Répartition horizontale ou verticale, en espaces égaux ou à écart fixe.
// - Accrochage final des positions sur la grille de la scène.
//
// -----------------------------------------------------------------------------
// HISTORIQUE
// -----------------------------------------------------------------------------
// v1.0.0 - Version initiale : tuiles, dessins et tokens, alignement sur les deux
//          axes, référence au choix, répartition (espaces égaux / écart fixe),
//          accrochage à la grille.
// =============================================================================

const gridSize = canvas.grid?.size ?? canvas.scene.grid.size;

// Chaque type de placeable stocke sa taille à un endroit différent :
// la tuile en pixels sur le document, le dessin dans sa forme, le token en
// cases de grille. Les positions x/y sont en pixels pour les trois.
const TYPES = [
  { type: "Tile",    label: "Tuiles",  layer: canvas.tiles,
    size: d => ({ w: d.width, h: d.height }) },
  { type: "Drawing", label: "Dessins", layer: canvas.drawings,
    size: d => ({ w: d.shape.width, h: d.shape.height }) },
  { type: "Token",   label: "Tokens",  layer: canvas.tokens,
    size: d => ({ w: d.width * gridSize, h: d.height * gridSize }) },
];

const selection = TYPES.flatMap(t =>
  (t.layer?.controlled ?? []).map(p => ({
    type: t.type,
    id:   p.document.id,
    ox:   p.document.x,
    oy:   p.document.y,
    x:    p.document.x,
    y:    p.document.y,
    ...t.size(p.document),
  }))
);

if (selection.length < 2) {
  ui.notifications.warn("Sélectionner au moins deux éléments à aligner (tuiles, dessins ou tokens).");
} else {
  const counts   = TYPES.map(t => ({ ...t, n: selection.filter(b => b.type === t.type).length }))
                        .filter(t => t.n > 0);

  const ALIGN_X = [
    { v: "none",   label: "∅ Aucun" },
    { v: "left",   label: "⬅ Gauches" },
    { v: "center", label: "↔ Centres" },
    { v: "right",  label: "➡ Droits" },
  ];
  const ALIGN_Y = [
    { v: "none",   label: "∅ Aucun" },
    { v: "top",    label: "⬆ Hauts" },
    { v: "middle", label: "↕ Milieux" },
    { v: "bottom", label: "⬇ Bas" },
  ];

  new Dialog({
    title: "Aligner les éléments",
    content: `
      <style>
        .align-form {
          font-size: 14px; line-height: 1.55;
          --k-gold: #b08d3f; --k-gold-soft: rgba(176,141,63,0.14);
          --k-line: rgba(130,120,100,0.32);
        }
        .align-form .section {
          border: 1px solid var(--k-line); border-radius: 8px;
          padding: 12px 14px 14px 14px; margin-bottom: 12px;
          background: rgba(255,255,255,0.045);
        }
        .align-form .section > h3 {
          margin: 0 0 10px 0; padding: 0 0 6px 0; border: none;
          border-bottom: 1px solid var(--k-line);
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.09em; color: var(--k-gold);
          display: flex; align-items: center; gap: 7px;
        }
        .align-form .section > h3 .count {
          margin-left: auto; font-size: 11px; letter-spacing: 0;
          text-transform: none; opacity: 0.75; font-weight: 600;
        }
        .align-form .form-group { display: block; margin-bottom: 11px; }
        .align-form .form-group:last-child { margin-bottom: 0; }
        .align-form .form-group > label {
          display: block; font-weight: 600; margin-bottom: 4px;
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
          opacity: 0.78;
        }
        .align-form input[type="number"],
        .align-form select {
          width: 100%; height: 32px; font-size: 14px; padding: 2px 7px;
          border: 1px solid var(--k-line); border-radius: 5px;
          background: rgba(0,0,0,0.06);
        }
        .align-form input[type="number"]:focus,
        .align-form select:focus {
          border-color: var(--k-gold); outline: none;
          box-shadow: 0 0 5px rgba(176,141,63,0.45);
        }
        .align-form .sublabel {
          display: block; font-size: 11.5px; opacity: 0.65; font-weight: normal;
          margin-top: 3px; line-height: 1.3; text-transform: none; letter-spacing: 0;
        }
        .align-form .hint {
          font-size: 12px; opacity: 0.72; line-height: 1.4;
          margin: 6px 0 0 0; font-weight: normal; font-style: italic;
        }
        .align-form label.check {
          font-weight: 600; display: flex; align-items: flex-start; gap: 8px;
          cursor: pointer; padding: 5px 7px; border-radius: 5px;
          transition: background 0.12s; font-size: 14px; opacity: 1;
          text-transform: none; letter-spacing: normal; margin-bottom: 0;
        }
        .align-form label.check:hover { background: var(--k-gold-soft); }
        .align-form label.check input { margin: 3px 0 0 0; flex: 0 0 auto; transform: scale(1.1); }
        .align-form .preset-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
        }
        .align-form .preset-btn {
          cursor: pointer; border: 1px solid var(--k-line); border-radius: 5px;
          padding: 7px 4px; text-align: center; font-size: 12px; font-weight: 600;
          background: rgba(0,0,0,0.04); transition: border-color 0.12s, background 0.12s;
          user-select: none;
        }
        .align-form .preset-btn:hover { border-color: var(--k-gold); background: var(--k-gold-soft); }
        .align-form .preset-btn.active {
          border-color: #b08d3f; background: rgba(200,170,90,0.28);
          box-shadow: 0 0 6px rgba(176,141,63,0.4);
        }
        .align-form table.info { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .align-form table.info td { padding: 4px 8px 4px 0; vertical-align: top; }
        .align-form table.info td:first-child { font-weight: 600; opacity: 0.7; width: 50%; }
      </style>
      <form class="align-form">

        <div class="section">
          <h3>📌 Sélection <span class="count">${selection.length} élément(s)</span></h3>
          <table class="info">
            ${counts.map(t => `<tr><td>${t.label}</td><td>${t.n}</td></tr>`).join("")}
            <tr><td>Pas de la grille</td><td>${gridSize} px</td></tr>
          </table>
        </div>

        <div class="section">
          <h3>📐 Alignement</h3>
          <div class="form-group">
            <label>Horizontal (axe X)</label>
            <div class="preset-grid" id="gridX">
              ${ALIGN_X.map(a => `<div class="preset-btn" data-v="${a.v}">${a.label}</div>`).join("")}
            </div>
          </div>
          <div class="form-group">
            <label>Vertical (axe Y)</label>
            <div class="preset-grid" id="gridY">
              ${ALIGN_Y.map(a => `<div class="preset-btn" data-v="${a.v}">${a.label}</div>`).join("")}
            </div>
          </div>
          <div class="form-group">
            <label>Référence</label>
            <select id="reference">
              <option value="bounds">Bornes de la sélection</option>
              <option value="first">Premier élément sélectionné</option>
            </select>
            <span class="sublabel">Les bornes couvrent toute la sélection ; le premier élément sert de modèle fixe.</span>
          </div>
        </div>

        <div class="section">
          <h3>↔️ Répartition</h3>
          <div class="form-group">
            <label class="check"><input type="radio" name="distrib" value="none" checked/> Aucune</label>
          </div>
          <div class="form-group">
            <label class="check"><input type="radio" name="distrib" value="h"/> Horizontale (de gauche à droite)</label>
          </div>
          <div class="form-group">
            <label class="check"><input type="radio" name="distrib" value="v"/> Verticale (de haut en bas)</label>
          </div>
          <div id="distribOptions" style="display:none; margin-top:10px;">
            <div class="form-group">
              <label>Espacement</label>
              <select id="gapMode">
                <option value="equal">Espaces égaux entre les éléments</option>
                <option value="fixed">Écart fixe (px)</option>
              </select>
              <span class="sublabel">Les espaces égaux conservent le premier et le dernier élément en place.</span>
            </div>
            <div class="form-group" id="gapGroup" style="display:none;">
              <label>Écart (px)</label>
              <input type="number" id="gapValue" step="1" value="0"/>
              <span class="sublabel">0 = éléments collés · valeur négative = chevauchement</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>🧲 Grille</h3>
          <div class="form-group">
            <label class="check"><input type="checkbox" id="snapGrid"/> Accrocher les positions à la grille</label>
            <p class="hint">Arrondit les coordonnées finales au pas de grille de la scène (${gridSize} px).</p>
          </div>
        </div>

      </form>
    `,
    render: (html) => {
      // Un seul bouton actif par grille ; un second clic revient à « Aucun ».
      html.find(".preset-btn").on("click", function () {
        const wasActive = $(this).hasClass("active");
        $(this).closest(".preset-grid").find(".preset-btn").removeClass("active");
        if (!wasActive) $(this).addClass("active");
      });

      html.find("input[name='distrib']").on("change", function () {
        html.find("#distribOptions").toggle(this.value !== "none");
      });
      html.find("#gapMode").on("change", function () {
        html.find("#gapGroup").toggle(this.value === "fixed");
      });
    },
    buttons: {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "Appliquer",
        callback: async (html) => {
          const alignX  = html.find("#gridX .preset-btn.active").data("v") ?? "none";
          const alignY  = html.find("#gridY .preset-btn.active").data("v") ?? "none";
          const refMode = html.find("#reference").val();
          const distrib = html.find("input[name='distrib']:checked").val();
          const gapMode = html.find("#gapMode").val();
          const gap     = Number(html.find("#gapValue").val()) || 0;
          const snap    = html.find("#snapGrid").is(":checked");

          if (alignX === "none" && alignY === "none" && distrib === "none" && !snap) {
            ui.notifications.warn("Aucune opération sélectionnée (alignement, répartition ou grille).");
            return;
          }

          // Positions de travail : modifiées en mémoire, écrites une seule fois à la fin.
          const boxes = selection;
          const ref   = refMode === "first" ? boxes[0] : null;

          const minX = ref ? ref.x         : Math.min(...boxes.map(b => b.x));
          const maxX = ref ? ref.x + ref.w : Math.max(...boxes.map(b => b.x + b.w));
          const minY = ref ? ref.y         : Math.min(...boxes.map(b => b.y));
          const maxY = ref ? ref.y + ref.h : Math.max(...boxes.map(b => b.y + b.h));

          for (const b of boxes) {
            if (alignX === "left")   b.x = minX;
            if (alignX === "center") b.x = (minX + maxX) / 2 - b.w / 2;
            if (alignX === "right")  b.x = maxX - b.w;
            if (alignY === "top")    b.y = minY;
            if (alignY === "middle") b.y = (minY + maxY) / 2 - b.h / 2;
            if (alignY === "bottom") b.y = maxY - b.h;
          }

          if (distrib !== "none") {
            const [pos, size] = distrib === "h" ? ["x", "w"] : ["y", "h"];
            const ordered = [...boxes].sort((a, b) => a[pos] - b[pos]);
            const start   = ordered[0][pos];
            let step      = gap;

            if (gapMode === "equal") {
              const end   = Math.max(...ordered.map(b => b[pos] + b[size]));
              const total = ordered.reduce((sum, b) => sum + b[size], 0);
              step = (end - start - total) / (ordered.length - 1);
            }

            let cursor = start;
            for (const b of ordered) {
              b[pos] = cursor;
              cursor += b[size] + step;
            }
          }

          if (snap) {
            for (const b of boxes) {
              b.x = Math.round(b.x / gridSize) * gridSize;
              b.y = Math.round(b.y / gridSize) * gridSize;
            }
          }

          // Un appel de mise à jour par type de document, éléments déjà en place ignorés.
          const updates = {};
          for (const b of boxes) {
            const x = Math.round(b.x);
            const y = Math.round(b.y);
            if (x === b.ox && y === b.oy) continue;
            (updates[b.type] ??= []).push({ _id: b.id, x, y });
          }

          const moved = Object.values(updates).reduce((sum, u) => sum + u.length, 0);
          if (moved === 0) {
            ui.notifications.info("Les éléments sont déjà en place, aucune modification.");
            return;
          }

          for (const [type, docs] of Object.entries(updates)) {
            await canvas.scene.updateEmbeddedDocuments(type, docs);
          }

          ui.notifications.info(`${moved} élément(s) déplacé(s) sur ${boxes.length} sélectionné(s).`);
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
}
