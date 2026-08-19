// =============================================================================
// Macro : Redimensionner les tuiles — redimensionner ou restaurer les tuiles
// Version : 2.0.0  (2026-08-19)
// Auteur  : Florleseige
// Système : FoundryVTT (générique)
// =============================================================================
//
// USAGE :
// - Sélectionner des tuiles pour ne modifier que celles-ci.
// - Sans sélection, toutes les tuiles de la scène active sont modifiées.
// - La taille d'origine est mémorisée dans un flag sur chaque tuile lors du
//   premier redimensionnement, permettant de la restaurer à tout moment.
//
// OPTIONS :
// - Hauteur cible en pixels (ratio conservé).
// - Largeur cible en pixels (ratio conservé).
// - Pourcentage de la taille actuelle (ex : 50 % pour réduire de moitié).
// - Restaurer la taille d'origine (uniquement les tuiles avec un flag mémorisé).
//
// -----------------------------------------------------------------------------
// HISTORIQUE
// -----------------------------------------------------------------------------
// v2.0.0 - Refonte graphique : sections encadrées, CSS variables, modes
//          supplémentaires (largeur cible, pourcentage), badges, sublabels.
// v1.0.0 - Version initiale : redimensionnement à hauteur cible, restauration.
// =============================================================================

const FLAG_SCOPE = "world";
const FLAG_KEY   = "originalTileSize";

const selected = canvas.tiles.controlled;
const tiles    = selected.length > 0
  ? selected.map(t => t.document)
  : canvas.scene.tiles.contents;

