// Plugin iDRAC: Ajoute un menu déroulant pour les touches F1-F12
(function() {
    console.log("iDRAC Keys Plugin: Chargement...");

    // Codes touches X11 pour F1 à F12
    // F1 = 0xFFBE, F2 = 0xFFBF, etc.
    const F1_KEYSYM = 0xFFBE;

    function sendKey(keysym, keyName) {
        console.log("iDRAC Keys Plugin: Envoi de " + keyName + " (0x" + keysym.toString(16) + ")");
        
        // Détection de l'objet RFB (compatible multiples versions noVNC)
        let rfbObj = null;
        if (typeof UI !== 'undefined' && typeof UI.rfb !== 'undefined') rfbObj = UI.rfb;
        else if (typeof rfb !== 'undefined') rfbObj = rfb;
        else if (window.rfb) rfbObj = window.rfb;

        if (rfbObj) {
            rfbObj.sendKey(keysym);
        } else {
            console.error("iDRAC Keys Plugin: Objet RFB introuvable.");
            alert("Erreur: Non connecté au serveur VNC ?");
        }
    }

    function injectDropdown() {
        // On cherche un élément de la barre d'outils pour s'insérer
        const targetBtn = document.getElementById('clipboardModalButton') || 
                          document.getElementById('fullscreenToggleButton');

        if (targetBtn && targetBtn.parentNode) {
            // Éviter la double injection
            if (document.getElementById('fKeysDropdown')) return true;

            console.log("iDRAC Keys Plugin: Injection du menu...");

            // 1. Création du conteneur (btn-group pour le dropdown)
            const container = document.createElement('div');
            container.className = "btn-group navbar-btn";
            container.id = "fKeysDropdown";
            container.style.marginLeft = "5px";

            // 2. Création du bouton principal du menu
            const btn = document.createElement('button');
            btn.type = "button";
            btn.className = "btn btn-default dropdown-toggle";
            btn.setAttribute("data-toggle", "dropdown"); // Bootstrap magic
            btn.setAttribute("aria-haspopup", "true");
            btn.setAttribute("aria-expanded", "false");
            btn.style.fontWeight = "bold";
            // Icône clavier + texte + flèche
            btn.innerHTML = '<i class="fa fa-keyboard-o"></i> F-Keys <span class="caret"></span>';

            // 3. Création de la liste déroulante (ul)
            const menu = document.createElement('ul');
            menu.className = "dropdown-menu dropdown-menu-right"; // Alignement à droite
            menu.style.backgroundColor = "rgba(0, 0, 0, 0.9)"; // Fond sombre pour lisibilité
            menu.style.minWidth = "100px";

            // Génération des items F1 à F12
            for (let i = 1; i <= 12; i++) {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = "#";
                a.innerHTML = `<strong>F${i}</strong>`;
                a.style.color = "#fff";
                a.style.padding = "5px 15px";
                a.style.textAlign = "center";
                
                // Style au survol
                a.onmouseover = function() { this.style.backgroundColor = "#d9534f"; };
                a.onmouseout = function() { this.style.backgroundColor = "transparent"; };

                // Action au clic
                a.onclick = function(e) {
                    e.preventDefault();
                    // Calcul du keysym : F1 + (i-1)
                    sendKey(F1_KEYSYM + (i - 1), "F" + i);
                };

                li.appendChild(a);
                menu.appendChild(li);
            }

            // Assemblage
            container.appendChild(btn);
            container.appendChild(menu);
            targetBtn.parentNode.insertBefore(container, targetBtn.nextSibling);

            return true;
        }
        return false;
    }

    // Boucle d'attente de l'interface
    const checkTimer = setInterval(function() {
        if (injectDropdown()) {
            clearInterval(checkTimer);
        }
    }, 1000);
})();
