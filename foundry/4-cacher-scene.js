// =============================================================================
// Macro : Cacher / afficher — masquer ou révéler les éléments de la scène active
// Version : 2.1.0  (2026-08-19)
// Auteur  : Florleseige
// Système : FoundryVTT (générique)
// Compatibilité : FoundryVTT v14 (build 364)
// =============================================================================
//
// USAGE :
// - Choisir l'action (Cacher ou Afficher) et les catégories à traiter.
// - Pour les tokens : cibler la sélection en cours ou tous les tokens de la scène.
// - Sans token sélectionné sur le plateau, l'option "sélection" est désactivée.
//
// OPTIONS :
// - Tokens : tous ceux de la scène ou seulement ceux sélectionnés sur le plateau.
// - Dessins, tuiles, sources de lumière ambiante.
//
// -----------------------------------------------------------------------------
// HISTORIQUE
// -----------------------------------------------------------------------------
// v2.1.0 - Ajout de la version FoundryVTT compatible dans l'en-tête.
// v2.0.0 - Refonte graphique : sections encadrées, CSS variables, option sources
//          de lumière, portée des tokens (tous / sélection), sublabels, hints.
// v1.0.0 - Version initiale : tokens, dessins, tuiles.
// =============================================================================

const selectedTokens     = canvas.tokens.controlled;
const sceneTokensCount   = canvas.scene.tokens.contents.length;
const sceneDrawingsCount = canvas.scene.drawings.contents.length;
const sceneTilesCount    = canvas.scene.tiles.contents.length;
const sceneLightsCount   = canvas.scene.lights?.contents?.length ?? 0;

