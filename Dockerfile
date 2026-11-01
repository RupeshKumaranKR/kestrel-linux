# ==============================================================================
# Kestrel Linux v1.0.0 ("Peregrine") — Official OCI Container & RootFS Image
# Published automatically to: ghcr.io/rupeshkumarankr/kestrel-linux:latest
# ==============================================================================
FROM alpine:3.21 AS rootfs-stage

# Install static busybox & core networking utilities
RUN apk add --no-cache busybox-static curl dropbear git nftables

# Copy Kestrel Linux custom rootfs hierarchy, PID 1 /init, /etc/os-release, and /bin/kpkg
COPY rootfs/ /
COPY packages/ /var/cache/kpkg/

RUN chmod +x /init /bin/kpkg && \
    mkdir -p /home/root /var/lib/kpkg /var/log /tmp && \
    cp /var/cache/kpkg/INDEX.kpkg /var/lib/kpkg/installed

WORKDIR /home/root
ENV HOME=/home/root \
    TERM=xterm-256color \
    PATH=/bin:/sbin:/usr/bin:/usr/sbin

CMD ["/bin/sh", "-l"]
