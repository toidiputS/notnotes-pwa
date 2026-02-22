
import React, { useState } from 'react';
import { api } from '../../services/db';
import { Artifact, ArtifactType } from '../../types';
import { Upload, FileText, Download, Trash2, Grid, List } from '../../components/ui/Icons';

export default function ProjectFiles({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState(api.getArtifacts(projectId));
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      // Mock upload
      api.createArtifact({
        projectId,
        title: file.name,
        size: file.size,
        type: file.name.endsWith('.pdf') ? ArtifactType.PDF : file.name.match(/\.(jpg|png|svg)$/) ? ArtifactType.IMAGE : ArtifactType.GENERIC
      });
      setFiles(api.getArtifacts(projectId));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-200">Project Files</h3>
        <div className="flex items-center space-x-2">
          <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-700">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}><List size={16} /></button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}><Grid size={16} /></button>
          </div>
          <label className="cursor-pointer flex items-center space-x-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-500 transition text-sm font-medium shadow-sm border border-indigo-500">
            <Upload size={16} />
            <span>Upload</span>
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="border-2 border-dashed border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-slate-500">
          <Upload size={48} className="mb-4 text-slate-700" />
          <p>No files uploaded yet.</p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800 text-slate-400 font-medium border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {files.map(file => (
                    <tr key={file.id} className="hover:bg-slate-800/50 transition group">
                      <td className="px-4 py-3 font-medium text-slate-300 flex items-center space-x-2">
                        <FileText size={16} className="text-slate-500" />
                        <span>{file.title}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatSize(file.size)}</td>
                      <td className="px-4 py-3 text-slate-500 uppercase text-xs">{file.type}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-slate-600 hover:text-indigo-400 transition p-1">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map(file => (
                <div key={file.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:shadow-lg hover:border-slate-700 transition group flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 mb-3 border border-slate-700">
                    <FileText size={24} />
                  </div>
                  <h4 className="text-sm font-medium text-slate-300 mb-1 truncate w-full">{file.title}</h4>
                  <p className="text-xs text-slate-500 mb-3">{formatSize(file.size)}</p>
                  <button className="w-full py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded border border-indigo-500/20">Download</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