if (tiles.length === 0) {
  ui.notifications.warn("Aucune tuile trouvée sur cette scène.");
} else {
  const toResize  = tiles.filter(t => !t.getFlag(FLAG_SCOPE, FLAG_KEY));
  const toRestore = tiles.filter(t =>  t.getFlag(FLAG_SCOPE, FLAG_KEY));
  const selLabel  = selected.length > 0
    ? `${selected.length} tuile(s) sélectionnée(s)`
    : `${tiles.length} tuile(s) sur la scène`;

  new Dialog({
    title: "Redimensionner les tuiles",
    content: `
      <style>
        .resize-form {
          font-size: 14px; line-height: 1.55;
          --k-gold: #b08d3f; --k-gold-soft: rgba(176,141,63,0.14);
          --k-line: rgba(130,120,100,0.32);
          --k-ok: #2e7d32; --k-ko: #a33;
        }
        .resize-form .section {
          border: 1px solid var(--k-line); border-radius: 8px;
          padding: 12px 14px 14px 14px; margin-bottom: 12px;
          background: rgba(255,255,255,0.045);
        }
        .resize-form .section > h3 {
          margin: 0 0 10px 0; padding: 0 0 6px 0; border: none;
          border-bottom: 1px solid var(--k-line);
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.09em; color: var(--k-gold);
          display: flex; align-items: center; gap: 7px;
        }
        .resize-form .section > h3 .count {
          margin-left: auto; font-size: 11px; letter-spacing: 0;
          text-transform: none; opacity: 0.75; font-weight: 600;
        }
        .resize-form .form-group { display: block; margin-bottom: 11px; }
        .resize-form .form-group:last-child { margin-bottom: 0; }
        .resize-form .form-group > label {
          display: block; font-weight: 600; margin-bottom: 4px;
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
          opacity: 0.78;
        }
        .resize-form input[type="number"],
        .resize-form select {
          width: 100%; height: 32px; font-size: 14px; padding: 2px 7px;
          border: 1px solid var(--k-line); border-radius: 5px;
          background: rgba(0,0,0,0.06);
        }
        .resize-form input[type="number"]:focus,
        .resize-form select:focus {
          border-color: var(--k-gold); outline: none;
          box-shadow: 0 0 5px rgba(176,141,63,0.45);
        }
        .resize-form .sublabel {
          display: block; font-size: 11.5px; opacity: 0.65; font-weight: normal;
          margin-top: 3px; line-height: 1.3; text-transform: none; letter-spacing: 0;
        }
        .resize-form .hint {
          font-size: 12px; opacity: 0.72; line-height: 1.4;
          margin: 6px 0 0 0; font-weight: normal; font-style: italic;
        }
        .resize-form label.check {
          font-weight: 600; display: flex; align-items: flex-start; gap: 8px;
          cursor: pointer; padding: 5px 7px; border-radius: 5px;
          transition: background 0.12s; font-size: 14px; opacity: 1;
          text-transform: none; letter-spacing: normal; margin-bottom: 0;
        }
        .resize-form label.check:hover { background: var(--k-gold-soft); }
        .resize-form label.check input[type="radio"] {
          margin: 3px 0 0 0; flex: 0 0 auto; transform: scale(1.1);
        }
        .resize-form .badge {
          display: inline-block; padding: 1px 7px; border-radius: 10px;
          font-size: 11.5px; font-weight: 700; border: 1px solid currentColor;
        }
        .resize-form .badge.ok   { color: var(--k-ok); background: rgba(46,125,50,0.12); }
        .resize-form .badge.ko   { color: var(--k-ko); background: rgba(170,51,51,0.12); }
        .resize-form .badge.idle { color: #777;        background: rgba(120,120,120,0.12); }
        .resize-form table.info { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .resize-form table.info td { padding: 4px 8px 4px 0; vertical-align: middle; }
        .resize-form table.info td:last-child  { text-align: right; }
      </style>
      <form class="resize-form">

        <div class="section">
          <h3>📌 Sélection <span class="count">${selLabel}</span></h3>
          <table class="info">
            <tr>
              <td>Sans taille mémorisée (redimensionnables)</td>
              <td><span class="badge ok">${toResize.length}</span></td>
            </tr>
            <tr>
              <td>Avec taille mémorisée (restaurables)</td>
              <td><span class="badge ${toRestore.length > 0 ? "idle" : "ko"}">${toRestore.length}</span></td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h3>⚙️ Mode</h3>
          <div class="form-group">
            <label class="check"><input type="radio" name="mode" value="resize" checked/> Redimensionner</label>
          </div>
          <div class="form-group">
            <label class="check"><input type="radio" name="mode" value="restore"/> Restaurer la taille d'origine</label>
            <p class="hint" style="margin-left:33px;">
              Seules les tuiles avec une taille mémorisée sont restaurées (${toRestore.length} tuile(s)).
            </p>
          </div>
        </div>

        <div class="section" id="resizeSection">
          <h3>📐 Dimensions</h3>
          <div class="form-group">
            <label>Méthode</label>
            <select id="resizeMode">
              <option value="height">À une hauteur cible (px)</option>
              <option value="width">À une largeur cible (px)</option>
              <option value="percent">En pourcentage de la taille actuelle</option>
            </select>
          </div>
          <div class="form-group" style="margin-top:10px;">
            <label id="targetLabel">Hauteur cible (px)</label>
            <input type="number" id="targetValue" min="1" value="600"/>
            <span class="sublabel" id="targetSublabel">Hauteur souhaitée — largeur calculée automatiquement (ratio conservé)</span>
          </div>
        </div>

      </form>
    `,
    render: (html) => {
      const refreshMode = () => {
        const isRestore = html.find("input[name='mode']:checked").val() === "restore";
        html.find("#resizeSection").toggle(!isRestore);
      };

      const refreshResizeMode = () => {
        const m = html.find("#resizeMode").val();
        const cfg = {
          height:  ["Hauteur cible (px)", "Hauteur souhaitée — largeur calculée automatiquement (ratio conservé)", 600],
          width:   ["Largeur cible (px)",  "Largeur souhaitée — hauteur calculée automatiquement (ratio conservé)", 600],
          percent: ["Pourcentage (%)", "Ex : 50 pour réduire de moitié, 200 pour doubler la taille actuelle", 100],
        };
        html.find("#targetLabel").text(cfg[m][0]);
        html.find("#targetSublabel").text(cfg[m][1]);
        html.find("#targetValue").val(cfg[m][2]);
      };

      html.find("input[name='mode']").on("change", refreshMode);
      html.find("#resizeMode").on("change", refreshResizeMode);
    },
    buttons: {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "Appliquer",
        callback: async (html) => {
          const mode = html.find("input[name='mode']:checked").val();

          if (mode === "restore") {
            if (toRestore.length === 0) {
              ui.notifications.warn("Aucune tuile à restaurer.");
              return;
            }
            const updates = toRestore.map(t => {
              const saved = t.getFlag(FLAG_SCOPE, FLAG_KEY);
              return {
                _id: t.id,
                width: saved.width,
                height: saved.height,
                [`flags.${FLAG_SCOPE}.-=${FLAG_KEY}`]: null
              };
            });
            await canvas.scene.updateEmbeddedDocuments("Tile", updates);
            ui.notifications.info(`${updates.length} tuile(s) remise(s) à leur taille d'origine.`);
            return;
          }

          const resizeMode  = html.find("#resizeMode").val();
          const targetValue = Number(html.find("#targetValue").val()) || 600;

          const updates = tiles.map(t => {
            const ratio = t.width / t.height;
            let newWidth, newHeight;

            if (resizeMode === "height") {
              newHeight = targetValue;
              newWidth  = newHeight * ratio;
            } else if (resizeMode === "width") {
              newWidth  = targetValue;
              newHeight = newWidth / ratio;
            } else {
              newWidth  = t.width  * (targetValue / 100);
              newHeight = t.height * (targetValue / 100);
            }

            const saved = t.getFlag(FLAG_SCOPE, FLAG_KEY);
            return saved
              ? { _id: t.id, width: newWidth, height: newHeight }
              : { _id: t.id, width: newWidth, height: newHeight,
                  [`flags.${FLAG_SCOPE}.${FLAG_KEY}`]: { width: t.width, height: t.height } };
          });

          await canvas.scene.updateEmbeddedDocuments("Tile", updates);
          const suffix = resizeMode === "percent"
            ? `à ${targetValue} % de leur taille`
            : `à ${targetValue} px de ${resizeMode === "height" ? "haut" : "large"}`;
          ui.notifications.info(`${updates.length} tuile(s) redimensionnée(s) ${suffix}.`);
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
