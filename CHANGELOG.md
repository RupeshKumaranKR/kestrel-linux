# Changelog

All notable changes to **Kestrel Linux** are documented in this file.

## [1.0.0] - "Peregrine" (2026-11-01)

### Added
- **Core Distribution RootFS (`rootfs/`)**:
  - PID 1 `/init` initialization script mounting `/proc`, `/sys`, `/dev`, `/dev/pts`, and `/tmp`.
  - `/bin/kpkg` POSIX package manager with package listing, search, and manifest inspection (`packages/INDEX.kpkg`).
  - Standard `/etc/os-release`, `/etc/fstab`, `/etc/inittab`, `/etc/hostname`, and `/etc/motd`.
- **Reproducible Build & CI/CD Pipeline**:
  - `build-iso.sh` supporting fast hybrid BIOS/UEFI GRUB ISO generation (`kestrel-linux-1.0.0-x86_64.iso`), standalone `rootfs.tar.gz`, `kpkg-repo.tar.gz`, and `SHA256SUMS` (plus `--from-source` kernel/BusyBox compilation).
  - `.github/workflows/release-and-package.yml` automated workflow that publishes **GitHub Releases (`v1.0.0`)** and pushes the **OCI Container Package (`ghcr.io/rupeshkumarankr/kestrel-linux:latest`)** to **GitHub Packages**.
- **Interactive Web Distro Studio (`src/`)**:
  - Live browser POSIX terminal (`neofetch`, `kpkg`, `dmesg`, `uname`, `ls`, `cat`, `build-iso`).
  - Virtual `initramfs` RootFS file explorer and live config editor.
  - Package manager (`kpkg`) footprint calculator and GitHub repository customizer.
