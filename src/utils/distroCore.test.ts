import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DISTRO_CONFIG,
  INITIAL_PACKAGES,
  slugifyDistroName,
  calculateDistroMetrics,
  buildInitialVFS,
  executeCommand,
  generateRepoFiles,
  generateSelfExtractingBundle,
} from './distroCore';

test('slugifyDistroName converts distro names to clean URL/repo slugs', () => {
  assert.equal(slugifyDistroName('Kestrel Linux'), 'kestrel-linux');
  assert.equal(slugifyDistroName('  Nova OS 2.0! '), 'nova-os-2-0');
  assert.equal(slugifyDistroName(''), 'custom-linux');
});

test('calculateDistroMetrics computes ISO size, rootfs size, and RAM accurately', () => {
  const baseMetrics = calculateDistroMetrics(DEFAULT_DISTRO_CONFIG, INITIAL_PACKAGES);
  assert.ok(baseMetrics.isoSizeMb > 10 && baseMetrics.isoSizeMb < 35);
  assert.equal(baseMetrics.installedCount, 8);

  // Installing gcc-toolchain increases size and binary count
  const withGcc = INITIAL_PACKAGES.map((p) =>
    p.id === 'gcc-toolchain' ? { ...p, installed: true } : p
  );
  const gccMetrics = calculateDistroMetrics(DEFAULT_DISTRO_CONFIG, withGcc);
  assert.ok(gccMetrics.rootfsSizeMb > baseMetrics.rootfsSizeMb + 30);
  assert.equal(gccMetrics.installedCount, 9);
});

test('executeCommand handles uname, cat /etc/os-release, and file creation', () => {
  const vfs = buildInitialVFS(DEFAULT_DISTRO_CONFIG);
  const unameRes = executeCommand('uname -r', '/home/root', DEFAULT_DISTRO_CONFIG, vfs, INITIAL_PACKAGES);
  assert.equal(unameRes.output, '6.12.8-lts');

  const catRes = executeCommand('cat /etc/os-release', '/home/root', DEFAULT_DISTRO_CONFIG, vfs, INITIAL_PACKAGES);
  assert.ok(catRes.output.includes('NAME="Kestrel Linux"'));
  assert.ok(catRes.output.includes('VERSION_CODENAME="peregrine"'));

  const echoRes = executeCommand('echo "hello kestrel" > /tmp/test.txt', '/home/root', DEFAULT_DISTRO_CONFIG, vfs, INITIAL_PACKAGES);
  assert.ok(echoRes.updatedFiles);
  const readBack = executeCommand('cat /tmp/test.txt', '/home/root', DEFAULT_DISTRO_CONFIG, echoRes.updatedFiles!, INITIAL_PACKAGES);
  assert.equal(readBack.output, 'hello kestrel');
});

test('executeCommand kpkg installs and removes optional packages while protecting core packages', () => {
  const vfs = buildInitialVFS(DEFAULT_DISTRO_CONFIG);
  const installRes = executeCommand('kpkg install tmux', '/home/root', DEFAULT_DISTRO_CONFIG, vfs, INITIAL_PACKAGES);
  assert.ok(installRes.updatedPackages);
  const tmuxPkg = installRes.updatedPackages!.find((p) => p.name === 'tmux');
  assert.equal(tmuxPkg?.installed, true);

  // Attempting to remove required busybox should fail safely
  const removeCore = executeCommand('kpkg remove busybox', '/home/root', DEFAULT_DISTRO_CONFIG, vfs, installRes.updatedPackages!);
  assert.ok(removeCore.output.includes('Cannot remove essential base system package'));
});

test('generateRepoFiles and generateSelfExtractingBundle reflect custom distro config', () => {
  const customConfig = {
    ...DEFAULT_DISTRO_CONFIG,
    name: 'Falcon OS',
    slug: 'falcon-os',
    codename: 'Talon',
    githubUser: 'linuxmaker',
  };
  const files = generateRepoFiles(customConfig, INITIAL_PACKAGES);
  assert.equal(files.length, 7);
  const readme = files.find((f) => f.path === 'README.md');
  assert.ok(readme?.content.includes('# Falcon OS (Talon)'));
  assert.ok(readme?.content.includes('https://github.com/linuxmaker/falcon-os.git'));

  const bundle = generateSelfExtractingBundle(customConfig, INITIAL_PACKAGES);
  assert.ok(bundle.includes('mkdir -p "falcon-os"'));
  assert.ok(bundle.includes('git remote add origin https://github.com/linuxmaker/falcon-os.git'));
});
