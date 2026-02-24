import React, { useEffect, useCallback } from 'react';
import { api } from '../services/db';
import { useToast } from './ui/Toast';
import { ProjectStatus, Priority } from '../types';

const INCOMING_KEY = 'notnotes_incoming_commit';
const INBOX_PROJECT_TITLE = 'Incoming';

interface IncomingCommit {
    who: {
        tool: string;
        id: string;
    };
    what: {
        title: string;
        type: string;
    };
    content: string;
    timestamp: string;
}

export const IncomingCommitListener: React.FC = () => {
    const { showToast } = useToast();

    const processIncomingCommit = useCallback(() => {
        const raw = localStorage.getItem(INCOMING_KEY);
        if (!raw) return;

        try {
            const commit: IncomingCommit = JSON.parse(raw);
            const toolName = commit.who?.tool || 'Unknown Tool';
            const toolId = commit.who?.id || 'unknown';

            // Route to "Incoming" catch-all project (create it if it doesn't exist)
            let project = api.getProjects().find(
                (p) => p.title === INBOX_PROJECT_TITLE
            );

            if (!project) {
                project = api.createProject({
                    title: INBOX_PROJECT_TITLE,
                    description: 'Universal inbox — Solutions committed from across The Youniverse land here.',
                    status: ProjectStatus.IN_PROGRESS,
                    priority: Priority.HIGH,
                    tags: ['Inbox', 'Auto'],
                    color: '#f59e0b',
                });
            }

            // Build metadata header for the note body
            const metaBlock = [
                `> **Source:** ${toolName} (\`${toolId}\`)`,
                `> **Type:** ${commit.what?.type || 'Unknown'}`,
                `> **Received:** ${commit.timestamp || new Date().toISOString()}`,
                '',
                '---',
                '',
            ].join('\n');

            // Create a doc (note) inside the Incoming project
            api.createNote({
                projectId: project.id,
                title: commit.what?.title || 'Untitled Commit',
                content: metaBlock + (commit.content || ''),
                pinned: true,
            });

            // Clear the key so we don't re-process
            localStorage.removeItem(INCOMING_KEY);

            showToast(
                `New artifact received from ${toolName}`,
                'success'
            );

            // Signal a refresh so the sidebar picks up the new project/note
            window.dispatchEvent(new Event('notnotes_refresh'));
        } catch (err) {
            console.error('[IncomingCommitListener] Failed to process commit:', err);
            // Clear bad data to prevent infinite retries
            localStorage.removeItem(INCOMING_KEY);
        }
    }, [showToast]);

    useEffect(() => {
        // Check on mount (page load)
        processIncomingCommit();

        // Listen for cross-tab storage events
        const handleStorage = (e: StorageEvent) => {
            if (e.key === INCOMING_KEY && e.newValue) {
                processIncomingCommit();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [processIncomingCommit]);

    return null; // Headless side-effect component
};
