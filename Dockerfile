# ==============================================================================
# Kestrel Linux v1.0.0 ("Peregrine") — Official OCI Container & RootFS Image
# Published automatically to: ghcr.io/rupeshkumarankr/kestrel-linux:latest
# ==============================================================================
FROM alpine:3.21

# Install static busybox & core networking/security utilities
RUN apk add --no-cache busybox-static curl dropbear git nftables

# Stage Kestrel Linux custom rootfs hierarchy and package index safely
COPY rootfs /tmp/kestrel-rootfs
COPY packages /var/cache/kpkg

RUN cp -rf /tmp/kestrel-rootfs/* / && \
    rm -rf /tmp/kestrel-rootfs && \
    chmod +x /init /bin/kpkg && \
    mkdir -p /home/root /var/lib/kpkg /var/log /tmp && \
    cp -f /var/cache/kpkg/INDEX.kpkg /var/lib/kpkg/installed

WORKDIR /home/root
ENV HOME=/home/root \
    TERM=xterm-256color \
    PATH=/bin:/sbin:/usr/bin:/usr/sbin

CMD ["/bin/sh", "-l"]
