import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, RotateCcw, FolderTree, Package, GitBranch } from 'lucide-react';
import {
  DistroConfig,
  DistroPackage,
  VFSFile,
  calculateDistroMetrics,
  renderNeofetch,
  executeCommand,
} from '../utils/distroCore';

interface TerminalHistoryEntry {
  id: string;
  cwd: string;
  command: string;
  output: string;
}

interface TerminalViewProps {
  config: DistroConfig;
  files: VFSFile[];
  packages: DistroPackage[];
  onUpdateFiles: (files: VFSFile[]) => void;
  onUpdatePackages: (packages: DistroPackage[]) => void;
  onSwitchTab: (tab: 'terminal' | 'explorer' | 'packages' | 'github') => void;
}

const QUICK_COMMANDS = [
  { label: 'neofetch', cmd: 'neofetch' },
  { label: 'cat /etc/os-release', cmd: 'cat /etc/os-release' },
  { label: 'ls -la /', cmd: 'ls -la /' },
  { label: 'kpkg list', cmd: 'kpkg list' },
  { label: 'kpkg install tmux', cmd: 'kpkg install tmux' },
  { label: 'dmesg', cmd: 'dmesg' },
  { label: 'free -m', cmd: 'free -m' },
  { label: 'build-iso', cmd: 'build-iso' },
];

