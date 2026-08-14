# ===== Stage 1: Build mkcert and generate localhost cert =====
# golang:1.24.6-bullseye pinned by digest so a forced re-pull cannot silently
# advance to a different image. Digest verified against the image's manifest
# list at registry-1.docker.io/library/golang:1.24.6-bullseye.
FROM golang:1.24.6-bullseye@sha256:2cdc80dc25edcb96ada1654f73092f2928045d037581fa4aa7c40d18af7dd85a AS build
WORKDIR /opt

# Install git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# mkcert release tag + commit SHA immutability:
#   tag  : v1.4.4
#   commit: 2a46726cebac0ff4e1f133d90b4e4c42f1edf44a
# `git checkout` of the SHA guarantees the cloned source cannot move even if
# upstream re-tags v1.4.4. The `git rev-parse --verify HEAD` assertion fails
# the build loudly if a future clone ever sources a different commit.
ARG MKCERT_TAG=v1.4.4
ARG MKCERT_COMMIT=2a46726cebac0ff4e1f133d90b4e4c42f1edf44a
RUN git clone https://github.com/FiloSottile/mkcert.git \
    && cd mkcert \
    && git checkout "${MKCERT_TAG}" \
    && test "$(git rev-parse --verify HEAD)" = "${MKCERT_COMMIT}" \
    && go build -ldflags "-X main.Version=${MKCERT_TAG}"

# Generate certs for localhost
WORKDIR /opt/mkcert
RUN ./mkcert localhost \
    && chmod 644 localhost.pem \
    && chmod 644 localhost-key.pem

# ===== Stage 2: Keycloak with TLS certs =====
# quay.io/keycloak/keycloak:26.6.1 pinned by digest so a forced re-pull cannot
# silently advance to a different image. Digest verified against the image's
# manifest index at quay.io/v2/keycloak/keycloak/manifests/26.6.1.
FROM quay.io/keycloak/keycloak:26.6.1@sha256:dea26401d06341095cc4ea9d66896200b55de5ca1daa1d2fcbe58493afa6e0ad

# Copy certs from build stage
COPY --from=build /opt/mkcert/localhost.pem /opt/keycloak/conf/server.crt.pem
COPY --from=build /opt/mkcert/localhost-key.pem /opt/keycloak/conf/server.key.pem

# Set working directory
WORKDIR /opt/keycloak/bin

# Environment variables to tell Keycloak to use the certs
ENV KC_HTTPS_CERTIFICATE_FILE=/opt/keycloak/conf/server.crt.pem \
    KC_HTTPS_CERTIFICATE_KEY_FILE=/opt/keycloak/conf/server.key.pem \
    KC_HOSTNAME=localhost \
    KC_HTTPS_PORT=8443

# Expose HTTPS port
EXPOSE 8443

# Start Keycloak with HTTPS enabled
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--features=organizations"]
