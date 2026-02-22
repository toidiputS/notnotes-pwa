
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { BrainCircuit, Plus, X, Edit3, Trash2, CheckCircle, ChevronRight, ChevronDown, RotateCcw } from '../../components/ui/Icons';
import { api } from '../../services/db';
import { Mindmap, MindmapNode } from '../../types';
import { useToast } from '../../components/ui/Toast';

// -- Recursive Node Component --
interface NodeViewProps {
  node: MindmapNode;
  onUpdate: (nodeId: string, newLabel: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (nodeId: string) => void;
  depth?: number;
}

const NodeView: React.FC<NodeViewProps> = ({ node, onUpdate, onAddChild, onDelete, depth = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.label);

  // Sync internal state with prop changes (Critical for map switching)
  useEffect(() => {
    setLabel(node.label);
  }, [node.label]);

  const handleSave = () => {
    if (label.trim()) {
      onUpdate(node.id, label);
      setIsEditing(false);
    } else {
        // Revert if empty
        setLabel(node.label);
        setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
        setLabel(node.label);
        setIsEditing(false);
    }
  };

  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center mr-2">
         {/* Node Content */}
         <div className={`
            group relative flex items-center bg-slate-800 border rounded-lg shadow-sm transition-all
            ${depth === 0 ? 'border-indigo-500 ring-2 ring-indigo-500/20 px-6 py-3 text-lg font-bold text-slate-100' : 'border-slate-700 px-4 py-2 hover:border-indigo-500/50 text-slate-200'}
         `}>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                 <input 
                   autoFocus
                   value={label}
                   onChange={e => setLabel(e.target.value)}
                   onKeyDown={handleKeyDown}
                   onBlur={handleSave}
                   className="min-w-[100px] outline-none text-slate-100 bg-transparent"
                 />
                 <button onMouseDown={handleSave} className="text-green-500 hover:text-green-400"><CheckCircle size={14}/></button>
              </div>
            ) : (
              <div 
                className="cursor-text min-w-[50px] text-center"
                onClick={() => setIsEditing(true)}
              >
                {node.label}
              </div>
            )}

            {/* Hover Actions */}
            {!isEditing && (
              <div className="absolute -top-3 -right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 shadow-sm rounded-full border border-slate-700 p-0.5 z-10">
                  <button onClick={() => onAddChild(node.id)} className="p-1 text-indigo-400 hover:bg-slate-800 rounded-full" title="Add Child">
                    <Plus size={12} />
                  </button>
                  {depth > 0 && (
                    <button onClick={() => onDelete(node.id)} className="p-1 text-red-400 hover:bg-slate-800 rounded-full" title="Delete Node">
                       <Trash2 size={12} />
                    </button>
                  )}
              </div>
            )}
         </div>
      </div>

      {/* Children Container */}
      {node.children.length > 0 && (
        <div className="flex flex-col justify-center space-y-4 relative ml-8 before:absolute before:left-[-20px] before:top-1/2 before:-translate-y-1/2 before:w-[20px] before:h-[2px] before:bg-slate-600">
           {/* Vertical line connecting children */}
           {node.children.length > 1 && (
             <div className="absolute left-[-20px] top-[1.5rem] bottom-[1.5rem] w-[2px] bg-slate-600"></div>
           )}

           {node.children.map((child, idx) => (
             <div key={child.id} className="relative flex items-center">
                {/* Horizontal Connector for child */}
                <div className="absolute left-[-20px] w-[20px] h-[2px] bg-slate-600"></div>
                <NodeView 
                  node={child} 
                  onUpdate={onUpdate} 
                  onAddChild={onAddChild} 
                  onDelete={onDelete}
                  depth={depth + 1}
                />
             </div>
           ))}
        </div>
      )}
    </div>
  );
};