export const TerminalView: React.FC<TerminalViewProps> = ({
  config,
  files,
  packages,
  onUpdateFiles,
  onUpdatePackages,
  onSwitchTab,
}) => {
  const [cwd, setCwd] = useState<string>('/home/root');
  const [input, setInput] = useState<string>('');
  const [cmdHistory, setCmdHistory] = useState<string[]>(['neofetch']);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [entries, setEntries] = useState<TerminalHistoryEntry[]>(() => [
    {
      id: 'init-boot',
      cwd: '/home/root',
      command: 'neofetch',
      output: renderNeofetch(config, packages),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const metrics = calculateDistroMetrics(config, packages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [entries]);

  const runShellCommand = (rawCmd: string) => {
    const result = executeCommand(rawCmd, cwd, config, files, packages);

    if (result.clear) {
      setEntries([]);
    } else {
      setEntries((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          cwd,
          command: rawCmd,
          output: result.output,
        },
      ]);
    }

    setCwd(result.newCwd);
    if (result.updatedFiles) {
      onUpdateFiles(result.updatedFiles);
    }
    if (result.updatedPackages) {
      onUpdatePackages(result.updatedPackages);
    }
    if (result.switchTab) {
      onSwitchTab(result.switchTab);
    }
    if (rawCmd.trim()) {
      setCmdHistory((prev) => [...prev, rawCmd.trim()]);
    }
    setHistoryIndex(-1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toRun = input;
    setInput('');
    runShellCommand(toRun);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex + 1 >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    }
  };

  const handleResetSession = () => {
    setCwd('/home/root');
    setEntries([
      {
        id: `reset-${Date.now()}`,
        cwd: '/home/root',
        command: 'neofetch',
        output: renderNeofetch(config, packages),
      },
    ]);
    inputRef.current?.focus();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left 8 Columns: Interactive POSIX Shell Console */}
      <div className="lg:col-span-8 flex flex-col border border-slate-800 rounded-lg bg-[#090D14] overflow-hidden">
        {/* Console Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
            <Terminal className="w-4 h-4 text-sky-400 shrink-0" />
            <span>ttyS0 · root@{config.hostname}:{cwd}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">/bin/{config.shell}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetSession}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Terminal
            </button>
          </div>
        </div>

        {/* Quick Command Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto">
          <span className="text-xs text-slate-400 mr-1 whitespace-nowrap shrink-0">Run:</span>
          {QUICK_COMMANDS.map((item) => (
            <button
              key={item.cmd}
              type="button"
              onClick={() => runShellCommand(item.cmd)}
              className="px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded transition-colors whitespace-nowrap shrink-0"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Scrollable Shell Output */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex-1 p-4 font-mono text-xs sm:text-sm leading-relaxed overflow-y-auto min-h-[420px] max-h-[540px] space-y-4 cursor-text"
        >
          <div className="text-slate-400 pb-2 border-b border-slate-800/60">
            {config.name} {config.version} ({config.codename}) · Linux {config.kernelVersion} {config.arch} · Type{' '}
            <code className="text-sky-400">help</code> for available commands.
          </div>

          {entries.map((entry) => (
            <div key={entry.id} className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-200">
                <span className="text-sky-400 font-semibold">
                  root@{config.hostname}:{entry.cwd === '/home/root' ? '~' : entry.cwd}#
                </span>
                <span>{entry.command}</span>
              </div>
              {entry.output && (
                <pre className="text-slate-300 whitespace-pre-wrap break-words pl-0 font-mono text-xs sm:text-[13px] leading-5">
                  {entry.output}
                </pre>
              )}
            </div>
          ))}

          {/* Active Prompt Form */}
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-1">
            <label htmlFor="terminal-command-input" className="text-sky-400 font-semibold shrink-0">
              root@{config.hostname}:{cwd === '/home/root' ? '~' : cwd}#
            </label>
            <input
              id="terminal-command-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a Linux command (e.g. help, ls -la, cat /etc/os-release, kpkg list)..."
              aria-label="Linux shell command input"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none font-mono text-xs sm:text-sm"
            />
            <button
              type="submit"
              className="px-3 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
            >
              Execute
            </button>
          </form>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Right 4 Columns: Distro Architecture & Footprint Panel */}
      <div className="lg:col-span-4 flex flex-col justify-between border border-slate-800 rounded-lg bg-slate-900/40 p-5 space-y-6">
        <div className="space-y-5">
          <div>
            <div className="text-xs text-slate-400">
              {config.slug} · {config.arch} · {config.libc}
            </div>
            <h2 className="text-lg font-semibold text-white mt-1">
              {config.name} {config.version} ({config.codename})
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{config.tagline}</p>
          </div>

          {/* Key Footprint Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Bootable ISO Size</div>
              <div className="text-xl font-semibold text-white font-mono tabular-nums mt-0.5">
                {metrics.isoSizeMb} MiB
              </div>
              <div className="text-xs text-slate-500 mt-0.5">SquashFS + GRUB Hybrid</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Idle Memory Usage</div>
              <div className="text-xl font-semibold text-white font-mono tabular-nums mt-0.5">
                {metrics.idleRamMb} MiB
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Cold boot in {metrics.bootTimeSec}s</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Uncompressed RootFS</div>
              <div className="text-base font-semibold text-slate-200 font-mono tabular-nums mt-0.5">
                {metrics.rootfsSizeMb} MiB
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Installed Packages</div>
              <div className="text-base font-semibold text-slate-200 font-mono tabular-nums mt-0.5">
                {metrics.installedCount} pkgs · {metrics.totalBinaries} bins
              </div>
            </div>
          </div>

          {/* System Specification Table */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Linux Kernel</span>
              <span className="font-mono text-slate-200 tabular-nums">{config.kernelVersion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">C Standard Library</span>
              <span className="font-mono text-slate-200">{config.libc}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">PID 1 Init System</span>
              <span className="font-mono text-slate-200">{config.initSystem}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Default Login Shell</span>
              <span className="font-mono text-slate-200">/bin/{config.shell}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target GitHub Repo</span>
              <span className="font-mono text-sky-400 truncate max-w-[190px]">
                {config.githubUser}/{config.slug}
              </span>
            </div>
          </div>
        </div>

        {/* Direct Workflow Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={() => onSwitchTab('explorer')}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded transition-colors"
          >
            <span className="flex items-center gap-2">
              <FolderTree className="w-3.5 h-3.5 text-sky-400" />
              Inspect &amp; Edit RootFS Files
            </span>
            <span className="font-mono text-slate-400">{files.length} files</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchTab('packages')}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded transition-colors"
          >
            <span className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-sky-400" />
              Configure kpkg Packages
            </span>
            <span className="font-mono text-slate-400">{metrics.installedCount} active</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchTab('github')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5" />
            Customize Name &amp; Export GitHub Repo
          </button>
        </div>
      </div>
    </div>
  );
};
