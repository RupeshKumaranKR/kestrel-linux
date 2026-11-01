export interface DistroConfig {
  name: string;
  slug: string;
  codename: string;
  version: string;
  kernelVersion: '6.12.8-lts' | '6.13.2-mainline' | '6.6.74-minimal';
  libc: 'musl' | 'glibc' | 'uclibc-ng';
  initSystem: 'busybox-init' | 'openrc' | 'runit';
  shell: 'ash' | 'dash' | 'zsh';
  arch: 'x86_64' | 'aarch64' | 'riscv64';
  githubUser: string;
  hostname: string;
  tagline: string;
}

export type PackageCategory = 'Core' | 'Networking' | 'Development' | 'System' | 'Security';

export interface DistroPackage {
  id: string;
  name: string;
  version: string;
  category: PackageCategory;
  sizeKb: number;
  ramKb: number;
  description: string;
  installed: boolean;
  required?: boolean;
  binaries: string[];
}

export interface VFSFile {
  path: string;
  content: string;
  permissions: string;
  owner: string;
  updatedAt: string;
  readonly?: boolean;
}

export interface DistroMetrics {
  isoSizeMb: number;
  rootfsSizeMb: number;
  idleRamMb: number;
  installedCount: number;
  totalBinaries: number;
  bootTimeSec: number;
}

export interface ShellExecutionResult {
  output: string;
  clear?: boolean;
  newCwd: string;
  updatedFiles?: VFSFile[];
  updatedPackages?: DistroPackage[];
  switchTab?: 'terminal' | 'explorer' | 'packages' | 'github';
}

export interface GeneratedRepoFile {
  path: string;
  language: 'bash' | 'dockerfile' | 'yaml' | 'makefile' | 'markdown' | 'ini';
  description: string;
  content: string;
}

export const DEFAULT_DISTRO_CONFIG: DistroConfig = {
  name: 'Kestrel Linux',
  slug: 'kestrel-linux',
  codename: 'Peregrine',
  version: '1.0.0',
  kernelVersion: '6.12.8-lts',
  libc: 'musl',
  initSystem: 'busybox-init',
  shell: 'ash',
  arch: 'x86_64',
  githubUser: 'rupeshk0392',
  hostname: 'kestrel',
  tagline: 'Featherweight, static-first Linux distribution built on Linux LTS, musl libc, and BusyBox.',
};

export const INITIAL_PACKAGES: DistroPackage[] = [
  {
    id: 'linux-kernel',
    name: 'linux-lts-kestrel',
    version: '6.12.8-r0',
    category: 'Core',
    sizeKb: 11400,
    ramKb: 14200,
    description: 'Compressed vmlinuz kernel image with virtio, ext4, overlayfs, and e1000 net drivers.',
    installed: true,
    required: true,
    binaries: ['vmlinuz'],
  },
  {
    id: 'musl-libc',
    name: 'musl',
    version: '1.2.5-r1',
    category: 'Core',
    sizeKb: 620,
    ramKb: 1100,
    description: 'Lightweight, fast, standards-conformant C standard library for static and dynamic linking.',
    installed: true,
    required: true,
    binaries: ['ld-musl-x86_64.so.1'],
  },
  {
    id: 'busybox-core',
    name: 'busybox',
    version: '1.37.0-r0',
    category: 'Core',
    sizeKb: 980,
    ramKb: 1850,
    description: 'Swiss army knife of embedded Linux providing POSIX coreutils, ash shell, and init.',
    installed: true,
    required: true,
    binaries: ['sh', 'ash', 'ls', 'cat', 'cp', 'mv', 'rm', 'mkdir', 'ps', 'top', 'mount', 'umount', 'dmesg', 'vi', 'wget'],
  },
  {
    id: 'kpkg-manager',
    name: 'kpkg-tools',
    version: '1.0.0-r0',
    category: 'Core',
    sizeKb: 310,
    ramKb: 450,
    description: 'Kestrel signed tar.zst package manager and rootfs transaction verifier.',
    installed: true,
    required: true,
    binaries: ['kpkg'],
  },
  {
    id: 'dropbear-ssh',
    name: 'dropbear',
    version: '2024.86-r0',
    category: 'Networking',
    sizeKb: 420,
    ramKb: 950,
    description: 'Small memory footprint SSH2 server and client for remote administration.',
    installed: true,
    binaries: ['dropbear', 'dbclient', 'dropbearkey'],
  },
  {
    id: 'curl-minimal',
    name: 'curl',
    version: '8.11.1-r0',
    category: 'Networking',
    sizeKb: 740,
    ramKb: 600,
    description: 'Command line tool and library for transferring data with URLs over TLS (rustls).',
    installed: true,
    binaries: ['curl'],
  },
  {
    id: 'wireguard-tools',
    name: 'wireguard-tools',
    version: '1.0.202409-r0',
    category: 'Security',
    sizeKb: 280,
    ramKb: 520,
    description: 'Next-generation kernel VPN tunnel configuration utilities (wg, wg-quick).',
    installed: false,
    binaries: ['wg', 'wg-quick'],
  },
  {
    id: 'git-core',
    name: 'git',
    version: '2.47.1-r0',
    category: 'Development',
    sizeKb: 6800,
    ramKb: 1900,
    description: 'Distributed version control system compiled without Tcl/Tk or Perl bloat.',
    installed: true,
    binaries: ['git'],
  },
  {
    id: 'tmux-mux',
    name: 'tmux',
    version: '3.5a-r0',
    category: 'System',
    sizeKb: 890,
    ramKb: 1400,
    description: 'Terminal multiplexer enabling split panes and persistent background sessions.',
    installed: false,
    binaries: ['tmux'],
  },
  {
    id: 'btop-monitor',
    name: 'btop',
    version: '1.4.0-r0',
    category: 'System',
    sizeKb: 1250,
    ramKb: 2100,
    description: 'Resource monitor showing processor, memory, disks, network and processes.',
    installed: false,
    binaries: ['btop'],
  },
  {
    id: 'neovim-lite',
    name: 'neovim',
    version: '0.10.3-r0',
    category: 'Development',
    sizeKb: 5400,
    ramKb: 3200,
    description: 'Hyperextensible Vim-based text editor built with LuaJIT.',
    installed: false,
    binaries: ['nvim'],
  },
  {
    id: 'gcc-toolchain',
    name: 'gcc-musl-sdk',
    version: '14.2.0-r0',
    category: 'Development',
    sizeKb: 38500,
    ramKb: 4500,
    description: 'C/C++ compiler, binutils, and musl-dev headers for native compilation.',
    installed: false,
    binaries: ['gcc', 'g++', 'ld', 'as', 'make'],
  },
  {
    id: 'nftables-fw',
    name: 'nftables',
    version: '1.1.1-r0',
    category: 'Security',
    sizeKb: 690,
    ramKb: 820,
    description: 'Netfilter packet filtering and classification framework replacing iptables.',
    installed: true,
    binaries: ['nft'],
  },
];