new Dialog({
  title: "Cacher / Afficher — Éléments de la scène",
  content: `
    <style>
      .hide-form {
        font-size: 14px; line-height: 1.55;
        --k-gold: #b08d3f; --k-gold-soft: rgba(176,141,63,0.14);
        --k-line: rgba(130,120,100,0.32);
      }
      .hide-form .section {
        border: 1px solid var(--k-line); border-radius: 8px;
        padding: 12px 14px 14px 14px; margin-bottom: 12px;
        background: rgba(255,255,255,0.045);
      }
      .hide-form .section > h3 {
        margin: 0 0 10px 0; padding: 0 0 6px 0; border: none;
        border-bottom: 1px solid var(--k-line);
        font-size: 12px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.09em; color: var(--k-gold);
        display: flex; align-items: center; gap: 7px;
      }
      .hide-form .form-group { display: block; margin-bottom: 8px; }
      .hide-form .form-group:last-child { margin-bottom: 0; }
      .hide-form .hint {
        font-size: 12px; opacity: 0.72; line-height: 1.4;
        margin: 4px 0 0 33px; font-weight: normal; font-style: italic;
      }
      .hide-form label.check {
        font-weight: 600; display: flex; align-items: flex-start; gap: 8px;
        cursor: pointer; padding: 5px 7px; border-radius: 5px;
        transition: background 0.12s; font-size: 14px; opacity: 1;
        text-transform: none; letter-spacing: normal; margin-bottom: 0;
      }
      .hide-form label.check:hover { background: var(--k-gold-soft); }
      .hide-form label.check input { margin: 3px 0 0 0; flex: 0 0 auto; transform: scale(1.1); }
      .hide-form label.check.disabled { opacity: 0.45; pointer-events: none; }
      .hide-form .count-tag {
        margin-left: auto; font-size: 12px; font-weight: 600;
        opacity: 0.65; font-style: italic;
      }
      .hide-form .sub-group { margin: 4px 0 0 26px; }
    </style>
    <form class="hide-form">

      <div class="section">
        <h3>👁️ Action</h3>
        <div class="form-group">
          <label class="check"><input type="radio" name="mode" value="hide" checked/> Cacher les éléments</label>
        </div>
        <div class="form-group">
          <label class="check"><input type="radio" name="mode" value="show"/> Afficher les éléments</label>
        </div>
      </div>

      <div class="section">
        <h3>📋 Éléments à traiter</h3>

        <div class="form-group">
          <label class="check">
            <input type="checkbox" id="doTokens" checked/>
            Tokens
            <span class="count-tag">${sceneTokensCount} sur la scène${selectedTokens.length > 0 ? ` · ${selectedTokens.length} sélectionné(s)` : ""}</span>
          </label>
          <div class="sub-group" id="tokenScopeGroup">
            <label class="check">
              <input type="radio" name="tokenScope" value="all" checked/>
              Tous les tokens de la scène
            </label>
            <label class="check ${selectedTokens.length === 0 ? "disabled" : ""}">
              <input type="radio" name="tokenScope" value="selected" ${selectedTokens.length === 0 ? "disabled" : ""}/>
              Seulement les tokens sélectionnés (${selectedTokens.length})
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="check">
            <input type="checkbox" id="doDrawings" checked/>
            Dessins
            <span class="count-tag">${sceneDrawingsCount} sur la scène</span>
          </label>
        </div>

        <div class="form-group">
          <label class="check">
            <input type="checkbox" id="doTiles" checked/>
            Tuiles
            <span class="count-tag">${sceneTilesCount} sur la scène</span>
          </label>
        </div>

        <div class="form-group">
          <label class="check">
            <input type="checkbox" id="doLights"/>
            Sources de lumière
            <span class="count-tag">${sceneLightsCount} sur la scène</span>
          </label>
          <p class="hint">Masque ou révèle les sources de lumière ambiante placées sur la scène.</p>
        </div>

      </div>

    </form>
  `,
  render: (html) => {
    html.find("#doTokens").on("change", function () {
      const enabled = this.checked;
      html.find("#tokenScopeGroup input").prop("disabled", !enabled);
      html.find("#tokenScopeGroup label.check").toggleClass("disabled", !enabled);
    });
  },
  buttons: {
    ok: {
      icon: '<i class="fas fa-check"></i>',
      label: "Appliquer",
      callback: async (html) => {
        const hidden     = html.find("input[name='mode']:checked").val() === "hide";
        const doTokens   = html.find("#doTokens").is(":checked");
        const doDrawings = html.find("#doDrawings").is(":checked");
        const doTiles    = html.find("#doTiles").is(":checked");
        const doLights   = html.find("#doLights").is(":checked");
        const tokenScope = html.find("input[name='tokenScope']:checked").val();

        let tokens = [];
        if (doTokens) {
          tokens = tokenScope === "selected" && selectedTokens.length > 0
            ? selectedTokens.map(t => t.document)
            : canvas.scene.tokens.contents;
        }
        const drawings = doDrawings ? canvas.scene.drawings.contents : [];
        const tiles    = doTiles    ? canvas.scene.tiles.contents    : [];
        const lights   = doLights   ? (canvas.scene.lights?.contents ?? []) : [];

        if (tokens.length === 0 && drawings.length === 0 && tiles.length === 0 && lights.length === 0) {
          ui.notifications.warn("Aucun élément à traiter (catégories vides ou non sélectionnées).");
          return;
        }

        if (tokens.length > 0)
          await canvas.scene.updateEmbeddedDocuments("Token",
            tokens.map(t => ({ _id: t.id, hidden })));
        if (drawings.length > 0)
          await canvas.scene.updateEmbeddedDocuments("Drawing",
            drawings.map(d => ({ _id: d.id, hidden })));
        if (tiles.length > 0)
          await canvas.scene.updateEmbeddedDocuments("Tile",
            tiles.map(t => ({ _id: t.id, hidden })));
        if (lights.length > 0)
          await canvas.scene.updateEmbeddedDocuments("AmbientLight",
            lights.map(l => ({ _id: l.id, hidden })));

        const verbe = hidden ? "Cachés" : "Affichés";
        const parts = [
          tokens.length   > 0 && `${tokens.length} token(s)`,
          drawings.length > 0 && `${drawings.length} dessin(s)`,
          tiles.length    > 0 && `${tiles.length} tuile(s)`,
          lights.length   > 0 && `${lights.length} lumière(s)`,
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
