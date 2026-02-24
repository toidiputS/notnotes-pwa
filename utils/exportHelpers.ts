import { Project, Task, Note, TaskStatus } from '../types';

export const exportHelpers = {
    /**
     * Generates a clean Markdown Dossier string containing the Project Brief, Tasks, and Artifacts.
     */
    generateMarkdownDossier: (project: Project, tasks: Task[], notes: Note[]): string => {
        let md = `# FINAL PACKET: ${project.title.toUpperCase()}\n\n`;

        if (project.description) {
            md += `## Mission Briefing\n${project.description}\n\n`;
        }

        if (project.tags && project.tags.length > 0) {
            md += `**Tags:** ${project.tags.map(t => `#${t}`).join(' ')}\n\n`;
        }

        md += `---\n\n`;

        // Tasks Section
        if (tasks.length > 0) {
            md += `## Task Operations\n\n`;
            const completed = tasks.filter(t => t.status === TaskStatus.DONE);
            const pending = tasks.filter(t => t.status !== TaskStatus.DONE);

            if (completed.length > 0) {
                md += `### Completed Checkpoints\n`;
                completed.forEach(t => md += `- [x] ${t.title}\n`);
                md += `\n`;
            }

            if (pending.length > 0) {
                md += `### Pending Objectives\n`;
                pending.forEach(t => md += `- [ ] ${t.title} *(Status: ${t.status})*\n`);
                md += `\n`;
            }

            md += `---\n\n`;
        }

        // Artifacts & Notes Section
        if (notes.length > 0) {
            md += `## Gathered Artifacts & Notes\n\n`;
            notes.forEach((note, index) => {
                md += `### Artifact ${index + 1}: ${note.title}\n`;
                md += `*Collected: ${new Date(note.createdAt).toLocaleString()}*\n\n`;
                md += `${note.content}\n\n`;
                if (index < notes.length - 1) md += `**_**\n\n`;
            });
        } else {
            md += `*No artifacts successfully gathered for this session.*\n\n`;
        }

        md += `---\n\n`;
        md += `**[ END OF RECORD ]**\n`;
        md += `*Session Terminated. All Youniverse node memory has been securely wiped. No persistent context retained (No dreaming).*`;

        return md;
    },

    /**
     * Triggers a browser download of the provided string as a .md file.
     */
    downloadAsMarkdown: (filename: string, content: string) => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Invokes the browser print dialog which can be saved as PDF natively.
     */
    printAsPDF: () => {
        window.print();
    }
};
