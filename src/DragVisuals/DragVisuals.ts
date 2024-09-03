import { EditorView, WidgetType, ViewUpdate, ViewPlugin, DecorationSet, Decoration } from '@codemirror/view';
import { StateField, StateEffect, EditorState } from '@codemirror/state';
import { App, Editor, MarkdownView } from 'obsidian';
import { DragPlaceholder } from './DragPlaceholder';
import { dragHandleField, draggingLineField, dragHandlePlugin, setDraggingLine } from './DragHandleManager';

export class DragVisuals {
    private app: App;
    private dragPlaceholder: DragPlaceholder;

    constructor(app: App) {
        this.app = app;
        this.dragPlaceholder = new DragPlaceholder();
    }

    // 1. 显示拖动占位符
    showDragPlaceholder(view: EditorView, pos: number, sourceLineNumber: number) {
        this.dragPlaceholder.showDragPlaceholder(view, pos, sourceLineNumber);
    }

    // 2. 隐藏拖动占位符
    hideDragPlaceholder() {
        this.dragPlaceholder.hideDragPlaceholder();
    }


    // 1. 新增方法：创建拖动预览
    createDragPreview(text: string, event: DragEvent): void {
        const dragImage = document.createElement('div');
        dragImage.textContent = text.slice(0, 20) + '...';
        dragImage.className = 'drag-preview';
        
        document.body.appendChild(dragImage);
        event.dataTransfer?.setDragImage(dragImage, 0, 0);
        
        // 使用 setTimeout 来确保拖动开始后再移除预览元素
        setTimeout(() => document.body.removeChild(dragImage), 0);
    }



    // 3. 获取编辑器视图
    getEditorView(): EditorView | null {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return null;
        return (view.editor as any).cm;
    }

    // 4. 设置拖动行
    setDraggingLine(view: EditorView, lineNumber: number | null) {
        view.dispatch({
            effects: setDraggingLine.of(lineNumber)
        });
    }

    // 5. 获取拖动相关的编辑器扩展
    static getDragExtensions() {
        return [
            dragHandleField,
            draggingLineField,
            dragHandlePlugin
        ];
    }

    getPlaceholderPosition(): number | null {
        return this.dragPlaceholder.getPlaceholderPosition();
    }

    getTargetLine(): number | null {
        return this.dragPlaceholder.getTargetLine();
    }

    getSourceLineNumber(): number | null {
        return this.dragPlaceholder.getSourceLineNumber();
    }
}

// 导出 setDraggingLine 以便其他模块可以使用
export { setDraggingLine };