import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/db';
import { useToast } from './ui/Toast';

export const OracleListener: React.FC = () => {
    const { addToast } = useToast();
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Note: We are listening to 'oracle_events' table. Since we don't have the explicit table schema, 
        // assuming a simple event-sourcing structure where payload determines the action.
        const channel = supabase
            .channel('oracle-public')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'oracle_events' },
                (payload) => {
                    console.log('Realtime Event Received:', payload);
                    const event = payload.new;

                    if (event.type === 'SESSION_START') {
                        const newProject = api.createProject({
                            title: event.data?.title || `Oracle Analysis - ${new Date().toLocaleDateString()}`,
                            description: 'Generated implicitly by an Oracle OS Session.',
                            tags: ['Oracle', 'Generated']
                        });
                        setActiveSessionId(newProject.id);
                        addToast(`Oracle started a new session: ${newProject.title}`, 'success');
                    }

                    if (event.type === 'ARTIFACT_EMITTED') {
                        const targetProjectId = event.data?.projectId || activeSessionId;
                        if (targetProjectId) {
                            api.createNote({
                                projectId: targetProjectId,
                                title: event.data?.title || 'Oracle Artifact',
                                content: event.data?.content || '',
                            });
                            addToast(`Artifact saved to Vault`, 'success');
                        } else {
                            addToast(`Received Oracle artifact, but no active Vault found.`, 'error');
                        }
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Connected to Oracle OS via Supabase Realtime');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [addToast, activeSessionId]);

    return null; // Hidden component, purely for side-effects
};