export default function ProjectMindmaps() {
  const { projectId } = useParams();
  const { showToast } = useToast();
  const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
  const [activeMindmap, setActiveMindmap] = useState<Mindmap | null>(null);

  useEffect(() => {
    if (projectId) {
      const maps = api.getMindmaps(projectId);
      setMindmaps(maps);
      if (maps.length > 0 && !activeMindmap) {
        setActiveMindmap(maps[0]);
      }
    }
  }, [projectId]);

  const handleCreateDefault = () => {
     if (!projectId) return;
     const newMap = api.createMindmap({
        projectId,
        title: mindmaps.length === 0 ? 'Project Structure' : `Mindmap ${mindmaps.length + 1}`,
        root: {
          id: 'root-' + Date.now(),
          label: 'Central Topic',
          children: [
            { id: 'c1-' + Date.now(), label: 'Idea 1', children: [] },
            { id: 'c2-' + Date.now(), label: 'Idea 2', children: [] },
          ]
        }
     });
     setMindmaps(prev => [...prev, newMap]);
     setActiveMindmap(newMap);
     showToast('New mindmap created');
  };

  const handleUpdateNode = (nodeId: string, newLabel: string) => {
    if (!activeMindmap) return;

    // Helper to deeply update tree
    const updateTree = (node: MindmapNode): MindmapNode => {
      if (node.id === nodeId) return { ...node, label: newLabel };
      return { ...node, children: node.children.map(updateTree) };
    };

    const updatedRoot = updateTree(activeMindmap.root);
    const updatedMap = { ...activeMindmap, root: updatedRoot };
    
    api.updateMindmap(activeMindmap.id, { root: updatedRoot });
    setActiveMindmap(updatedMap);
    setMindmaps(prev => prev.map(m => m.id === updatedMap.id ? updatedMap : m));
  };

  const handleAddChild = (parentId: string) => {
    if (!activeMindmap) return;

    const newNode: MindmapNode = {
      id: 'n-' + Date.now() + Math.random().toString(36).substr(2, 5),
      label: 'New Node',
      children: []
    };

    const updateTree = (node: MindmapNode): MindmapNode => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newNode] };
      }
      return { ...node, children: node.children.map(updateTree) };
    };

    const updatedRoot = updateTree(activeMindmap.root);
    const updatedMap = { ...activeMindmap, root: updatedRoot };
    
    api.updateMindmap(activeMindmap.id, { root: updatedRoot });
    setActiveMindmap(updatedMap);
    setMindmaps(prev => prev.map(m => m.id === updatedMap.id ? updatedMap : m));
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!activeMindmap) return;

    const updateTree = (node: MindmapNode): MindmapNode => {
      return { 
        ...node, 
        children: node.children.filter(c => c.id !== nodeId).map(updateTree) 
      };
    };

    const updatedRoot = updateTree(activeMindmap.root);
    const updatedMap = { ...activeMindmap, root: updatedRoot };
    
    api.updateMindmap(activeMindmap.id, { root: updatedRoot });
    setActiveMindmap(updatedMap);
    setMindmaps(prev => prev.map(m => m.id === updatedMap.id ? updatedMap : m));
  };

  const handleDeleteMap = () => {
    if (!activeMindmap) return;
    if (window.confirm('Are you sure you want to delete this mindmap?')) {
        api.deleteMindmap(activeMindmap.id);
        const remaining = mindmaps.filter(m => m.id !== activeMindmap.id);
        setMindmaps(remaining);
        setActiveMindmap(remaining.length > 0 ? remaining[0] : null);
        showToast('Mindmap deleted');
    }
  };

  const handleClearBoard = () => {
    if (!activeMindmap) return;
    if (window.confirm('Reset this board to default state?')) {
        const resetRoot: MindmapNode = {
            id: 'root-' + Date.now(),
            label: 'Central Topic',
            children: []
        };
        const updatedMap = { ...activeMindmap, root: resetRoot };
        api.updateMindmap(activeMindmap.id, { root: resetRoot });
        setActiveMindmap(updatedMap);
        setMindmaps(prev => prev.map(m => m.id === updatedMap.id ? updatedMap : m));
        showToast('Board reset');
    }
  };

  if (!projectId) return null;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
         <div>
            <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-slate-200">Mindmaps</h3>
                {mindmaps.length > 1 && (
                    <div className="relative group">
                       <button className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded flex items-center hover:bg-slate-700">
                         {activeMindmap?.title} <ChevronDown size={12} className="ml-1"/>
                       </button>
                       <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 hidden group-hover:block w-48">
                          {mindmaps.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => setActiveMindmap(m)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-800 ${activeMindmap?.id === m.id ? 'text-indigo-400 font-medium' : 'text-slate-400'}`}
                            >
                                {m.title}
                            </button>
                          ))}
                       </div>
                    </div>
                )}
            </div>
            <p className="text-sm text-slate-500">Visual brainstorming and idea mapping.</p>
         </div>
         <div className="flex items-center space-x-2">
            {activeMindmap && (
                <>
                    <button 
                        onClick={handleClearBoard}
                        className="p-2 text-slate-500 hover:text-indigo-400 transition"
                        title="Reset Board"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button 
                        onClick={handleDeleteMap}
                        className="p-2 text-slate-500 hover:text-red-400 transition"
                        title="Delete Map"
                    >
                        <Trash2 size={16} />
                    </button>
                </>
            )}
            <button 
              onClick={handleCreateDefault}
              className="flex items-center space-x-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition shadow-sm border border-slate-700"
            >
                <Plus size={16} />
                <span>New Board</span>
            </button>
         </div>
      </div>

      <div className="flex-1 bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-800 overflow-hidden relative">
          {activeMindmap ? (
             <div className="w-full h-full overflow-auto p-12 flex items-center justify-start min-w-max">
                <NodeView 
                   key={activeMindmap.id} 
                   node={activeMindmap.root} 
                   onUpdate={handleUpdateNode}
                   onAddChild={handleAddChild}
                   onDelete={handleDeleteNode}
                />
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-700">
                    <BrainCircuit size={32} className="text-slate-600" />
                </div>
                <h4 className="text-slate-400 font-medium mb-1">Canvas is empty</h4>
                <p className="text-sm mb-6 max-w-xs text-center text-slate-600">Start visualizing your project structure with nodes and connectors.</p>
                <button 
                    onClick={handleCreateDefault}
                    className="text-indigo-400 font-medium text-sm hover:underline"
                >
                    Create default map
                </button>
            </div>
          )}
      </div>
    </div>
  );
}
