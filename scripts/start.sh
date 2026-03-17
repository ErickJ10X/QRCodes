#!/bin/sh
set -e

# ============================================================
# 1. Descargar GeoLite2-City.mmdb (si hay credenciales)
# ============================================================
if [ -n "$MAXMIND_ACCOUNT_ID" ] && [ -n "$MAXMIND_LICENSE_KEY" ]; then
  GEOIP_DIR=$(dirname "${GEOIP_DB_PATH:-/app/data/geoip/GeoLite2-City.mmdb}")
  mkdir -p "$GEOIP_DIR"

  echo "Descargando GeoLite2-City.mmdb..."
  if wget -q \
    --http-user="$MAXMIND_ACCOUNT_ID" \
    --http-passwd="$MAXMIND_LICENSE_KEY" \
    -O /tmp/geoip.tar.gz \
    "https://download.maxmind.com/geoip/databases/GeoLite2-City/download?suffix=tar.gz"; then
    tar -xzf /tmp/geoip.tar.gz -C /tmp/
    find /tmp -name "GeoLite2-City.mmdb" -exec mv {} "$GEOIP_DIR/" \;
    rm -f /tmp/geoip.tar.gz
    echo "GeoLite2-City.mmdb descargado correctamente en $GEOIP_DIR"
  else
    echo "Advertencia: no se pudo descargar GeoLite2-City.mmdb — el app continuara sin GeoIP"
  fi
else
  echo "MAXMIND_ACCOUNT_ID o MAXMIND_LICENSE_KEY no configurados — omitiendo descarga de GeoIP"
fi

# ============================================================
# 2. Correr migraciones
# ============================================================
echo "Corriendo migraciones..."
bunx prisma migrate deploy

# ============================================================
# 3. Iniciar aplicacion
# ============================================================
echo "Iniciando aplicacion..."
exec bun dist/main.js
