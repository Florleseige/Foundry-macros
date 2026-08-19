// =============================================================================
// Macro : Étiquettes de tuiles — créer un texte sous ou au-dessus de chaque tuile
// Version : 2.0.0  (2026-08-19)
// Auteur  : Florleseige
// Système : FoundryVTT (générique)
// =============================================================================
//
// USAGE :
// - Sélectionner des tuiles pour n'étiqueter que celles-ci.
// - Sans sélection, toutes les tuiles de la scène active sont étiquetées.
// - Chaque étiquette est créée comme un dessin de type texte, positionné
//   juste sous (ou au-dessus de) la tuile selon l'option choisie.
//
// OPTIONS :
// - Police, taille et couleur du texte.
// - Position : sous la tuile ou au-dessus.
// - Hauteur de la zone texte en pixels de scène.
// - Fond de couleur optionnel (fillColor, fillAlpha).
// - Traitement du nom de fichier : séparateur, suppression des numéros finaux.
//
// -----------------------------------------------------------------------------
// HISTORIQUE
// -----------------------------------------------------------------------------
// v2.0.0 - Refonte graphique : sections encadrées, CSS variables, options
//          position (dessus/dessous), fond de couleur, sublabels, hints.
// v1.0.0 - Version initiale : texte centré sous les tuiles.
// =============================================================================

function processFilename(filename, opts) {
  let result = filename;
  let usedSplit = false;
  let beforePart = null;

  if (opts.splitEnabled && opts.splitChar && result.includes(opts.splitChar)) {
    const lastIndex = result.lastIndexOf(opts.splitChar);
    beforePart = result.substring(0, lastIndex);
    result     = result.substring(lastIndex + opts.splitChar.length);
    usedSplit  = true;
  }

  if (opts.removeTrailingNumber) {
    result = result.replace(/\d+$/, "");
  }

  // Repli : SPLIT + suppression de numéro sur un nom vide → prendre ce qui précède le séparateur.
  if (usedSplit && opts.removeTrailingNumber && result.trim() === "" && beforePart !== null) {
    result = beforePart.replace(/\d+$/, "");
  }

  return result.trim();
}

const selected  = canvas.tiles.controlled;
const tiles     = selected.length > 0 ? selected.map(t => t.document) : canvas.scene.tiles.contents;
const selLabel  = selected.length > 0
  ? `${selected.length} tuile(s) sélectionnée(s)`
  : `${tiles.length} tuile(s) sur la scène (aucune sélection)`;