export function slugifyDistroName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'custom-linux';
}

export function calculateDistroMetrics(
  config: DistroConfig,
  packages: DistroPackage[]
): DistroMetrics {
  const installed = packages.filter((p) => p.installed);
  const totalSizeKb = installed.reduce((sum, p) => sum + p.sizeKb, 0);
  const totalRamKb = installed.reduce((sum, p) => sum + p.ramKb, 0);

  const libcOverheadMb = config.libc === 'glibc' ? 8.4 : config.libc === 'uclibc-ng' ? 0.4 : 0;
  const initOverheadRamMb = config.initSystem === 'openrc' ? 3.2 : config.initSystem === 'runit' ? 1.1 : 0.4;

  const rootfsSizeMb = Number((totalSizeKb / 1024 + libcOverheadMb).toFixed(1));
  const isoSizeMb = Number((rootfsSizeMb * 0.72 + 4.2).toFixed(1)); // SquashFS + GRUB El Torito bootloader
  const idleRamMb = Number((totalRamKb / 1024 + initOverheadRamMb).toFixed(1));
  const totalBinaries = installed.reduce((sum, p) => sum + p.binaries.length, 0);

  const baseBoot = config.initSystem === 'busybox-init' ? 0.65 : config.initSystem === 'runit' ? 0.78 : 1.15;
  const bootTimeSec = Number((baseBoot + installed.length * 0.04).toFixed(2));

  return {
    isoSizeMb,
    rootfsSizeMb,
    idleRamMb,
    installedCount: installed.length,
    totalBinaries,
    bootTimeSec,
  };
}

export function generateOsReleaseContent(config: DistroConfig): string {
  const id = config.slug.replace(/-linux$/, '');
  return [
    `NAME="${config.name}"`,
    `ID=${id}`,
    `ID_LIKE="kestrel alpine"`,
    `PRETTY_NAME="${config.name} ${config.version} (${config.codename})"`,
    `VERSION="${config.version}"`,
    `VERSION_ID="${config.version}"`,
    `VERSION_CODENAME="${config.codename.toLowerCase()}"`,
    `HOME_URL="https://github.com/${config.githubUser}/${config.slug}"`,
    `BUG_REPORT_URL="https://github.com/${config.githubUser}/${config.slug}/issues"`,
    `KESTREL_LIBC="${config.libc}"`,
    `KESTREL_INIT="${config.initSystem}"`,
    `KESTREL_ARCH="${config.arch}"`,
  ].join('\n');
}

export function generateInitScriptContent(config: DistroConfig): string {
  return `#!/bin/sh
# ${config.name} (${config.version} "${config.codename}") PID 1 /init
# Architecture: ${config.arch} | Init: ${config.initSystem} | Libc: ${config.libc}

export PATH=/bin:/sbin:/usr/bin:/usr/sbin
export HOME=/home/root
export TERM=linux

mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev
mkdir -p /dev/pts /run /tmp /var/log
mount -t devpts devpts /dev/pts

hostname -F /etc/hostname

echo "------------------------------------------------------------"
echo " Welcome to ${config.name} ${config.version} (${config.codename})"
echo " Kernel $(uname -r) on $(uname -m) (${config.libc})"
echo "------------------------------------------------------------"

# Bring up loopback & DHCP via udhcpc if eth0 exists
ip link set lo up 2>/dev/null
if [ -d /sys/class/net/eth0 ]; then
  ip link set eth0 up 2>/dev/null
  udhcpc -i eth0 -b -q 2>/dev/null &
fi

exec /bin/${config.shell} -l
`;
}

