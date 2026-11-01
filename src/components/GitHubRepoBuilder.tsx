import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal, GitBranch } from 'lucide-react';
import {
  DistroConfig,
  DistroPackage,
  calculateDistroMetrics,
  generateRepoFiles,
  generateSelfExtractingBundle,
  slugifyDistroName,
} from '../utils/distroCore';

interface GitHubRepoBuilderProps {
  config: DistroConfig;
  packages: DistroPackage[];
  onUpdateConfig: (next: DistroConfig) => void;
}

const PRESET_NAMES = [
  { name: 'Kestrel Linux', codename: 'Peregrine', hostname: 'kestrel' },
  { name: 'Aether Linux', codename: 'Stratosphere', hostname: 'aether' },
  { name: 'Cobalt OS', codename: 'forged-core', hostname: 'cobalt' },
  { name: 'Lynx MicroLinux', codename: 'Timberline', hostname: 'lynx' },
];

export const GitHubRepoBuilder: React.FC<GitHubRepoBuilderProps> = ({
  config,
  packages,
  onUpdateConfig,
}) => {
  const repoFiles = generateRepoFiles(config, packages);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('README.md');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const metrics = calculateDistroMetrics(config, packages);
  const activeFile = repoFiles.find((f) => f.path === selectedFilePath) || repoFiles[0];

  const handleNameChange = (name: string) => {
    const slug = slugifyDistroName(name);
    const hostname = slug.split('-')[0] || 'kestrel';
    onUpdateConfig({
      ...config,
      name,
      slug,
      hostname,
    });
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadFullBundle = () => {
    const script = generateSelfExtractingBundle(config, packages);
    handleDownloadFile(`setup-${config.slug}-repo.sh`, script);
  };

  const gitPushCommands = [
    `sh ./setup-${config.slug}-repo.sh`,
    `cd ${config.slug} && git init -b main`,
    `git add . && git commit -m "Release ${config.name} v${config.version}"`,
    `git remote add origin https://github.com/${config.githubUser}/${config.slug}.git`,
    `git push -u origin main`,
  ].join('\n');

  return (
    <div className="space-y-6">
      {/* Top Section: Distro Identity & Architecture Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Distro Name, GitHub Repo & Kernel Configurator */}
        <div className="lg:col-span-7 flex flex-col justify-between border border-slate-800 rounded-lg bg-slate-900/40 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs text-slate-400">Distribution Identity &amp; Build Target</div>
              <h2 className="text-lg font-semibold text-white mt-0.5">
                Name Your Distro &amp; Configure Architecture
              </h2>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_NAMES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    onUpdateConfig({
                      ...config,
                      name: preset.name,
                      slug: slugifyDistroName(preset.name),
                      codename: preset.codename,
                      hostname: preset.hostname,
                    })
                  }
                  className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                    config.name === preset.name
                      ? 'bg-sky-600/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
            <div>
              <label htmlFor="distro-name-input" className="block text-xs font-medium text-slate-300 mb-1">
                Distro Name
              </label>
              <input
                id="distro-name-input"
                type="text"
                value={config.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label htmlFor="distro-codename-input" className="block text-xs font-medium text-slate-300 mb-1">
                Release Codename
              </label>
              <input
                id="distro-codename-input"
                type="text"
                value={config.codename}
                onChange={(e) => onUpdateConfig({ ...config, codename: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label htmlFor="github-user-input" className="block text-xs font-medium text-slate-300 mb-1">
                GitHub Username / Org
              </label>
              <input
                id="github-user-input"
                type="text"
                value={config.githubUser}
                onChange={(e) => onUpdateConfig({ ...config, githubUser: e.target.value.trim() || 'user' })}
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-sky-300 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="kernel-select" className="block text-xs font-medium text-slate-300 mb-1">
                Linux Kernel
              </label>
              <select
                id="kernel-select"
                value={config.kernelVersion}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    kernelVersion: e.target.value as DistroConfig['kernelVersion'],
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="6.12.8-lts">6.12.8-lts</option>
                <option value="6.13.2-mainline">6.13.2-mainline</option>
                <option value="6.6.74-minimal">6.6.74-minimal</option>
              </select>
            </div>

            <div>
              <label htmlFor="libc-select" className="block text-xs font-medium text-slate-300 mb-1">
                C Library (libc)
              </label>
              <select
                id="libc-select"
                value={config.libc}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    libc: e.target.value as DistroConfig['libc'],
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="musl">musl (static)</option>
                <option value="uclibc-ng">uclibc-ng</option>
                <option value="glibc">glibc</option>
              </select>
            </div>

            <div>
              <label htmlFor="init-select" className="block text-xs font-medium text-slate-300 mb-1">
                PID 1 Init System
              </label>
              <select
                id="init-select"
                value={config.initSystem}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    initSystem: e.target.value as DistroConfig['initSystem'],
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="busybox-init">busybox-init</option>
                <option value="runit">runit</option>
                <option value="openrc">openrc</option>
              </select>
            </div>

            <div>
              <label htmlFor="arch-select" className="block text-xs font-medium text-slate-300 mb-1">
                Target Arch
              </label>
              <select
                id="arch-select"
                value={config.arch}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    arch: e.target.value as DistroConfig['arch'],
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="x86_64">x86_64</option>
                <option value="aarch64">aarch64</option>
                <option value="riscv64">riscv64</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
            <div className="sm:col-span-3">
              <label htmlFor="distro-tagline-input" className="block text-xs font-medium text-slate-300 mb-1">
                Repository Description / Tagline
              </label>
              <input
                id="distro-tagline-input"
                type="text"
                value={config.tagline}
                onChange={(e) => onUpdateConfig({ ...config, tagline: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label htmlFor="shell-select" className="block text-xs font-medium text-slate-300 mb-1">
                Default Shell
              </label>
              <select
                id="shell-select"
                value={config.shell}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    shell: e.target.value as DistroConfig['shell'],
                  })
                }
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="ash">/bin/ash</option>
                <option value="dash">/bin/dash</option>
                <option value="zsh">/bin/zsh</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: One-Click GitHub Push & Release/Package Status */}
        <div className="lg:col-span-5 flex flex-col justify-between border border-slate-800 rounded-lg bg-slate-900/40 p-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">
                github.com/{config.githubUser}/{config.slug}
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums">
                Release v{config.version} · GHCR
              </div>
            </div>
            <h3 className="text-base font-semibold text-white">
              Ready for Direct GitHub Push (Releases + GHCR Packages)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All distribution files (<code className="text-sky-400">README.md</code>, <code className="text-sky-400">rootfs/</code>, <code className="text-sky-400">build-iso.sh</code>, <code className="text-sky-400">Dockerfile</code>, and <code className="text-sky-400">.github/workflows/release-and-package.yml</code>) are staged in the workspace root. Pushing to GitHub automatically triggers Actions to publish <strong>Release v{config.version}</strong> and <strong>Package ghcr.io/{config.githubUser.toLowerCase()}/{config.slug}</strong>.
            </p>

            <pre className="p-3 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap break-all leading-5">
              {gitPushCommands}
            </pre>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownloadFullBundle}
              className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download setup-{config.slug}-repo.sh
            </button>
            <button
              type="button"
              onClick={() => handleCopyText('git-cmds', gitPushCommands)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
            >
              {copiedKey === 'git-cmds' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Git Steps
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Generated GitHub Repository Files Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* File Tree */}
        <div className="lg:col-span-4 border border-slate-800 rounded-lg bg-slate-900/40 p-4 space-y-3">
          <div className="px-2">
            <div className="text-xs font-mono text-slate-400">{config.slug}/</div>
            <h3 className="text-sm font-semibold text-white mt-0.5">
              Generated Repository Files ({repoFiles.length})
            </h3>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800">
            {repoFiles.map((file) => {
              const active = file.path === activeFile.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full flex flex-col items-start px-3 py-2.5 rounded text-left transition-colors ${
                    active
                      ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs font-mono font-semibold">
                    <span className="flex items-center gap-2 truncate">
                      <FileCode className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                      <span className="truncate">{file.path}</span>
                    </span>
                    <span className="text-slate-500 tabular-nums ml-2 shrink-0">
                      {file.content.split('\n').length}L
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {file.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Inspector */}
        <div className="lg:col-span-8 flex flex-col border border-slate-800 rounded-lg bg-[#090D14] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
            <div>
              <div className="font-mono text-sm font-semibold text-white">
                {config.slug}/{activeFile.path}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{activeFile.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyText(activeFile.path, activeFile.content)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
              >
                {copiedKey === activeFile.path ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied File
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy File
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDownloadFile(
                    activeFile.path.split('/').pop() || 'file.txt',
                    activeFile.content
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download {activeFile.path.split('/').pop()}
              </button>
            </div>
          </div>

          <div className="flex-1 p-5 overflow-auto max-h-[520px]">
            <pre className="font-mono text-xs sm:text-[13px] text-slate-200 leading-relaxed whitespace-pre">
              {activeFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
