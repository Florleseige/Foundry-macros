// Macro : Cacher (ou afficher) les tokens, dessins et/ou tuiles de la scène active

const sceneTokensCount = canvas.scene.tokens.contents.length;
const sceneDrawingsCount = canvas.scene.drawings.contents.length;
const sceneTilesCount = canvas.scene.tiles.contents.length;

new Dialog({
  title: "Cacher / afficher la scène",
  content: `
    <form>
      <div class="form-group">
        <label><input type="radio" name="mode" id="modeHide" value="hide" checked/> Cacher</label>
        <label><input type="radio" name="mode" id="modeShow" value="show"/> Afficher</label>
      </div>
      <hr/>
      <div class="form-group">
        <label><input type="checkbox" id="doTokens" checked/> Tokens (${sceneTokensCount} sur la scène)</label>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="doDrawings" checked/> Dessins (${sceneDrawingsCount} sur la scène)</label>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="doTiles" checked/> Tuiles (${sceneTilesCount} sur la scène)</label>
      </div>
    </form>
  `,
  buttons: {
    ok: {
      icon: '<i class="fas fa-check"></i>',
      label: "Appliquer",
      callback: async (html) => {
        const hidden = html.find("input[name='mode']:checked").val() === "hide";
        const doTokens = html.find("#doTokens").is(":checked");
        const doDrawings = html.find("#doDrawings").is(":checked");
        const doTiles = html.find("#doTiles").is(":checked");

        const tokens = doTokens ? canvas.scene.tokens.contents : [];
        const drawings = doDrawings ? canvas.scene.drawings.contents : [];
        const tiles = doTiles ? canvas.scene.tiles.contents : [];

        if (tokens.length === 0 && drawings.length === 0 && tiles.length === 0) {
          ui.notifications.warn("Aucun token, dessin ou tuile trouvé (ou aucune catégorie sélectionnée).");
          return;
        }

        if (tokens.length > 0) {
          const tokenUpdates = tokens.map(t => ({ _id: t.id, hidden }));
          await canvas.scene.updateEmbeddedDocuments("Token", tokenUpdates);
        }

        if (drawings.length > 0) {
          const drawingUpdates = drawings.map(d => ({ _id: d.id, hidden }));
          await canvas.scene.updateEmbeddedDocuments("Drawing", drawingUpdates);
        }

        if (tiles.length > 0) {
          const tileUpdates = tiles.map(t => ({ _id: t.id, hidden }));
          await canvas.scene.updateEmbeddedDocuments("Tile", tileUpdates);
        }

        const verbe = hidden ? "Cachés" : "Affichés";
        ui.notifications.info(`${verbe} : ${tokens.length} token(s), ${drawings.length} dessin(s), ${tiles.length} tuile(s).`);
      }
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: "Annuler"
    }
  },
  default: "ok"
}).render(true);