export function buildInitialVFS(config: DistroConfig): VFSFile[] {
  return [
    {
      path: '/etc/os-release',
      content: generateOsReleaseContent(config),
      permissions: '-rw-r--r--',
      owner: 'root:root',
      updatedAt: 'Nov 01 06:00',
    },
    {
      path: '/etc/hostname',
      content: `${config.hostname}\n`,
      permissions: '-rw-r--r--',
      owner: 'root:root',
      updatedAt: 'Nov 01 06:00',
    },
    {
      path: '/etc/motd',
      content: `Welcome to ${config.name} ${config.version} "${config.codename}" (${config.arch})\n * Repo: https://github.com/${config.githubUser}/${config.slug}\n * Type 'help' for shell commands or 'kpkg list' to manage packages.\n`,
      permissions: '-rw-r--r--',
      owner: 'root:root',
      updatedAt: 'Nov 01 06:00',
    },
    {
      path: '/etc/fstab',
      content: [
        '# <file system>  <mount pt>  <type>    <options>          <dump> <pass>',
        'proc             /proc       proc      defaults           0      0',
        'sysfs            /sys        sysfs     defaults           0      0',
        'devtmpfs         /dev        devtmpfs  mode=0755,nosuid   0      0',
        'tmpfs            /tmp        tmpfs     nosuid,nodev       0      0',
      ].join('\n'),
      permissions: '-rw-r--r--',
      owner: 'root:root',
      updatedAt: 'Nov 01 06:00',
    },
    {
      path: '/etc/kpkg/repositories',
      content: [
        `https://mirror.kestrellinux.org/v${config.version.slice(0, 3)}/core/${config.arch}`,
        `https://mirror.kestrellinux.org/v${config.version.slice(0, 3)}/community/${config.arch}`,
      ].join('\n'),
      permissions: '-rw-r--r--',
      owner: 'root:root',
      updatedAt: 'Nov 01 06:00',
    },
    {
      path: '/init',
      content: generateInitScriptContent(config),
      permissions: '-rwxr-xr-x',
      owner: 'root:root',
      updatedAt: 'Nov 01 06:00',
    },
    {
      path: '/home/root/README.md',
      content: [
        `# ${config.name} (${config.codename})`,
        '',
        `${config.tagline}`,
        '',
        '## Quick Verification Commands',
        '- `neofetch` : Display system logo, kernel, memory, and package summary',
        '- `kpkg list` : List installed and available packages',
        '- `kpkg install tmux` : Install a package into the live rootfs',
        '- `cat /etc/os-release` : Inspect OS release metadata',
        '- `build-iso` : Preview the bootable ISO build pipeline',
      ].join('\n'),
      permissions: '-rw-r--r--',
      owner: 'root:root',
      updatedAt: 'Nov 01 06:00',
    },
  ];
}

export function renderNeofetch(config: DistroConfig, packages: DistroPackage[]): string {
  const metrics = calculateDistroMetrics(config, packages);
  const installedNames = packages.filter((p) => p.installed).map((p) => p.name);
  const row1 = installedNames.slice(0, 5).join(', ');
  const row2 = installedNames.slice(5).join(', ');

  return [
    `       /\\          root@${config.hostname}`,
    `      /  \\         -------------------`,
    `     / /\\ \\        OS: ${config.name} ${config.version} (${config.codename}) ${config.arch}`,
    `    / /  \\ \\       Kernel: ${config.kernelVersion}`,
    `   / /    \\ \\      Uptime: 14 mins (boot in ${metrics.bootTimeSec}s)`,
    `  / /  /\\  \\ \\     Packages: ${metrics.installedCount} (kpkg) · ${metrics.totalBinaries} binaries`,
    ` /_/  /  \\  \\_\\    Shell: /bin/${config.shell} (BusyBox 1.37.0)`,
    `      \\  /         Init: ${config.initSystem} · Libc: ${config.libc}`,
    `       \\/          Memory: ${metrics.idleRamMb} MiB / 512.0 MiB`,
    `                   ISO Image: ${metrics.isoSizeMb} MiB (RootFS: ${metrics.rootfsSizeMb} MiB)`,
    `                   Pkgs: ${row1}${row2 ? `\n                         ${row2}` : ''}`,
  ].join('\n');
}

export function normalizePath(cwd: string, target: string): string {
  if (!target || target === '.') return cwd;
  if (target === '~') return '/home/root';
  const raw = target.startsWith('/') ? target : `${cwd === '/' ? '' : cwd}/${target}`;
  const parts = raw.split('/').filter(Boolean);
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }
  return '/' + resolved.join('/');
}

