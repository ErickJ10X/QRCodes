#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/qrcode_backup_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

echo "Realizando backup de la base de datos..."

docker exec qr-postgres pg_dump \
    -U ${DB_USER:-qrcode} \
    -d ${DB_NAME:-qrcode} \
    --no-password \
    | gzip > $BACKUP_FILE

echo "Backup completado exitosamente: $BACKUP_FILE"

# mantener solo los ultimos 7 backups
ls -t $BACKUP_DIR/*.sql.gz | tail -n +8 | xargs -r rm
echo "Backups antiguos eliminados"

chmod +x scripts/backup-db.sh
