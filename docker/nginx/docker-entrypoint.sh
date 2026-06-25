#!/bin/sh
set -eu

# When USE_HTTPS=true, render vibevault.https.conf from template (requires VIBEVAULT_DOMAIN).
if [ "${USE_HTTPS:-false}" = "true" ] && [ -n "${VIBEVAULT_DOMAIN:-}" ]; then
  envsubst '${VIBEVAULT_DOMAIN}' < /etc/nginx/templates/vibevault.https.conf.template \
    > /etc/nginx/conf.d/vibevault.conf
fi
