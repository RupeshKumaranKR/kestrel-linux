# ==============================================================================
# Kestrel Linux v1.0.0 ("Peregrine") — Developer Makefile
# ==============================================================================
DISTRO_SLUG    := kestrel-linux
DISTRO_VERSION := 1.0.0
ARCH           := x86_64
ISO_FILE       := out/$(DISTRO_SLUG)-$(DISTRO_VERSION)-$(ARCH).iso

.PHONY: all iso rootfs docker-package run-qemu test clean

all: iso

iso:
	chmod +x ./build-iso.sh ./rootfs/init ./rootfs/bin/kpkg
	./build-iso.sh

rootfs: iso
	@echo "RootFS tarball available at out/$(DISTRO_SLUG)-$(DISTRO_VERSION)-$(ARCH)-rootfs.tar.gz"

docker-package:
	docker build -t ghcr.io/rupeshkumarankr/$(DISTRO_SLUG):$(DISTRO_VERSION) -t ghcr.io/rupeshkumarankr/$(DISTRO_SLUG):latest .

run-qemu:
	qemu-system-$(ARCH) \
		-cdrom $(ISO_FILE) \
		-m 512M \
		-serial stdio

test:
	npx --yes tsx --test src/utils/distroCore.test.ts

clean:
	rm -rf ./build ./out
