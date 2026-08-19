// Macro : Mettre l'ancre des tuiles et/ou des dessins à une position choisie (0,0 par défaut)
// Si des tuiles/dessins sont sélectionnés, on ne modifie que ceux-ci.
// Sinon, on modifie toutes les tuiles et tous les dessins de la scène active.

const selectedTiles = canvas.tiles.controlled;
const selectedDrawings = canvas.drawings.controlled;
const hasSelection = selectedTiles.length > 0 || selectedDrawings.length > 0;
const sceneTilesCount = canvas.scene.tiles.contents.length;
const sceneDrawingsCount = canvas.scene.drawings.contents.length;

new Dialog({
  title: "Définir l'ancre",
  content: `
    <form>
      <p>
        Tuiles : ${hasSelection ? `${selectedTiles.length} sélectionnée(s)` : `${sceneTilesCount} sur la scène (aucune sélection)`}<br/>
        Dessins : ${hasSelection ? `${selectedDrawings.length} sélectionnée(s)` : `${sceneDrawingsCount} sur la scène (aucune sélection)`}
      </p>
      <div class="form-group">
        <label>Ancre X (0 à 1)</label>
        <input type="number" id="anchorX" step="0.1" min="0" max="1" value="0"/>
      </div>
      <div class="form-group">
        <label>Ancre Y (0 à 1)</label>
        <input type="number" id="anchorY" step="0.1" min="0" max="1" value="0"/>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="doTiles" checked/> Appliquer aux tuiles</label>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="doDrawings" checked/> Appliquer aux dessins</label>
      </div>
    </form>
  `,
  buttons: {
    ok: {
      icon: '<i class="fas fa-check"></i>',
      label: "Appliquer",
      callback: async (html) => {
        const anchorX = Number(html.find("#anchorX").val()) || 0;
        const anchorY = Number(html.find("#anchorY").val()) || 0;
        const doTiles = html.find("#doTiles").is(":checked");
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
          const tileUpdates = tiles.map(t => ({
            _id: t.id,
            texture: { anchorX, anchorY }
          }));
          await canvas.scene.updateEmbeddedDocuments("Tile", tileUpdates);
        }

        if (drawings.length > 0) {
          const drawingUpdates = drawings.map(d => ({
            _id: d.id,
            shape: { anchorX, anchorY }
          }));
          await canvas.scene.updateEmbeddedDocuments("Drawing", drawingUpdates);
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
}).render(true);
