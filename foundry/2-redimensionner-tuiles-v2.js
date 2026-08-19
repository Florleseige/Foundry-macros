// Macro : Redimensionner les tuiles à une hauteur choisie en conservant le ratio
// Cocher "Restaurer" restaure uniquement les tuiles qui ont une taille d'origine enregistrée (les autres ne sont pas modifiées)

const FLAG_SCOPE = "world";
const FLAG_KEY = "originalTileSize";

const selected = canvas.tiles.controlled;
const tiles = selected.length > 0 ? selected.map(t => t.document) : canvas.scene.tiles.contents;

if (tiles.length === 0) {
  ui.notifications.warn("Aucune tuile trouvée sur cette scène.");
} else {
  const toResize = tiles.filter(t => !t.getFlag(FLAG_SCOPE, FLAG_KEY));
  const toRestore = tiles.filter(t => t.getFlag(FLAG_SCOPE, FLAG_KEY));

  new Dialog({
    title: "Redimensionner les tuiles",
    content: `
      <form>
        <p>Tuiles : ${selected.length > 0 ? `${selected.length} sélectionnée(s)` : `${tiles.length} sur la scène (aucune sélection)`}</p>
        <p>${toResize.length} tuile(s) à redimensionner, ${toRestore.length} à restaurer.</p>
        <div class="form-group">
          <label>Hauteur cible (px)</label>
          <input type="number" id="targetHeight" min="1" value="600"/>
        </div>
        <div class="form-group">
          <label><input type="checkbox" id="doRestore"/> Restaurer la taille d'origine (au lieu de redimensionner)</label>
        </div>
      </form>
    `,
    buttons: {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "Appliquer",
        callback: async (html) => {
          const TARGET_HEIGHT = Number(html.find("#targetHeight").val()) || 600;
          const doRestore = html.find("#doRestore").is(":checked");

          if (doRestore) {
            if (toRestore.length === 0) {
              ui.notifications.warn("Aucune tuile à restaurer.");
              return;
            }

            const updates = toRestore.map(t => {
              const savedSize = t.getFlag(FLAG_SCOPE, FLAG_KEY);
              return {
                _id: t.id,
                width: savedSize.width,
                height: savedSize.height,
                [`flags.${FLAG_SCOPE}.-=${FLAG_KEY}`]: null
              };
            });

            await canvas.scene.updateEmbeddedDocuments("Tile", updates);
            ui.notifications.info(`${updates.length} tuile(s) remise(s) à leur taille d'origine.`);
          } else {
            const updates = tiles.map(t => {
              const ratio = t.width / t.height;
              const newHeight = TARGET_HEIGHT;
              const newWidth = newHeight * ratio;
              const savedSize = t.getFlag(FLAG_SCOPE, FLAG_KEY);

              return savedSize
                ? { _id: t.id, width: newWidth, height: newHeight }
                : {
                    _id: t.id,
                    width: newWidth,
                    height: newHeight,
                    [`flags.${FLAG_SCOPE}.${FLAG_KEY}`]: { width: t.width, height: t.height }
                  };
            });

            await canvas.scene.updateEmbeddedDocuments("Tile", updates);
            ui.notifications.info(`${updates.length} tuile(s) redimensionnée(s) à ${TARGET_HEIGHT}px de haut.`);
          }
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
