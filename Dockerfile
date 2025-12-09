FROM jlesage/baseimage-gui:debian-11

ENV APP_NAME="iDRAC 6"  \
    IDRAC_PORT=443      \
    DISPLAY_WIDTH=801   \
    DISPLAY_HEIGHT=621

COPY keycode-hack.c /keycode-hack.c
COPY icon.png /tmp/icon.png

# On essaie d'installer l'icone mais on continue si ça échoue (problème nodejs)
RUN install_app_icon.sh "/tmp/icon.png" || true

RUN apt-get update && \
    apt-get install -y wget software-properties-common libx11-dev gcc xdotool && \
    wget -nc https://cdn.azul.com/zulu/bin/zulu8.68.0.21-ca-jdk8.0.362-linux_amd64.deb && \
    apt-get install -y ./zulu8.68.0.21-ca-jdk8.0.362-linux_amd64.deb && \
    gcc -o /keycode-hack.so /keycode-hack.c -shared -s -ldl -fPIC && \
    apt-get remove -y gcc software-properties-common && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* && \
    rm /keycode-hack.c

RUN mkdir /app && \
    chown ${USER_ID}:${GROUP_ID} /app

RUN rm /usr/lib/jvm/zulu-8-amd64/jre/lib/security/java.security

COPY startapp.sh /startapp.sh
COPY mountiso.sh /mountiso.sh

# Installation du plugin "F-Keys" (F1-F12)
RUN mkdir -p /opt/install
COPY custom-keys.js /opt/install/custom-keys.js
COPY install-custom-keys.sh /etc/cont-init.d/99-install-custom-keys.sh
RUN chmod +x /etc/cont-init.d/99-install-custom-keys.sh

WORKDIR /app
