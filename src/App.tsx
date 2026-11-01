import React, { useState } from 'react';
import {
  DEFAULT_DISTRO_CONFIG,
  INITIAL_PACKAGES,
  DistroConfig,
  DistroPackage,
  VFSFile,
  buildInitialVFS,
  generateOsReleaseContent,
  generateInitScriptContent,
  generateSelfExtractingBundle,
} from './utils/distroCore';
import { TerminalView } from './components/TerminalView';
import { RootFsExplorer } from './components/RootFsExplorer';
import { PackageManagerView } from './components/PackageManagerView';
import { GitHubRepoBuilder } from './components/GitHubRepoBuilder';

type ActiveTab = 'terminal' | 'explorer' | 'packages' | 'github';

export default function App() {
  const [config, setConfig] = useState<DistroConfig>(DEFAULT_DISTRO_CONFIG);
  const [packages, setPackages] = useState<DistroPackage[]>(INITIAL_PACKAGES);
  const [files, setFiles] = useState<VFSFile[]>(() => buildInitialVFS(DEFAULT_DISTRO_CONFIG));
  const [activeTab, setActiveTab] = useState<ActiveTab>('terminal');

  const handleUpdateConfig = (nextConfig: DistroConfig) => {
    setConfig(nextConfig);
    setFiles((prev) =>
      prev.map((f) => {
        if (f.path === '/etc/os-release') {
          return { ...f, content: generateOsReleaseContent(nextConfig) };
        }
        if (f.path === '/etc/hostname') {
          return { ...f, content: `${nextConfig.hostname}\n` };
        }
        if (f.path === '/init') {
          return { ...f, content: generateInitScriptContent(nextConfig) };
        }
        return f;
      })
    );
  };

  const handleDownloadQuickRepo = () => {
    const script = generateSelfExtractingBundle(config, packages);
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `setup-${config.slug}-repo.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/90 bg-[#0B0F17]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('terminal');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          {config.name}
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav aria-label="Main Navigation" className="flex items-center gap-6 text-sm font-medium text-slate-400 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'terminal'
                ? 'text-white underline underline-offset-8 decoration-sky-400 decoration-2'
                : 'hover:text-slate-200'
            }`}
          >
            Live Terminal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'explorer'
                ? 'text-white underline underline-offset-8 decoration-sky-400 decoration-2'
                : 'hover:text-slate-200'
            }`}
          >
            RootFS Explorer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'packages'
                ? 'text-white underline underline-offset-8 decoration-sky-400 decoration-2'
                : 'hover:text-slate-200'
            }`}
          >
            Packages
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'github'
                ? 'text-white underline underline-offset-8 decoration-sky-400 decoration-2'
                : 'hover:text-slate-200'
            }`}
          >
            GitHub Repo Kit
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleDownloadQuickRepo}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Export GitHub Repo
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Contextual Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="text-xs text-slate-400 font-mono">
              {config.name} {config.version} · Codename {config.codename} · Linux {config.kernelVersion} · {config.libc}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              {activeTab === 'terminal' && 'Interactive Live Shell & Telemetry'}
              {activeTab === 'explorer' && 'Initramfs Virtual Root Filesystem'}
              {activeTab === 'packages' && 'Kestrel Package Repository (kpkg)'}
              {activeTab === 'github' && 'GitHub Repository & Reproducible ISO Builder'}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span>Repo: github.com/{config.githubUser}/{config.slug}</span>
            <span aria-hidden="true">·</span>
            <span>Arch: {config.arch}</span>
          </div>
        </div>

        {/* Active View Content */}
        {activeTab === 'terminal' && (
          <TerminalView
            config={config}
            files={files}
            packages={packages}
            onUpdateFiles={setFiles}
            onUpdatePackages={setPackages}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'explorer' && (
          <RootFsExplorer
            config={config}
            files={files}
            packages={packages}
            onUpdateFiles={setFiles}
          />
        )}

        {activeTab === 'packages' && (
          <PackageManagerView
            config={config}
            packages={packages}
            onUpdatePackages={setPackages}
          />
        )}

        {activeTab === 'github' && (
          <GitHubRepoBuilder
            config={config}
            packages={packages}
            onUpdateConfig={handleUpdateConfig}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            {config.name} {config.version} ({config.codename}) — Open-Source Minimalist Linux Distribution Kit
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('terminal')}
              className="hover:text-slate-300 transition-colors"
            >
              Live Shell
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('github')}
              className="hover:text-slate-300 transition-colors"
            >
              GitHub Build Scripts
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
