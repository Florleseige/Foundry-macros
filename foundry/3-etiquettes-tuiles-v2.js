// Macro : Créer un texte sous chaque tuile avec le nom de son image

function processFilename(filename, opts) {
  let result = filename;
  let usedSplit = false;
  let beforePart = null;

  if (opts.splitEnabled && opts.splitChar && result.includes(opts.splitChar)) {
    const lastIndex = result.lastIndexOf(opts.splitChar);
    beforePart = result.substring(0, lastIndex);           // ce qui précède le séparateur
    result = result.substring(lastIndex + opts.splitChar.length); // ce qui suit le séparateur
    usedSplit = true;
  }

  if (opts.removeTrailingNumber) {
    result = result.replace(/\d+$/, "");
  }

  // Repli : si SPLIT + suppression du numéro donne un résultat vide, on prend ce qui précède le séparateur
  if (usedSplit && opts.removeTrailingNumber && result.trim() === "" && beforePart !== null) {
    result = beforePart.replace(/\d+$/, "");
  }

  return result.trim();
}

const selected = canvas.tiles.controlled;
const tiles = selected.length > 0 ? selected.map(t => t.document) : canvas.scene.tiles.contents;

if (tiles.length === 0) {
  ui.notifications.warn("Aucune tuile trouvée sur cette scène.");
} else {
  new Dialog({
    title: "Étiquettes de tuiles",
    content: `
      <form>
        <p>Tuiles : ${selected.length > 0 ? `${selected.length} sélectionnée(s)` : `${tiles.length} sur la scène (aucune sélection)`}</p>
        <div class="form-group">
          <label>Hauteur du texte (px)</label>
          <input type="number" id="textHeight" min="1" value="72"/>
        </div>
        <div class="form-group">
          <label>Couleur du texte</label>
          <input type="color" id="textColor" value="#ffffff"/>
        </div>
        <div class="form-group">
          <label>Police</label>
          <input type="text" id="fontFamily" value="Signika"/>
        </div>
        <div class="form-group">
          <label>Taille de police</label>
          <input type="number" id="fontSize" min="1" value="48"/>
        </div>
        <hr/>
        <div class="form-group">
          <label><input type="checkbox" id="splitEnabled" checked/> Ne garder que ce qui suit le séparateur</label>
        </div>
        <div class="form-group">
          <label>Caractère séparateur</label>
          <input type="text" id="splitChar" maxlength="3" value="-"/>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="removeTrailingNumber" checked/> Retirer un numéro en fin de nom</label>
        </div>
      </form>
    `,
    buttons: {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "Créer",
        callback: async (html) => {
          const opts = {
            textHeight: Number(html.find("#textHeight").val()) || 72,
            textColor: html.find("#textColor").val() || "#ffffff",
            fontFamily: html.find("#fontFamily").val() || "Signika",
            fontSize: Number(html.find("#fontSize").val()) || 48,
            splitEnabled: html.find("#splitEnabled").is(":checked"),
            splitChar: html.find("#splitChar").val() || "-",
            removeTrailingNumber: html.find("#removeTrailingNumber").is(":checked")
          };

          const drawings = tiles.map(t => {
            const src = t.texture?.src ?? "sans_nom";
            const rawFilename = decodeURIComponent(src.split("/").pop()).replace(/\.[^/.]+$/, "");
            const filename = processFilename(rawFilename, opts);

            return {
              type: "t",
              text: filename,
              x: t.x,
              y: t.y + t.height,
              shape: {
                width: t.width,
                height: opts.textHeight
              },
              fontFamily: opts.fontFamily,
              fontSize: opts.fontSize,
              textColor: opts.textColor,
              textAlpha: 1,
              fillType: 0,
              fillAlpha: 0,
              strokeWidth: 0,
              strokeAlpha: 0
            };
          });

          await canvas.scene.createEmbeddedDocuments("Drawing", drawings);
          ui.notifications.info(`${drawings.length} texte(s) créé(s) sous les tuiles.`);
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annuler"
      }
    },
    default: "ok"
  }).render(true);
}
