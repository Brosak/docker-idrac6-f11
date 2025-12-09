#!/bin/sh

# Script d'initialisation pour injecter le menu "F-Keys"
# Execute par s6-overlay au demarrage du conteneur

NOVNC_DIR="/opt/novnc"
INDEX_FILE="$NOVNC_DIR/index.html"
# On copie le script sous un nom generique final
JS_FILE="$NOVNC_DIR/custom-keys.js"
# Source depuis l'image Docker
SOURCE_JS="/opt/install/custom-keys.js"

echo "[Keys-Plugin] Debut de l'installation..."

# 1. Copier le script JS
if [ -f "$SOURCE_JS" ]; then
    cp "$SOURCE_JS" "$JS_FILE"
    chmod 644 "$JS_FILE"
    echo "[Keys-Plugin] Script JS copie vers $JS_FILE"
else
    echo "[Keys-Plugin] ERREUR: Fichier source $SOURCE_JS introuvable !"
    exit 0
fi

# 2. Modifier index.html
if [ -f "$INDEX_FILE" ]; then
    # Verifier si deja injecte
    if grep -q "custom-keys.js" "$INDEX_FILE"; then
        echo "[Keys-Plugin] Deja installe dans index.html."
    else
        # Supprimer les anciennes injections (nettoyage si upgrade)
        sed -i '/f11-injector.js/d' "$INDEX_FILE"
        
        # Injection propre
        sed -i 's|</body>|    <script src="custom-keys.js"></script>\n</body>|' "$INDEX_FILE"
        echo "[Keys-Plugin] Balise script injectee dans $INDEX_FILE"
    fi
else
    echo "[Keys-Plugin] ERREUR: $INDEX_FILE introuvable !"
fi
