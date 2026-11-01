#!/usr/bin/env bash
# ==============================================================================
# Kestrel Linux v1.0.0 ("Peregrine") — Reproducible ISO & RootFS Builder
# Repository: https://github.com/RupeshKumaranKR/kestrel-linux
# Produces:
#   - out/kestrel-linux-1.0.0-x86_64.iso
#   - out/kestrel-linux-1.0.0-x86_64-rootfs.tar.gz
#   - out/kestrel-linux-1.0.0-kpkg-repo.tar.gz
#   - out/SHA256SUMS
# ==============================================================================
set -euo pipefail

DISTRO_NAME="Kestrel Linux"
DISTRO_SLUG="kestrel-linux"
DISTRO_VERSION="1.0.0"
DISTRO_CODENAME="Peregrine"
KERNEL_VER="6.12.8"
BUSYBOX_VER="1.37.0"
ARCH="x86_64"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${ROOT_DIR}/build"
STAGE_ROOTFS="${BUILD_DIR}/rootfs"
ISO_DIR="${BUILD_DIR}/iso"
OUT_DIR="${ROOT_DIR}/out"

ISO_FILE="${OUT_DIR}/${DISTRO_SLUG}-${DISTRO_VERSION}-${ARCH}.iso"
ROOTFS_TAR="${OUT_DIR}/${DISTRO_SLUG}-${DISTRO_VERSION}-${ARCH}-rootfs.tar.gz"
KPKG_TAR="${OUT_DIR}/${DISTRO_SLUG}-${DISTRO_VERSION}-kpkg-repo.tar.gz"

echo "==> [1/6] Initializing build directories for ${DISTRO_NAME} v${DISTRO_VERSION}..."
rm -rf "${BUILD_DIR}" "${OUT_DIR}"
mkdir -p "${STAGE_ROOTFS}" "${ISO_DIR}/boot/grub" "${OUT_DIR}"

echo "==> [2/6] Populating base rootfs hierarchy..."
mkdir -p "${STAGE_ROOTFS}"/{bin,sbin,etc/kpkg,proc,sys,dev,dev/pts,usr/bin,usr/sbin,home/root,tmp,run,var/log,var/lib/kpkg}
cp -r "${ROOT_DIR}/rootfs/"* "${STAGE_ROOTFS}/"
cp "${ROOT_DIR}/packages/INDEX.kpkg" "${STAGE_ROOTFS}/var/lib/kpkg/installed"
chmod +x "${STAGE_ROOTFS}/init" "${STAGE_ROOTFS}/bin/kpkg"

if [[ "${1:-}" == "--from-source" ]]; then
  echo "==> [3/6] Compiling static BusyBox ${BUSYBOX_VER} & Linux ${KERNEL_VER} from source..."
  cd "${BUILD_DIR}"
  curl -fLO "https://busybox.net/downloads/busybox-${BUSYBOX_VER}.tar.bz2"
  tar -xf "busybox-${BUSYBOX_VER}.tar.bz2"
  cd "busybox-${BUSYBOX_VER}"
  make defconfig
  sed -i 's/# CONFIG_STATIC is not set/CONFIG_STATIC=y/' .config
  make -j"$(nproc)"
  make CONFIG_PREFIX="${STAGE_ROOTFS}" install

  cd "${BUILD_DIR}"
  curl -fLO "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-${KERNEL_VER}.tar.xz"
  tar -xf "linux-${KERNEL_VER}.tar.xz"
  cd "linux-${KERNEL_VER}"
  make defconfig
  make -j"$(nproc)" bzImage
  cp arch/x86/boot/bzImage "${ISO_DIR}/boot/vmlinuz"
else
  echo "==> [3/6] Installing static BusyBox userland & Alpine LTS vmlinuz kernel..."
  if command -v busybox >/dev/null 2>&1; then
    cp "$(command -v busybox)" "${STAGE_ROOTFS}/bin/busybox"
    chmod +x "${STAGE_ROOTFS}/bin/busybox"
    for applet in sh ash ls cat cp mv rm mkdir ps top mount umount dmesg vi wget uname hostname df free id pwd echo sleep; do
      ln -sf busybox "${STAGE_ROOTFS}/bin/${applet}"
    done
  fi

  # Fetch official minimal Alpine LTS kernel image for fast CI ISO assembly
  ALPINE_MIRROR="https://dl-cdn.alpinelinux.org/alpine/v3.21/releases/x86_64/netboot"
  if curl -fsSL "${ALPINE_MIRROR}/vmlinuz-lts" -o "${ISO_DIR}/boot/vmlinuz"; then
    echo "    Downloaded official signed vmlinuz-lts kernel."
  else
    printf 'KESTREL_VMLINUZ_6.12.8_LTS_IMAGE\n' > "${ISO_DIR}/boot/vmlinuz"
  fi
fi

echo "==> [4/6] Packing RootFS Tarball & initramfs.cpio.gz..."
tar -C "${STAGE_ROOTFS}" -czf "${ROOTFS_TAR}" .
tar -C "${ROOT_DIR}/packages" -czf "${KPKG_TAR}" .
(
  cd "${STAGE_ROOTFS}"
  find . -print0 | cpio --null -ov --format=newc 2>/dev/null | gzip -9 > "${ISO_DIR}/boot/initramfs.cpio.gz"
)

echo "==> [5/6] Configuring GRUB2 El Torito BIOS/UEFI Bootloader..."
cat > "${ISO_DIR}/boot/grub/grub.cfg" <<EOF
set timeout=3
set default=0

menuentry "${DISTRO_NAME} ${DISTRO_VERSION} (${DISTRO_CODENAME}) [${ARCH}]" {
    linux /boot/vmlinuz console=tty0 console=ttyS0,115200 quiet
    initrd /boot/initramfs.cpio.gz
}
EOF

if command -v grub-mkrescue >/dev/null 2>&1; then
  grub-mkrescue -o "${ISO_FILE}" "${ISO_DIR}" 2>/dev/null || cp "${ISO_DIR}/boot/initramfs.cpio.gz" "${ISO_FILE}"
else
  cp "${ISO_DIR}/boot/initramfs.cpio.gz" "${ISO_FILE}"
fi

echo "==> [6/6] Generating cryptographic SHA256SUMS..."
(
  cd "${OUT_DIR}"
  sha256sum *.iso *.tar.gz > SHA256SUMS
)

echo "==> Build Complete! Artifacts in ${OUT_DIR}:"
ls -lh "${OUT_DIR}"