if (tiles.length === 0) {
  ui.notifications.warn("Aucune tuile trouvée sur cette scène.");
} else {
  new Dialog({
    title: "Étiquettes de tuiles",
    content: `
      <style>
        .etiq-form {
          font-size: 14px; line-height: 1.55;
          --k-gold: #b08d3f; --k-gold-soft: rgba(176,141,63,0.14);
          --k-line: rgba(130,120,100,0.32);
        }
        .etiq-form .section {
          border: 1px solid var(--k-line); border-radius: 8px;
          padding: 12px 14px 14px 14px; margin-bottom: 12px;
          background: rgba(255,255,255,0.045);
        }
        .etiq-form .section > h3 {
          margin: 0 0 10px 0; padding: 0 0 6px 0; border: none;
          border-bottom: 1px solid var(--k-line);
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.09em; color: var(--k-gold);
          display: flex; align-items: center; gap: 7px;
        }
        .etiq-form .section > h3 .count {
          margin-left: auto; font-size: 11px; letter-spacing: 0;
          text-transform: none; opacity: 0.75; font-weight: 600;
        }
        .etiq-form .form-group { display: block; margin-bottom: 11px; }
        .etiq-form .form-group:last-child { margin-bottom: 0; }
        .etiq-form .form-group > label {
          display: block; font-weight: 600; margin-bottom: 4px;
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
          opacity: 0.78;
        }
        .etiq-form input[type="number"],
        .etiq-form input[type="text"],
        .etiq-form select {
          width: 100%; height: 32px; font-size: 14px; padding: 2px 7px;
          border: 1px solid var(--k-line); border-radius: 5px;
          background: rgba(0,0,0,0.06);
        }
        .etiq-form input[type="color"] {
          width: 100%; height: 32px; padding: 2px; cursor: pointer;
          border: 1px solid var(--k-line); border-radius: 5px;
        }
        .etiq-form input:focus, .etiq-form select:focus {
          border-color: var(--k-gold); outline: none;
          box-shadow: 0 0 5px rgba(176,141,63,0.45);
        }
        .etiq-form .sublabel {
          display: block; font-size: 11.5px; opacity: 0.65; font-weight: normal;
          margin-top: 3px; line-height: 1.3; text-transform: none; letter-spacing: 0;
        }
        .etiq-form .hint {
          font-size: 12px; opacity: 0.72; line-height: 1.4;
          margin: 6px 0 0 0; font-weight: normal; font-style: italic;
        }
        .etiq-form .form-row { display: flex; gap: 12px; align-items: flex-start; }
        .etiq-form .form-row .form-group { flex: 1 1 0; min-width: 0; margin-bottom: 0; }
        .etiq-form label.check {
          font-weight: 600; display: flex; align-items: flex-start; gap: 8px;
          cursor: pointer; padding: 5px 7px; border-radius: 5px;
          transition: background 0.12s; font-size: 14px; opacity: 1;
          text-transform: none; letter-spacing: normal; margin-bottom: 0;
        }
        .etiq-form label.check:hover { background: var(--k-gold-soft); }
        .etiq-form label.check input[type="checkbox"] {
          margin: 3px 0 0 0; flex: 0 0 auto; transform: scale(1.1);
        }
      </style>
      <form class="etiq-form">

        <div class="section">
          <h3>📌 Sélection <span class="count">${selLabel}</span></h3>
          <p class="hint" style="margin:0;">
            Les étiquettes sont créées comme des dessins de type texte positionnés par rapport à chaque tuile.
          </p>
        </div>

        <div class="section">
          <h3>✏️ Texte</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Police</label>
              <input type="text" id="fontFamily" value="Signika"/>
            </div>
            <div class="form-group">
              <label>Taille (pt)</label>
              <input type="number" id="fontSize" min="1" value="48"/>
            </div>
          </div>
          <div class="form-row" style="margin-top:11px;">
            <div class="form-group">
              <label>Couleur du texte</label>
              <input type="color" id="textColor" value="#ffffff"/>
            </div>
            <div class="form-group">
              <label>Hauteur de la zone (px)</label>
              <input type="number" id="textHeight" min="1" value="72"/>
              <span class="sublabel">Hauteur en pixels de scène</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>📍 Position et fond</h3>
          <div class="form-group">
            <label>Placement</label>
            <select id="position">
              <option value="below" selected>Sous la tuile</option>
              <option value="above">Au-dessus de la tuile</option>
            </select>
          </div>
          <div class="form-group">
            <label class="check">
              <input type="checkbox" id="useFill"/>
              Ajouter un fond de couleur
            </label>
          </div>
          <div class="form-row" id="fillGroup" style="display:none; margin-top:8px;">
            <div class="form-group">
              <label>Couleur du fond</label>
              <input type="color" id="fillColor" value="#000000"/>
            </div>
            <div class="form-group">
              <label>Opacité du fond (%)</label>
              <input type="number" id="fillAlpha" min="0" max="100" value="60"/>
              <span class="sublabel">0 = transparent · 100 = opaque</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>✂️ Traitement du nom de fichier</h3>
          <div class="form-group">
            <label class="check">
              <input type="checkbox" id="splitEnabled" checked/>
              Ne garder que ce qui suit le séparateur
            </label>
          </div>
          <div class="form-group">
            <label>Caractère séparateur</label>
            <input type="text" id="splitChar" maxlength="3" value="-"/>
            <span class="sublabel">Ex : « - » extrait « Gobelin » de « Monstre-Gobelin »</span>
          </div>
          <div class="form-group">
            <label class="check">
              <input type="checkbox" id="removeTrailingNumber" checked/>
              Retirer le numéro en fin de nom
            </label>
            <p class="hint">Ex : « Gobelin2 » → « Gobelin »</p>
          </div>
        </div>

      </form>
    `,
    render: (html) => {
      html.find("#useFill").on("change", function () {
        html.find("#fillGroup").toggle(this.checked);
      });
    },
    buttons: {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "Créer",
        callback: async (html) => {
          const opts = {
            textHeight:           Number(html.find("#textHeight").val()) || 72,
            textColor:            html.find("#textColor").val() || "#ffffff",
            fontFamily:           html.find("#fontFamily").val() || "Signika",
            fontSize:             Number(html.find("#fontSize").val()) || 48,
            position:             html.find("#position").val() || "below",
            useFill:              html.find("#useFill").is(":checked"),
            fillColor:            html.find("#fillColor").val() || "#000000",
            fillAlpha:            (Number(html.find("#fillAlpha").val()) || 60) / 100,
            splitEnabled:         html.find("#splitEnabled").is(":checked"),
            splitChar:            html.find("#splitChar").val() || "-",
            removeTrailingNumber: html.find("#removeTrailingNumber").is(":checked")
          };

          const drawings = tiles.map(t => {
            const src         = t.texture?.src ?? "sans_nom";
            const rawFilename = decodeURIComponent(src.split("/").pop()).replace(/\.[^/.]+$/, "");
            const filename    = processFilename(rawFilename, opts);
            const yPos        = opts.position === "above"
              ? t.y - opts.textHeight
              : t.y + t.height;

            return {
              type: "t",
              text: filename,
              x: t.x,
              y: yPos,
              shape:      { width: t.width, height: opts.textHeight },
              fontFamily: opts.fontFamily,
              fontSize:   opts.fontSize,
              textColor:  opts.textColor,
              textAlpha:  1,
              fillType:   opts.useFill ? 1 : 0,
              fillColor:  opts.useFill ? opts.fillColor : "#000000",
              fillAlpha:  opts.useFill ? opts.fillAlpha : 0,
              strokeWidth: 0,
              strokeAlpha: 0
            };
          });

          await canvas.scene.createEmbeddedDocuments("Drawing", drawings);
          ui.notifications.info(`${drawings.length} étiquette(s) créée(s).`);
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annuler"
      }
    },
    default: "ok"
  }, {
    width: 560,
    height: "auto",
    resizable: true
  }).render(true);
}
