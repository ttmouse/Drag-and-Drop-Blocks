import { EditorView } from '@codemirror/view';

export class DragPlaceholder {
    private element: HTMLElement;

    // 1. 构造函数
    constructor() {
        this.element = this.createDragPlaceholderElement();
        document.body.appendChild(this.element);
    }

    // 2. 创建拖动占位符元素
    private createDragPlaceholderElement(): HTMLElement {
        const dragPlaceholder = document.createElement('div');
        dragPlaceholder.className = 'drag-placeholder';
        dragPlaceholder.style.position = 'absolute';
        dragPlaceholder.style.height = '2px';
        dragPlaceholder.style.backgroundColor = 'var(--interactive-accent)';
        dragPlaceholder.style.display = 'none';
        dragPlaceholder.style.zIndex = '1000';
        return dragPlaceholder;
    }

    // 5. 显示拖动占位符
    showDragPlaceholder(view: EditorView, pos: number) {
        const doc = view.state.doc;
        const line = doc.lineAt(pos);
        let placeholderPos: number;
    
        if (pos >= doc.length) {
            // 如果拖到了文档末尾，将占位符放在最后一行之后
            placeholderPos = doc.length;
        } else if (pos - line.from < (line.to - line.from) / 2) {
            // 如果在行的上半部分，将占位符放在行之前
            placeholderPos = line.from;
        } else {
            // 如果在行的下半部分，将占位符放在行之后
            placeholderPos = line.to;
        }
    
        const rect = view.coordsAtPos(placeholderPos);
        if (!rect) return;
    
        const lineElement = view.dom.querySelector('.cm-line');
        if (!lineElement) return;
    
        const lineRect = lineElement.getBoundingClientRect();
    
        this.element.style.display = 'block';
        this.element.style.left = `${lineRect.left}px`;
        this.element.style.width = `${lineRect.width}px`;
        this.element.style.height = '2px';
    
        if (placeholderPos <= doc.line(1).from) {
            // 如果位置在第一行之前，显示在第一行的上方
            const firstLineRect = view.coordsAtPos(0);
            if (firstLineRect) {
                this.element.style.top = `${firstLineRect.top - 2}px`;
            }
        } else if (line.number === doc.lines) {
            // 如果是在最后一行，就显示在最后一行的下方
            this.element.style.top = `${rect.bottom + 2}px`;
        } else {
            // 除了第一行和最后一行，其他场景下显示在2个文本行正中间
            const lineAboveRect = view.coordsAtPos(line.from - 1);
            if (lineAboveRect) {
                this.element.style.top = `${(lineAboveRect.bottom + rect.top) / 2}px`;
            }
        }
    }

    // 4. 隐藏拖动占位符
    hideDragPlaceholder() {
        this.element.style.display = 'none';
    }
}