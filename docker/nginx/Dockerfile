FROM nginx:1.27-alpine

RUN apk add --no-cache gettext

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/proxy_params /etc/nginx/proxy_params
COPY docker/nginx/conf.d/vibevault.conf /etc/nginx/conf.d/vibevault.conf
COPY docker/nginx/conf.d/vibevault.https.conf /etc/nginx/templates/vibevault.https.conf.template

COPY docker/nginx/docker-entrypoint.sh /docker-entrypoint.d/40-envsubst-https.sh
RUN chmod +x /docker-entrypoint.d/40-envsubst-https.sh
