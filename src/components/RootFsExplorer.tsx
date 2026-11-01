import React, { useState } from 'react';
import { FileText, Plus, Save, Check, Trash2, Terminal } from 'lucide-react';
import { DistroConfig, DistroPackage, VFSFile } from '../utils/distroCore';

interface RootFsExplorerProps {
  config: DistroConfig;
  files: VFSFile[];
  packages: DistroPackage[];
  onUpdateFiles: (files: VFSFile[]) => void;
}

export const RootFsExplorer: React.FC<RootFsExplorerProps> = ({
  config,
  files,
  packages,
  onUpdateFiles,
}) => {
  const [selectedPath, setSelectedPath] = useState<string>(files[0]?.path || '/etc/os-release');
  const [draftContent, setDraftContent] = useState<string>(files[0]?.content || '');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [newFilePath, setNewFilePath] = useState<string>('');
  const [newFileError, setNewFileError] = useState<string>('');

  const selectedFile = files.find((f) => f.path === selectedPath) || files[0];
  const installedBinaries = packages.filter((p) => p.installed).flatMap((p) => p.binaries);

  const handleSelectFile = (file: VFSFile) => {
    setSelectedPath(file.path);
    setDraftContent(file.content);
    setSavedNotice(false);
  };

  const handleSaveFile = () => {
    if (!selectedFile) return;
    const updated = files.map((f) =>
      f.path === selectedFile.path
        ? { ...f, content: draftContent, updatedAt: 'Nov 01 06:30' }
        : f
    );
    onUpdateFiles(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newFilePath.trim();
    if (!cleaned) {
      setNewFileError('Enter a valid file path starting with / (e.g. /etc/rc.local)');
      return;
    }
    const normalized = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
    if (files.some((f) => f.path === normalized)) {
      setNewFileError(`File ${normalized} already exists in rootfs.`);
      return;
    }

    const created: VFSFile = {
      path: normalized,
      content: `# ${normalized} — Created in ${config.name} rootfs\n`,
      permissions: '-rw-r--r--',
      owner: 'root:root',
      updatedAt: 'Nov 01 06:30',
    };
    const next = [...files, created];
    onUpdateFiles(next);
    setNewFilePath('');
    setNewFileError('');
    handleSelectFile(created);
  };

  const handleDeleteFile = (pathToDelete: string) => {
    if (pathToDelete === '/etc/os-release' || pathToDelete === '/init') return;
    const next = files.filter((f) => f.path !== pathToDelete);
    onUpdateFiles(next);
    if (selectedPath === pathToDelete && next[0]) {
      handleSelectFile(next[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left 4 Columns: RootFS File Tree & /bin Listing */}
      <div className="lg:col-span-4 flex flex-col justify-between border border-slate-800 rounded-lg bg-slate-900/40 p-5 space-y-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-slate-400">initramfs.cpio.gz hierarchy</div>
            <h2 className="text-base font-semibold text-white mt-0.5">
              Virtual Root Filesystem (/)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Edit system configuration files below. Changes persist immediately in the live terminal and ISO builder.
            </p>
          </div>

          {/* File List */}
          <div className="space-y-1 pt-2 border-t border-slate-800">
            {files.map((file) => {
              const isSelected = file.path === selectedFile?.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => handleSelectFile(file)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-left text-xs font-mono transition-colors ${
                    isSelected
                      ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{file.path}</span>
                  </span>
                  <span className="text-slate-500 tabular-nums shrink-0 ml-2">
                    {file.content.length} B
                  </span>
                </button>
              );
            })}
          </div>

          {/* Add New File to RootFS */}
          <form onSubmit={handleCreateFile} className="pt-4 border-t border-slate-800 space-y-2">
            <label htmlFor="new-rootfs-file" className="block text-xs font-medium text-slate-300">
              Add File to RootFS
            </label>
            <div className="flex items-center gap-2">
              <input
                id="new-rootfs-file"
                type="text"
                value={newFilePath}
                onChange={(e) => {
                  setNewFilePath(e.target.value);
                  if (newFileError) setNewFileError('');
                }}
                placeholder="/etc/sysctl.conf"
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Create
              </button>
            </div>
            {newFileError && <p className="text-xs text-rose-400">{newFileError}</p>}
          </form>
        </div>

        {/* Active /bin & /usr/bin Symlinks Summary */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              /bin &amp; /usr/bin Executables
            </span>
            <span className="font-mono text-slate-400 tabular-nums">
              {installedBinaries.length} binaries
            </span>
          </div>
          <div className="p-3 rounded bg-slate-950/90 border border-slate-800/80 font-mono text-xs text-slate-400 leading-relaxed">
            {installedBinaries.join('  ')}
          </div>
        </div>
      </div>

      {/* Right 8 Columns: File Content Editor */}
      <div className="lg:col-span-8 flex flex-col border border-slate-800 rounded-lg bg-[#090D14] overflow-hidden">
        {selectedFile && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
              <div>
                <div className="font-mono text-sm font-semibold text-white">
                  {selectedFile.path}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedFile.permissions} · {selectedFile.owner} · {draftContent.length} bytes
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedFile.path !== '/etc/os-release' && selectedFile.path !== '/init' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(selectedFile.path)}
                    aria-label={`Delete ${selectedFile.path}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete File
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveFile}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  {savedNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Saved to RootFS
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col">
              <label htmlFor="rootfs-editor-textarea" className="sr-only">
                File content editor for {selectedFile.path}
              </label>
              <textarea
                id="rootfs-editor-textarea"
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full min-h-[420px] p-4 bg-slate-950 border border-slate-800 rounded font-mono text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
