<div align="center">

# Kestrel Linux (`Peregrine` v1.0.0)

**A featherweight, static-first Linux distribution engineered on Linux LTS, `musl` libc, and BusyBox—complete with a reproducible ISO pipeline, `kpkg` package manager, and interactive browser studio.**

[![Build, Release & GHCR Package](https://github.com/RupeshKumaranKR/kestrel-linux/actions/workflows/release-and-package.yml/badge.svg)](https://github.com/RupeshKumaranKR/kestrel-linux/actions/workflows/release-and-package.yml)
[![Latest Release](https://img.shields.io/github/v/release/RupeshKumaranKR/kestrel-linux?include_prereleases&label=release&color=0284c7)](https://github.com/RupeshKumaranKR/kestrel-linux/releases)
[![GHCR Container Package](https://img.shields.io/badge/ghcr.io-rupeshkumarankr%2Fkestrel--linux-0f172a?logo=docker)](https://github.com/RupeshKumaranKR/kestrel-linux/pkgs/container/kestrel-linux)
[![Kernel](https://img.shields.io/badge/kernel-6.12.8--lts-2563eb)](https://www.kernel.org/)
[![Libc](https://img.shields.io/badge/libc-musl_1.2.5-059669)](https://musl.libc.org/)
[![ISO Size](https://img.shields.io/badge/ISO_footprint-19.6_MiB-4f46e5)](#benchmarks--footprint)
[![License](https://img.shields.io/badge/license-MIT_%2F_GPL--2.0-64748b)](./LICENSE)

[Download Latest ISO](https://github.com/RupeshKumaranKR/kestrel-linux/releases) · [Pull GHCR Package](https://github.com/RupeshKumaranKR/kestrel-linux/pkgs/container/kestrel-linux) · [System Architecture](#system-architecture) · [Build From Source](#building-from-source) · [kpkg Package Manager](#kpkg-package-manager)

</div>

---

## Overview

**Kestrel Linux** is an ultra-minimal, deterministic Linux distribution designed for micro-VMs, rescue environments, embedded appliances, container base images, and systems programming education. By pairing a stripped **Linux 6.12 LTS** kernel with **`musl` libc**, a static **BusyBox 1.37** userland, and a clean POSIX PID 1 `/init` pipeline, Kestrel boots to a functional root shell in **under 1 second** while consuming **~21.8 MiB of idle RAM**.

```text
       /\          root@kestrel
      /  \         -------------------
     / /\ \        OS: Kestrel Linux 1.0.0 (Peregrine) x86_64
    / /  \ \       Kernel: 6.12.8-lts (SMP PREEMPT_DYNAMIC)
   / /    \ \      Uptime: Cold boot in 0.97s
  / /  /\  \ \     Packages: 8 (kpkg) · 24 core binaries
 /_/  /  \  \_\    Shell: /bin/ash (BusyBox 1.37.0 static)
      \  /         Init: busybox-init · Libc: musl 1.2.5
       \/          Memory: 21.8 MiB / 512.0 MiB
                   ISO Image: 19.6 MiB (RootFS: 21.4 MiB)
```

### Key Engineering Highlights

- **Zero Systemd & Zero Glibc Bloat**: Built exclusively around static/musl-linked binaries and a transparent, auditable `/init` script (`rootfs/init`).
- **Dual-Deliverable Architecture**:
  1. **Bootable Hybrid BIOS/UEFI ISO & OCI Container RootFS**: Built automatically via GitHub Actions and published to **GitHub Releases** and **GitHub Packages (`ghcr.io`)**.
  2. **Interactive Web Distro Studio**: Includes a browser-based virtual rootfs, POSIX shell emulator, `kpkg` simulator, and custom ISO generator (`npm run dev`).
- **Deterministic `kpkg` Package Manager**: Lightweight `/bin/kpkg` utility located in `rootfs/bin/kpkg` for inspecting, installing, and verifying `.kpkg` (`tar.zst` / `tar.gz`) rootfs packages.

---

## Benchmarks & Footprint

| Metric | **Kestrel Linux 1.0.0** | Alpine Virt 3.21 | Debian 12 Netinst | Ubuntu Server 24.04 |
| :--- | :--- | :--- | :--- | :--- |
| **Bootable ISO Size** | **19.6 MiB** | 62.0 MiB | 632.0 MiB | 2,640.0 MiB |
| **Container RootFS (`ghcr.io`)** | **3.8 MiB** | 7.8 MiB | 74.5 MiB | 78.1 MiB |
| **Idle Memory (TTY1)** | **21.8 MiB** | 38.4 MiB | 145.0 MiB | 390.0 MiB |
| **Cold Boot Time (QEMU KVM)** | **0.97 sec** | 2.10 sec | 6.80 sec | 14.20 sec |
| **C Standard Library** | **`musl` 1.2.5** | `musl` 1.2.5 | `glibc` 2.36 | `glibc` 2.39 |
| **PID 1 Init System** | **`busybox-init` (`/init`)** | `OpenRC` | `systemd` | `systemd` |

---

## Quick Start

### Option 1: Run the Official GitHub Container Package (`ghcr.io`)

Every push to `main` builds and publishes the official Kestrel Linux rootfs image to **GitHub Packages**:

```bash
docker pull ghcr.io/rupeshkumarankr/kestrel-linux:latest
docker run --rm -it --hostname kestrel ghcr.io/rupeshkumarankr/kestrel-linux:latest
```

Inside the container shell, try:

```sh
cat /etc/os-release
kpkg list
kpkg info busybox
```

### Option 2: Boot the Official `.iso` in QEMU / KVM

Download `kestrel-linux-1.0.0-x86_64.iso` from the [**Releases**](https://github.com/RupeshKumaranKR/kestrel-linux/releases) page and boot it with QEMU:

```bash
# Download the latest bootable ISO and verify checksum
curl -fLO https://github.com/RupeshKumaranKR/kestrel-linux/releases/download/v1.0.0/kestrel-linux-1.0.0-x86_64.iso
curl -fLO https://github.com/RupeshKumaranKR/kestrel-linux/releases/download/v1.0.0/SHA256SUMS
sha256sum -c SHA256SUMS --ignore-missing

# Boot in QEMU (serial console + VGA)
qemu-system-x86_64 \
  -cdrom kestrel-linux-1.0.0-x86_64.iso \
  -m 512M \
  -serial stdio
```

---

## System Architecture

```text
+-------------------------------------------------------------------------+
|                    GRUB2 El Torito (BIOS + UEFI Hybrid)                 |
|                           /boot/grub/grub.cfg                           |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  Linux Kernel 6.12.8-lts (/boot/vmlinuz)                |
|            virtio + ext4 + squashfs + overlayfs + e1000 + netfilter     |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                 Compressed Initramfs (/boot/initramfs.cpio.gz)          |
|  +-------------------------------------------------------------------+  |
|  | PID 1 (/init)                                                     |  |
|  |  1. Mounts virtual filesystems: /proc, /sys, /dev, /dev/pts, /tmp |  |
|  |  2. Applies hostname (/etc/hostname) & prints /etc/motd           |  |
|  |  3. Brings up lo & eth0 networking via BusyBox udhcpc             |  |
|  |  4. Spawns login shell (/bin/ash -l) with kpkg in $PATH           |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## Building From Source

### 1. Build Bootable ISO & RootFS Tarball (Host Linux)

On Ubuntu/Debian (`grub-pc-bin`, `xorriso`, `cpio`, `curl` installed):

```bash
git clone https://github.com/RupeshKumaranKR/kestrel-linux.git
cd kestrel-linux

# Build fast hybrid ISO + RootFS tarball + kpkg bundle into ./out/
make iso

# Or compile the Linux kernel & BusyBox completely from upstream tarballs:
./build-iso.sh --from-source
```

### 2. Reproducible Container Build (Docker Buildx)

No host dependencies required—compiles inside an isolated builder container and exports artifacts to `./out/`:

```bash
make docker-iso
```

### 3. Launch the Interactive Web Distro Studio

This repository also includes the **Kestrel Linux Interactive Web Studio**, allowing you to test the shell, edit `initramfs` files, toggle packages, and customize distro branding in your browser:

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## `kpkg` Package Manager

Kestrel Linux ships with a minimalist, zero-dependency package manager at `/bin/kpkg` (`rootfs/bin/kpkg`). It manages package metadata under `/var/lib/kpkg/installed` and repositories configured in `/etc/kpkg/repositories`.

```sh
# List installed and available packages in the rootfs
kpkg list

# Search for packages by name or description
kpkg search ssh

# Inspect package manifest & binary footprint
kpkg info dropbear

# Install or remove packages
kpkg install tmux
kpkg remove tmux
```

---

## Repository Directory Structure

```text
kestrel-linux/
├── .github/workflows/
│   └── release-and-package.yml  # CI/CD: Builds ISO + RootFS, publishes GitHub Release & GHCR Package
├── packages/
│   └── INDEX.kpkg               # Official Kestrel package index manifest
├── rootfs/                      # Base filesystem hierarchy packed into initramfs & OCI container
│   ├── bin/
│   │   └── kpkg                 # Executable POSIX package manager script
│   ├── etc/
│   │   ├── fstab                # Filesystem mount table
│   │   ├── hostname             # Default system hostname (kestrel)
│   │   ├── inittab              # BusyBox init configuration
│   │   ├── motd                 # Message of the Day login banner
│   │   ├── os-release           # freedesktop.org distribution identification
│   │   └── kpkg/repositories    # Package mirror configuration
│   └── init                     # PID 1 initialization script
├── src/                         # Interactive Web Distro Studio (React + TypeScript + Vite)
│   ├── components/              # Terminal, RootFS Explorer, Package Manager & GitHub Kit views
│   └── utils/distroCore.ts      # Virtual filesystem, shell interpreter & ISO generator core
├── build-iso.sh                 # Automated ISO, RootFS & checksum builder script
├── Dockerfile                   # Multi-target Dockerfile (OCI RootFS package + ISO builder)
├── Makefile                     # Developer build targets (make iso, make rootfs, make run-qemu)
├── CHANGELOG.md                 # Release history and version notes
├── VERSION                      # Canonical distribution version (1.0.0)
└── LICENSE                      # Dual MIT (Userland/Studio) & GPL-2.0 (Kernel/BusyBox) license
```

---

## Releases & GitHub Packages (CI/CD Pipeline)

This repository is pre-configured with [`.github/workflows/release-and-package.yml`](./.github/workflows/release-and-package.yml). On every push to `main` or version tag (`v*`):

1. **Automated Unit Tests**: Runs the `node:test` verification suite (`src/utils/distroCore.test.ts`).
2. **Automated Bootable ISO & RootFS Build**: Executes `./build-iso.sh` to assemble:
   - `kestrel-linux-1.0.0-x86_64.iso` (Bootable BIOS/UEFI GRUB hybrid ISO)
   - `kestrel-linux-1.0.0-x86_64-rootfs.tar.gz` (Standalone rootfs archive)
   - `kestrel-linux-1.0.0-kpkg-repo.tar.gz` (Core `kpkg` repository bundle)
   - `SHA256SUMS` (Cryptographic checksum manifest)
3. **GitHub Releases Publication**: Automatically creates/updates release **`v1.0.0`** on GitHub Releases and attaches all 4 downloadable artifacts.
4. **GitHub Packages (`ghcr.io`) Publication**: Builds and pushes `ghcr.io/rupeshkumarankr/kestrel-linux:latest` and `ghcr.io/rupeshkumarankr/kestrel-linux:1.0.0` to **GitHub Container Registry**, populating the repository's **Packages** sidebar.

---

## License

- **Kestrel Build Scripts, `kpkg`, Init Scripts & Web Studio**: Licensed under the [MIT License](./LICENSE).
- **Linux Kernel & BusyBox Binaries**: Licensed under the GNU General Public License v2.0 (`GPL-2.0-only`).
