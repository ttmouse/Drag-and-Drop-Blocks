import { EditorView } from '@codemirror/view';

export class DragPlaceholder {
    private element: HTMLElement;
    private currentPosition: number | null = null;
    private targetLine: number | null = null;
    private sourceLineNumber: number | null = null;

    constructor() {
        this.element = this.createDragPlaceholderElement();
        document.body.appendChild(this.element);
    }

    // 1. 创建拖动占位符元素
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

    // 2. 获取文档属性信息结束的位置
    private getFrontmatterEndPosition(doc: any): number {
        const firstLine = doc.line(1);
        if (firstLine.text.trim() !== '---') {
            return 0; // No frontmatter
        }
        for (let i = 2; i <= doc.lines; i++) {
            const line = doc.line(i);
            if (line.text.trim() === '---') {
                return line.to;
            }
        }
        return 0; // No closing frontmatter delimiter found
    }

    // 3. 显示拖动占位符
    showDragPlaceholder(view: EditorView, pos: number, sourceLineNumber: number) {
        const doc = view.state.doc;
        const line = doc.lineAt(pos);
        let placeholderPos: number;
        let targetLineNumber: number;

        // 获取文档属性信息结束的位置
        const frontmatterEndPos = this.getFrontmatterEndPosition(doc);
        const firstContentLine = doc.lineAt(frontmatterEndPos);

        if (pos <= firstContentLine.from) {
            // 处理首行（排除文档属性信息后的首行）
            placeholderPos = firstContentLine.from;
            targetLineNumber = firstContentLine.number;
        } else if (pos >= doc.length) {
            // 处理末行
            placeholderPos = doc.length;
            targetLineNumber = doc.lines + 1;
        } else if (pos <= line.from + (line.to - line.from) / 2) {
            // 在当前行的上半部分
            placeholderPos = line.from;
            targetLineNumber = line.number;
        } else {
            // 在当前行的下半部分
            placeholderPos = line.to + 1;
            targetLineNumber = line.number + 1;
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

        if (placeholderPos <= firstContentLine.from) {
            const firstContentLineRect = view.coordsAtPos(firstContentLine.from);
            if (firstContentLineRect) {
                this.element.style.top = `${firstContentLineRect.top - 2}px`;
            }
        } else if (line.number === doc.lines) {
            this.element.style.top = `${rect.bottom + 2}px`;
        } else {
            const currentLineRect = view.coordsAtPos(line.from);
            const nextLineRect = view.coordsAtPos(doc.line(line.number + 1).from);
            if (currentLineRect && nextLineRect) {
                this.element.style.top = `${(currentLineRect.bottom + nextLineRect.top) / 2}px`;
            }
        }

        this.currentPosition = placeholderPos;
        this.targetLine = targetLineNumber;
        this.sourceLineNumber = sourceLineNumber;
    }

    // 4. 隐藏拖动占位符
    hideDragPlaceholder() {
        this.element.style.display = 'none';
        this.currentPosition = null;
        this.targetLine = null;
        this.sourceLineNumber = null;
    }

    // 5. 获取占位符位置
    getPlaceholderPosition(): number | null {
        return this.currentPosition;
    }

    // 6. 获取目标行号
    getTargetLine(): number | null {
        return this.targetLine;
    }

    // 7. 获取源行号
    getSourceLineNumber(): number | null {
        return this.sourceLineNumber;
    }
}