export function executeCommand(
  rawInput: string,
  cwd: string,
  config: DistroConfig,
  files: VFSFile[],
  packages: DistroPackage[]
): ShellExecutionResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { output: '', newCwd: cwd };
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);
  const metrics = calculateDistroMetrics(config, packages);

  switch (cmd) {
    case 'clear':
      return { output: '', clear: true, newCwd: cwd };

    case 'help':
      return {
        newCwd: cwd,
        output: [
          `${config.name} v${config.version} (${config.shell}) Built-in Shell Commands:`,
          '  neofetch / fastfetch      Show distro ASCII crest and system telemetry',
          '  uname [-a|-r|-m]          Print Linux kernel version and machine architecture',
          '  ls [-la] [path]           List directory contents in virtual rootfs',
          '  cd <dir>                  Change current working directory',
          '  cat <file>                Print file contents (e.g. cat /etc/os-release)',
          '  touch <file>              Create an empty file in the virtual rootfs',
          '  echo <text> > <file>      Write text to a file in the virtual rootfs',
          '  rm <file>                 Remove a file from the virtual rootfs',
          '  kpkg <list|install|remove|search> [pkg]  Manage Kestrel packages',
          '  free -m / df -h / ps      Inspect memory, disk mounts, and running PIDs',
          '  dmesg                     Show kernel ring buffer boot log',
          '  build-iso                 Run simulated SquashFS + GRUB El Torito ISO build',
          '  git-export                Jump to GitHub Repo Kit to export your distro',
          '  clear                     Clear terminal output',
        ].join('\n'),
      };

    case 'neofetch':
    case 'fastfetch':
      return {
        newCwd: cwd,
        output: renderNeofetch(config, packages),
      };

    case 'uname': {
      const flag = args[0] || '';
      if (flag === '-r') {
        return { newCwd: cwd, output: config.kernelVersion };
      }
      if (flag === '-m') {
        return { newCwd: cwd, output: config.arch };
      }
      return {
        newCwd: cwd,
        output: `Linux ${config.hostname} ${config.kernelVersion} #1 SMP PREEMPT_DYNAMIC ${config.name} ${config.version} ${config.arch} GNU/Linux (${config.libc})`,
      };
    }

    case 'whoami':
      return { newCwd: cwd, output: 'root' };

    case 'hostname':
      return { newCwd: cwd, output: config.hostname };

    case 'pwd':
      return { newCwd: cwd, output: cwd };

    case 'uptime':
      return {
        newCwd: cwd,
        output: ` 06:34:12 up 14 min,  1 user,  load average: 0.02, 0.01, 0.00 (booted in ${metrics.bootTimeSec}s)`,
      };

    case 'free':
      return {
        newCwd: cwd,
        output: [
          '              total        used        free      shared  buff/cache   available',
          `Mem:          512.0       ${metrics.idleRamMb.toFixed(1).padStart(5, ' ')}       ${(512 - metrics.idleRamMb - 12.4).toFixed(1).padStart(5, ' ')}         0.4        12.4       ${(512 - metrics.idleRamMb).toFixed(1).padStart(5, ' ')}`,
          'Swap:           0.0         0.0         0.0',
        ].join('\n'),
      };

    case 'df':
      return {
        newCwd: cwd,
        output: [
          'Filesystem           Size      Used Available Use% Mounted on',
          `rootfs             256.0M     ${metrics.rootfsSizeMb.toFixed(1)}M    ${(256 - metrics.rootfsSizeMb).toFixed(1)}M   ${Math.round((metrics.rootfsSizeMb / 256) * 100)}% /`,
          'devtmpfs           248.0M         0    248.0M   0% /dev',
          'tmpfs              256.0M     12.0K    256.0M   0% /tmp',
        ].join('\n'),
      };

    case 'ps':
      return {
        newCwd: cwd,
        output: [
          'PID   USER     TIME  COMMAND',
          `    1 root     0:00  /sbin/${config.initSystem}`,
          '    2 root     0:00  [kthreadd]',
          '   14 root     0:00  [kworker/u4:1-events]',
          '   42 root     0:00  udhcpc -i eth0 -b -q',
          ...(packages.find((p) => p.id === 'dropbear-ssh')?.installed
            ? ['   58 root     0:00  /usr/sbin/dropbear -R']
            : []),
          `   71 root     0:00  /bin/${config.shell} -l`,
          '   89 root     0:00  ps',
        ].join('\n'),
      };

    case 'dmesg':
      return {
        newCwd: cwd,
        output: [
          `[    0.000000] Linux version ${config.kernelVersion} (builder@${config.slug}) (${config.libc} gcc 14.2.0)`,
          `[    0.001204] Command line: BOOT_IMAGE=/boot/vmlinuz quiet console=ttyS0,115200`,
          `[    0.042810] Freeing SMP alternatives memory: 36K`,
          `[    0.118420] Unpacking initramfs (${metrics.isoSizeMb} MiB compressed)...`,
          `[    0.294110] virtio_blk virtio0: [vda] 524288 512-byte logical blocks (268 MB/256 MiB)`,
          `[    0.412008] EXT4-fs (vda): mounted filesystem with ordered data mode.`,
          `[    0.510290] Run /init as init process (${config.initSystem})`,
          `[    ${metrics.bootTimeSec}] ${config.name} ${config.version} (${config.codename}) reached target Multi-User System.`,
        ].join('\n'),
      };

    case 'ls': {
      const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
      const pathArg = args.find((a) => !a.startsWith('-')) || cwd;
      const targetDir = normalizePath(cwd, pathArg);

      if (targetDir === '/bin' || targetDir === '/usr/bin') {
        const allBins = packages.filter((p) => p.installed).flatMap((p) => p.binaries);
        return {
          newCwd: cwd,
          output: showLong
            ? allBins.map((b) => `-rwxr-xr-x 1 root root  14200 Nov 01 06:00 ${b}`).join('\n')
            : allBins.join('  '),
        };
      }

      const entries = new Set<string>();
      const baseDirectories = ['/bin', '/dev', '/etc', '/home', '/home/root', '/proc', '/sys', '/tmp', '/usr', '/var'];

      for (const dir of baseDirectories) {
        if (dir !== targetDir && dir.startsWith(targetDir === '/' ? '/' : targetDir + '/')) {
          const rest = dir.slice(targetDir === '/' ? 1 : targetDir.length + 1);
          const firstSeg = rest.split('/')[0];
          if (firstSeg) entries.add(firstSeg + '/');
        }
      }

      for (const f of files) {
        if (f.path.startsWith(targetDir === '/' ? '/' : targetDir + '/')) {
          const rest = f.path.slice(targetDir === '/' ? 1 : targetDir.length + 1);
          const segs = rest.split('/');
          if (segs.length === 1) {
            entries.add(segs[0]);
          } else if (segs[0]) {
            entries.add(segs[0] + '/');
          }
        }
      }

      const list = Array.from(entries).sort();
      if (list.length === 0) {
        return { newCwd: cwd, output: `(empty directory ${targetDir})` };
      }

      if (showLong) {
        const lines = list.map((item) => {
          if (item.endsWith('/')) {
            return `drwxr-xr-x 2 root root   4096 Nov 01 06:00 ${item}`;
          }
          const full = normalizePath(targetDir, item);
          const fileObj = files.find((f) => f.path === full);
          const size = fileObj ? fileObj.content.length : 128;
          const perms = fileObj ? fileObj.permissions : '-rw-r--r--';
          return `${perms} 1 root root ${String(size).padStart(6, ' ')} Nov 01 06:00 ${item}`;
        });
        return { newCwd: cwd, output: lines.join('\n') };
      }

      return { newCwd: cwd, output: list.join('  ') };
    }

    case 'cd': {
      const target = normalizePath(cwd, args[0] || '/home/root');
      const validDirs = new Set(['/', '/bin', '/dev', '/etc', '/etc/kpkg', '/home', '/home/root', '/proc', '/sys', '/tmp', '/usr', '/var']);
      for (const f of files) {
        const partsDir = f.path.split('/').slice(0, -1).join('/') || '/';
        validDirs.add(partsDir);
      }
      if (!validDirs.has(target)) {
        return { newCwd: cwd, output: `${config.shell}: cd: can't cd to ${target}: No such directory` };
      }
      return { newCwd: target, output: '' };
    }

    case 'cat': {
      if (!args[0]) {
        return { newCwd: cwd, output: 'cat: missing file operand' };
      }
      const targetPath = normalizePath(cwd, args[0]);
      const found = files.find((f) => f.path === targetPath);
      if (!found) {
        return { newCwd: cwd, output: `cat: can't open '${targetPath}': No such file or directory` };
      }
      return { newCwd: cwd, output: found.content.trimEnd() };
    }

    case 'touch': {
      if (!args[0]) {
        return { newCwd: cwd, output: 'touch: missing file operand' };
      }
      const targetPath = normalizePath(cwd, args[0]);
      const existing = files.find((f) => f.path === targetPath);
      if (existing) {
        return { newCwd: cwd, output: '' };
      }
      const nextFiles: VFSFile[] = [
        ...files,
        {
          path: targetPath,
          content: '',
          permissions: '-rw-r--r--',
          owner: 'root:root',
          updatedAt: 'Nov 01 06:25',
        },
      ];
      return { newCwd: cwd, output: '', updatedFiles: nextFiles };
    }

    case 'echo': {
      const redirectIdx = args.indexOf('>');
      if (redirectIdx !== -1 && args[redirectIdx + 1]) {
        const text = args
          .slice(0, redirectIdx)
          .join(' ')
          .replace(/^["']|["']$/g, '');
        const targetPath = normalizePath(cwd, args[redirectIdx + 1]);
        const exists = files.some((f) => f.path === targetPath);
        const nextFiles = exists
          ? files.map((f) => (f.path === targetPath ? { ...f, content: text + '\n' } : f))
          : [
              ...files,
              {
                path: targetPath,
                content: text + '\n',
                permissions: '-rw-r--r--',
                owner: 'root:root',
                updatedAt: 'Nov 01 06:25',
              },
            ];
        return { newCwd: cwd, output: '', updatedFiles: nextFiles };
      }
      return {
        newCwd: cwd,
        output: args.join(' ').replace(/^["']|["']$/g, ''),
      };
    }

    case 'rm': {
      const fileArg = args.find((a) => !a.startsWith('-'));
      if (!fileArg) {
        return { newCwd: cwd, output: 'rm: missing operand' };
      }
      const targetPath = normalizePath(cwd, fileArg);
      if (targetPath === '/etc/os-release' || targetPath === '/init') {
        return { newCwd: cwd, output: `rm: cannot remove '${targetPath}': Protected system file` };
      }
      const exists = files.some((f) => f.path === targetPath);
      if (!exists) {
        return { newCwd: cwd, output: `rm: can't remove '${targetPath}': No such file` };
      }
      return {
        newCwd: cwd,
        output: '',
        updatedFiles: files.filter((f) => f.path !== targetPath),
      };
    }

    case 'kpkg': {
      const sub = args[0] || 'list';
      const pkgArg = args[1]?.toLowerCase();

      if (sub === 'list') {
        const lines = packages.map(
          (p) =>
            `${p.installed ? '[installed]' : '[available]'} ${p.name.padEnd(18, ' ')} ${p.version.padEnd(12, ' ')} (${(
              p.sizeKb / 1024
            ).toFixed(2)} MiB) - ${p.description}`
        );
        return { newCwd: cwd, output: lines.join('\n') };
      }

      if (sub === 'search') {
        const query = pkgArg || '';
        const matches = packages.filter(
          (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
        );
        if (matches.length === 0) {
          return { newCwd: cwd, output: `kpkg: no packages matching '${query}'` };
        }
        return {
          newCwd: cwd,
          output: matches
            .map((p) => `${p.name} (${p.version}) [${p.installed ? 'installed' : 'available'}] - ${p.description}`)
            .join('\n'),
        };
      }

      if (sub === 'install' || sub === 'add') {
        if (!pkgArg) {
          return { newCwd: cwd, output: 'Usage: kpkg install <package-name>' };
        }
        const targetPkg = packages.find(
          (p) => p.name.toLowerCase() === pkgArg || p.id.toLowerCase() === pkgArg
        );
        if (!targetPkg) {
          return {
            newCwd: cwd,
            output: `ERROR: unable to select package '${pkgArg}' (try 'kpkg list')`,
          };
        }
        if (targetPkg.installed) {
          return {
            newCwd: cwd,
            output: `kpkg: ${targetPkg.name}-${targetPkg.version} is already installed.`,
          };
        }
        const nextPackages = packages.map((p) =>
          p.id === targetPkg.id ? { ...p, installed: true } : p
        );
        const nextMetrics = calculateDistroMetrics(config, nextPackages);
        return {
          newCwd: cwd,
          updatedPackages: nextPackages,
          output: [
            `(1/1) Installing ${targetPkg.name} (${targetPkg.version})...`,
            `Extracting ${targetPkg.binaries.map((b) => `/usr/bin/${b}`).join(', ')}`,
            `Executing busybox-1.37.0.trigger`,
            `OK: ${nextMetrics.rootfsSizeMb} MiB in ${nextMetrics.installedCount} packages.`,
          ].join('\n'),
        };
      }

      if (sub === 'remove' || sub === 'del') {
        if (!pkgArg) {
          return { newCwd: cwd, output: 'Usage: kpkg remove <package-name>' };
        }
        const targetPkg = packages.find(
          (p) => p.name.toLowerCase() === pkgArg || p.id.toLowerCase() === pkgArg
        );
        if (!targetPkg) {
          return { newCwd: cwd, output: `ERROR: No such package '${pkgArg}'` };
        }
        if (targetPkg.required) {
          return {
            newCwd: cwd,
            output: `ERROR: Cannot remove essential base system package '${targetPkg.name}'`,
          };
        }
        if (!targetPkg.installed) {
          return { newCwd: cwd, output: `kpkg: '${targetPkg.name}' is not installed.` };
        }
        const nextPackages = packages.map((p) =>
          p.id === targetPkg.id ? { ...p, installed: false } : p
        );
        const nextMetrics = calculateDistroMetrics(config, nextPackages);
        return {
          newCwd: cwd,
          updatedPackages: nextPackages,
          output: [
            `(1/1) Purging ${targetPkg.name} (${targetPkg.version})...`,
            `OK: ${nextMetrics.rootfsSizeMb} MiB in ${nextMetrics.installedCount} packages.`,
          ].join('\n'),
        };
      }

      return {
        newCwd: cwd,
        output: 'Usage: kpkg <list|search|install|remove> [package]',
      };
    }

    case 'build-iso':
      return {
        newCwd: cwd,
        output: [
          `==> Starting ${config.name} ${config.version} (${config.arch}) ISO Build Pipeline`,
          `  -> Target Kernel  : vmlinuz-${config.kernelVersion} (${config.libc})`,
          `  -> Init System    : ${config.initSystem} (/init -> /bin/${config.shell})`,
          `  -> Bundling Pkgs  : ${metrics.installedCount} packages (${metrics.totalBinaries} binaries)`,
          `  -> Packing cpio   : rootfs.cpio.zst (${metrics.rootfsSizeMb} MiB uncompressed)`,
          `  -> Bootloader     : grub-mkrescue + xorriso El Torito BIOS/UEFI hybrid`,
          `==> SUCCESS: ${config.slug}-${config.version}-${config.arch}.iso (${metrics.isoSizeMb} MiB) ready!`,
          `    Switch to 'GitHub Repo Kit' tab to download the full repo & build scripts.`,
        ].join('\n'),
      };

    case 'git-export':
      return {
        newCwd: cwd,
        switchTab: 'github',
        output: `Opening GitHub Repo Kit for https://github.com/${config.githubUser}/${config.slug}...`,
      };

    default: {
      // Check if it's an installed binary
      const allBins = packages.filter((p) => p.installed).flatMap((p) => p.binaries);
      if (allBins.includes(cmd)) {
        return {
          newCwd: cwd,
          output: `${cmd}: executed (${config.name} ${config.arch}-${config.libc} binary)`,
        };
      }
      return {
        newCwd: cwd,
        output: `${config.shell}: ${cmd}: not found (type 'help' or 'kpkg list')`,
      };
    }
  }
}

export function generateRepoFiles(
  config: DistroConfig,
  packages: DistroPackage[]
): GeneratedRepoFile[] {
  const metrics = calculateDistroMetrics(config, packages);
  const installedNames = packages.filter((p) => p.installed).map((p) => p.name);
  const kernelSeries = config.kernelVersion.split('-')[0];
  const isoFilename = `${config.slug}-${config.version}-${config.arch}.iso`;

  const readmeContent = `# ${config.name} (${config.codename})

![Version](https://img.shields.io/badge/version-${config.version}-2563eb)
![Architecture](https://img.shields.io/badge/arch-${config.arch}-0f172a)
![Libc](https://img.shields.io/badge/libc-${config.libc}-059669)
![ISO Size](https://img.shields.io/badge/ISO-${metrics.isoSizeMb}_MiB-4f46e5)

> ${config.tagline}

**${config.name}** is a minimal, reproducible Linux distribution built from scratch using the Linux \`${config.kernelVersion}\` kernel, \`${config.libc}\`, and \`BusyBox\`. It boots to a working \`${config.shell}\` prompt in **${metrics.bootTimeSec} seconds** using under **${metrics.idleRamMb} MiB RAM**.

\`\`\`text
       /\\          ${config.name} ${config.version} (${config.codename})
      /  \\         ----------------------------------------
     / /\\ \\        Kernel   : Linux ${config.kernelVersion} (${config.arch})
    / /  \\ \\       Init     : ${config.initSystem}
   / /    \\ \\      Libc     : ${config.libc}
  / /  /\\  \\ \\     Shell    : /bin/${config.shell}
 /_/  /  \\  \\_\\    Packages : ${installedNames.join(', ')}
\`\`\`

## Quick Start (Build & Boot in Docker + QEMU)

### 1. Build the Bootable ISO via Docker (No host dependencies needed)
\`\`\`bash
git clone https://github.com/${config.githubUser}/${config.slug}.git
cd ${config.slug}
make docker-iso
\`\`\`

### 2. Build Directly on Ubuntu / Debian Host
\`\`\`bash
chmod +x build-iso.sh
./build-iso.sh
\`\`\`

### 3. Boot in QEMU
\`\`\`bash
qemu-system-${config.arch} -cdrom out/${isoFilename} -m 512M -enable-kvm -serial stdio
\`\`\`

## Repository Structure
| Path | Description |
| :--- | :--- |
| \`build-iso.sh\` | Automated build script that fetches Linux \`${kernelSeries}\` + BusyBox, constructs the initramfs, and creates \`${isoFilename}\` |
| \`Dockerfile\` | Hermeic multi-stage container build environment for reproducible ISO creation |
| \`Makefile\` | Developer targets (\`make iso\`, \`make docker-iso\`, \`make run-qemu\`, \`make clean\`) |
| \`rootfs/init\` | PID 1 init script mounting \`/proc\`, \`/sys\`, \`/dev\` and launching \`/bin/${config.shell}\` |
| \`rootfs/etc/os-release\` | Standard freedesktop.org distribution metadata |
| \`.github/workflows/release-iso.yml\` | GitHub Actions CI pipeline that compiles and attaches the bootable \`.iso\` to Releases |

## License
MIT / GPL-2.0 (Linux Kernel & BusyBox components).
`;

  const buildIsoSh = `#!/usr/bin/env bash
# ==============================================================================
# ${config.name} ${config.version} ("${config.codename}") — Bootable ISO Builder
# Repository: https://github.com/${config.githubUser}/${config.slug}
# Target Arch: ${config.arch} | Libc: ${config.libc} | Init: ${config.initSystem}
# ==============================================================================
set -euo pipefail

DISTRO_NAME="${config.name}"
DISTRO_SLUG="${config.slug}"
DISTRO_VERSION="${config.version}"
KERNEL_VER="${kernelSeries}"
BUSYBOX_VER="1.37.0"
ARCH="${config.arch}"

BUILD_DIR="$(pwd)/build"
ROOTFS_DIR="\${BUILD_DIR}/rootfs"
ISO_DIR="\${BUILD_DIR}/iso"
OUT_DIR="$(pwd)/out"
ISO_FILE="\${OUT_DIR}/\${DISTRO_SLUG}-\${DISTRO_VERSION}-\${ARCH}.iso"

echo "==> [1/6] Preparing build directories for \${DISTRO_NAME}..."
mkdir -p "\${BUILD_DIR}" "\${ROOTFS_DIR}" "\${ISO_DIR}/boot/grub" "\${OUT_DIR}"

echo "==> [2/6] Downloading Linux Kernel \${KERNEL_VER} & BusyBox \${BUSYBOX_VER}..."
cd "\${BUILD_DIR}"
if [ ! -f "linux-\${KERNEL_VER}.tar.xz" ]; then
  curl -fLO "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-\${KERNEL_VER}.tar.xz"
  tar -xf "linux-\${KERNEL_VER}.tar.xz"
fi

if [ ! -f "busybox-\${BUSYBOX_VER}.tar.bz2" ]; then
  curl -fLO "https://busybox.net/downloads/busybox-\${BUSYBOX_VER}.tar.bz2"
  tar -xf "busybox-\${BUSYBOX_VER}.tar.bz2"
fi

echo "==> [3/6] Compiling static BusyBox userland (${config.libc})..."
cd "\${BUILD_DIR}/busybox-\${BUSYBOX_VER}"
make defconfig
sed -i 's/# CONFIG_STATIC is not set/CONFIG_STATIC=y/' .config
make -j"$(nproc)"
make CONFIG_PREFIX="\${ROOTFS_DIR}" install

echo "==> [4/6] Populating \${DISTRO_NAME} rootfs hierarchy..."
cd "\${ROOTFS_DIR}"
mkdir -p bin sbin etc proc sys usr/bin usr/sbin dev home/root tmp var/log
cp -r "$(pwd)/../../rootfs/"* "\${ROOTFS_DIR}/" 2>/dev/null || true
chmod +x "\${ROOTFS_DIR}/init"

echo "==> [5/6] Packing initramfs.cpio.gz..."
cd "\${ROOTFS_DIR}"
find . -print0 | cpio --null -ov --format=newc | gzip -9 > "\${ISO_DIR}/boot/initramfs.cpio.gz"

echo "==> [6/6] Compiling Linux \${KERNEL_VER} & Generating Hybrid BIOS/UEFI ISO..."
cd "\${BUILD_DIR}/linux-\${KERNEL_VER}"
make defconfig
make -j"$(nproc)" bzImage
cp arch/x86/boot/bzImage "\${ISO_DIR}/boot/vmlinuz"

cat > "\${ISO_DIR}/boot/grub/grub.cfg" <<EOF
set timeout=3
set default=0

menuentry "${config.name} ${config.version} (${config.codename}) [${config.arch}]" {
    linux /boot/vmlinuz console=tty0 console=ttyS0,115200 quiet
    initrd /boot/initramfs.cpio.gz
}
EOF

grub-mkrescue -o "\${ISO_FILE}" "\${ISO_DIR}"
echo "==> Build Complete: \${ISO_FILE}"
`;

  const dockerfileContent = `# Reproducible Multi-Stage ISO Builder for ${config.name} (${config.version})
FROM ubuntu:24.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    bc \\
    bison \\
    cpio \\
    curl \\
    flex \\
    grub-pc-bin \\
    grub-efi-amd64-bin \\
    libelf-dev \\
    libncurses-dev \\
    libssl-dev \\
    mtools \\
    musl-tools \\
    xz-utils \\
    xorriso \\
    ca-certificates \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
COPY . /workspace/

RUN chmod +x ./build-iso.sh && ./build-iso.sh

FROM scratch AS export
COPY --from=builder /workspace/out/*.iso /
`;

  const makefileContent = `# ${config.name} (${config.slug}) Makefile
ISO_NAME := ${isoFilename}

.PHONY: all iso docker-iso run-qemu clean

all: iso

iso:
\tchmod +x ./build-iso.sh
\t./build-iso.sh

docker-iso:
\tdocker build --target export --output type=local,dest=./out .
\t@echo "ISO exported to ./out/$(ISO_NAME)"

run-qemu:
\tqemu-system-${config.arch} \\
\t\t-cdrom ./out/$(ISO_NAME) \\
\t\t-m 512M \\
\t\t-serial stdio

clean:
\trm -rf ./build ./out
`;

  const githubWorkflowContent = `name: Build & Release ${config.name} ISO

on:
  push:
    branches: [ main, master ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-iso:
    runs-on: ubuntu-24.04
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install Kernel & ISO Build Dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y build-essential flex bison libelf-dev libssl-dev \\
            bc cpio grub-pc-bin grub-efi-amd64-bin xorriso mtools musl-tools curl xz-utils

      - name: Build ${config.name} Bootable ISO
        run: |
          chmod +x ./build-iso.sh
          ./build-iso.sh

      - name: Upload Bootable ISO Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${isoFilename}
          path: out/${isoFilename}

      - name: Publish GitHub Release on Tag
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v2
        with:
          files: out/${isoFilename}
          generate_release_notes: true
`;

  return [
    {
      path: 'README.md',
      language: 'markdown',
      description: 'GitHub repository landing page with badges, architecture overview, and QEMU instructions.',
      content: readmeContent,
    },
    {
      path: 'build-iso.sh',
      language: 'bash',
      description: 'Self-contained build script that compiles BusyBox + Linux Kernel and generates the bootable .iso.',
      content: buildIsoSh,
    },
    {
      path: 'Dockerfile',
      language: 'dockerfile',
      description: 'Reproducible multi-stage container build so anyone can compile the ISO with Docker.',
      content: dockerfileContent,
    },
    {
      path: 'Makefile',
      language: 'makefile',
      description: 'Standard developer targets for building the ISO and booting it inside QEMU.',
      content: makefileContent,
    },
    {
      path: '.github/workflows/release-iso.yml',
      language: 'yaml',
      description: 'GitHub Actions workflow that automatically builds the ISO on every push and publishes GitHub Releases.',
      content: githubWorkflowContent,
    },
    {
      path: 'rootfs/init',
      language: 'bash',
      description: 'PID 1 init script packed into initramfs.cpio.gz.',
      content: generateInitScriptContent(config),
    },
    {
      path: 'rootfs/etc/os-release',
      language: 'ini',
      description: 'Standard /etc/os-release metadata identifying your Linux distribution.',
      content: generateOsReleaseContent(config),
    },
  ];
}

export function generateSelfExtractingBundle(
  config: DistroConfig,
  packages: DistroPackage[]
): string {
  const files = generateRepoFiles(config, packages);
  const blocks = files.map((file) => {
    const dir = file.path.includes('/') ? file.path.split('/').slice(0, -1).join('/') : '';
    const mkdirLine = dir ? `mkdir -p "${dir}"\n` : '';
    return `${mkdirLine}cat << 'EOF_${file.path.replace(/[^a-zA-Z0-9]/g, '_')}' > "${file.path}"
${file.content}
EOF_${file.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
  });

  return `#!/usr/bin/env bash
# ==============================================================================
# ${config.name} (${config.slug}) — Self-Extracting GitHub Repository Initializer
# Run this script inside an empty directory to scaffold the entire distro repo!
# ==============================================================================
set -euo pipefail

mkdir -p "${config.slug}"
cd "${config.slug}"

${blocks.join('\n\n')}

chmod +x build-iso.sh rootfs/init
echo "============================================================"
echo " Scaffolded ${config.name} v${config.version} in ./${config.slug}"
echo " Next steps to push to GitHub:"
echo "   cd ${config.slug}"
echo "   git init && git branch -M main"
echo "   git add ."
echo "   git commit -m 'Initial release of ${config.name} v${config.version} (${config.codename})'"
echo "   git remote add origin https://github.com/${config.githubUser}/${config.slug}.git"
echo "   git push -u origin main"
echo "============================================================"
`;
}
