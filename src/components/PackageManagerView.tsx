import React, { useState } from 'react';
import { Search, Check, Plus, Trash2, Lock } from 'lucide-react';
import {
  DistroConfig,
  DistroPackage,
  PackageCategory,
  calculateDistroMetrics,
} from '../utils/distroCore';

interface PackageManagerViewProps {
  config: DistroConfig;
  packages: DistroPackage[];
  onUpdatePackages: (packages: DistroPackage[]) => void;
}

const CATEGORIES: Array<'All' | PackageCategory> = [
  'All',
  'Core',
  'Networking',
  'Development',
  'System',
  'Security',
];

export const PackageManagerView: React.FC<PackageManagerViewProps> = ({
  config,
  packages,
  onUpdatePackages,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | PackageCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const metrics = calculateDistroMetrics(config, packages);

  const filteredPackages = packages.filter((pkg) => {
    const matchesCat = selectedCategory === 'All' || pkg.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      pkg.name.toLowerCase().includes(q) ||
      pkg.description.toLowerCase().includes(q) ||
      pkg.binaries.some((b) => b.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleTogglePackage = (pkg: DistroPackage) => {
    if (pkg.required) return;
    const updated = packages.map((item) =>
      item.id === pkg.id ? { ...item, installed: !item.installed } : item
    );
    onUpdatePackages(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Summary & Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border border-slate-800 rounded-lg bg-slate-900/40">
        <div>
          <div className="text-xs text-slate-400 font-mono">
            kpkg repository · mirror.kestrellinux.org/{config.arch}
          </div>
          <h2 className="text-lg font-semibold text-white mt-0.5">
            RootFS Package Selection ({metrics.installedCount} installed · {metrics.isoSizeMb} MiB ISO)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Toggle packages to include in your bootable ISO image and live shell environment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <label htmlFor="kpkg-search-input" className="sr-only">
              Search packages
            </label>
            <input
              id="kpkg-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search packages or binaries..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Interactive Category Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="border border-slate-800 rounded-lg bg-[#090D14] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-xs font-medium text-slate-400">
                <th className="py-3 px-4">Package &amp; Version</th>
                <th className="py-3 px-4">Category &amp; Binaries</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Disk Size</th>
                <th className="py-3 px-4 text-right">RAM Footprint</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No packages match "{searchQuery}" in {selectedCategory}.{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="text-sky-400 hover:underline ml-1"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono font-semibold text-slate-100">
                        {pkg.name}
                      </div>
                      <div className="text-slate-500 font-mono tabular-nums mt-0.5">
                        v{pkg.version} · {pkg.installed ? 'Installed' : 'Available'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="text-slate-300">{pkg.category}</div>
                      <div className="text-slate-500 font-mono mt-0.5">
                        {pkg.binaries.slice(0, 4).join(', ')}
                        {pkg.binaries.length > 4 ? ` +${pkg.binaries.length - 4}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top text-slate-300 max-w-md leading-relaxed">
                      {pkg.description}
                    </td>
                    <td className="py-3.5 px-4 align-top text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                      {(pkg.sizeKb / 1024).toFixed(2)} MiB
                    </td>
                    <td className="py-3.5 px-4 align-top text-right font-mono tabular-nums text-slate-400 whitespace-nowrap">
                      {(pkg.ramKb / 1024).toFixed(2)} MiB
                    </td>
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      {pkg.required ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 font-mono">
                          <Lock className="w-3.5 h-3.5" />
                          Base System
                        </span>
                      ) : pkg.installed ? (
                        <button
                          type="button"
                          onClick={() => handleTogglePackage(pkg)}
                          aria-label={`Remove ${pkg.name}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-rose-200 bg-slate-800 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-800 rounded transition-colors whitespace-nowrap shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTogglePackage(pkg)}
                          aria-label={`Install ${pkg.name}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded transition-colors whitespace-nowrap shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Install
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
