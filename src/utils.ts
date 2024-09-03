import { App, MarkdownView } from 'obsidian';
import { EditorView } from '@codemirror/view';

export function getEditorView(app: App): EditorView | null {
    const view = app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return null;
    return (view.editor as any).cm;
}