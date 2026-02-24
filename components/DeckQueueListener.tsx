import React, { useEffect, useCallback } from 'react';
import { api } from '../services/db';
import { useToast } from './ui/Toast';
import { ProjectStatus, Priority } from '../types';

const DECK_QUEUE_KEY = 'notnotes_deck_queue';
const INBOX_PROJECT_TITLE = 'Incoming';

interface IncomingDeck {
    deckId: string;
    who: { tool: string; id: string; color: string; };
    slides: any[];
    timestamp: string;
}

export const DeckQueueListener: React.FC = () => {
    const { showToast } = useToast();

    const processQueue = useCallback(() => {
        const raw = localStorage.getItem(DECK_QUEUE_KEY);
        if (!raw) return;

        try {
            const queue: IncomingDeck[] = JSON.parse(raw);
            if (!Array.isArray(queue) || queue.length === 0) return;

            // Ensure "Incoming" project exists
            let project = api.getProjects().find(p => p.title === INBOX_PROJECT_TITLE);
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

            let count = 0;
            for (const deck of queue) {
                // Skip if we already have this deckId (idempotency)
                const existing = api.getDecks(project.id).find(d => d.deckId === deck.deckId);
                if (existing) continue;

                // Store as a Deck record
                api.createDeck({
                    deckId: deck.deckId,
                    projectId: project.id,
                    who: deck.who,
                    slides: deck.slides,
                    timestamp: deck.timestamp,
                });

                // Also create a summary Note so it appears in Docs tab
                const coverSlide = deck.slides.find((s: any) => s.type === 'cover');
                const noteTitle = coverSlide?.title || `${deck.who.tool} Deck`;
                const noteContent = [
                    `> **Source:** ${deck.who.tool} (\`${deck.who.id}\`)`,
                    `> **Received:** ${deck.timestamp || new Date().toISOString()}`,
                    `> **Slides:** ${deck.slides.length}`,
                    '',
                    '---',
                    '',
                    ...deck.slides.map((s: any, i: number) => {
                        const label = `**Slide ${i + 1}** — ${s.type.toUpperCase()}`;
                        if (s.type === 'cover') return `${label}\n# ${s.title || ''}\n*${s.subtitle || ''}*`;
                        if (s.type === 'statement') return `${label}\n## ${s.heading || ''}\n${s.body || ''}`;
                        if (s.type === 'bullets') return `${label}\n## ${s.heading || ''}\n${(s.items || []).map((b: string) => `- ${b}`).join('\n')}`;
                        if (s.type === 'warning') return `${label}\n> ⚠️ **${s.heading || 'Warning'}**\n> ${s.body || ''}`;
                        if (s.type === 'roadmap') return `${label}\n## ${s.heading || ''}\n${(s.phases || []).map((p: any, j: number) => `${j + 1}. **${p.name}** — ${p.description || ''}`).join('\n')}`;
                        if (s.type === 'quote') return `${label}\n> *"${s.body || ''}"*\n> — ${s.attribution || s.heading || ''}`;
                        return `${label}\n${s.heading || ''}\n${s.body || ''}`;
                    })
                ].join('\n');

                api.createNote({
                    projectId: project.id,
                    title: noteTitle,
                    content: noteContent,
                    pinned: true,
                });

                count++;
                showToast(`Deck received from ${deck.who.tool}`, 'success');
            }

            // Clear the queue
            localStorage.removeItem(DECK_QUEUE_KEY);

            if (count > 0) {
                window.dispatchEvent(new Event('notnotes_refresh'));
            }
        } catch (err) {
            console.error('[DeckQueueListener] Failed to process queue:', err);
            localStorage.removeItem(DECK_QUEUE_KEY);
        }
    }, [showToast]);

    useEffect(() => {
        processQueue();

        const handleStorage = (e: StorageEvent) => {
            if (e.key === DECK_QUEUE_KEY && e.newValue) {
                processQueue();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [processQueue]);

    return null;
};
