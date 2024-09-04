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

    private createDragPlaceholderElement(): HTMLElement {
        const dragPlaceholder = document.createElement('div');
        dragPlaceholder.className = 'drag-placeholder';
        return dragPlaceholder;
    }

    // 模块编号：1
    // 功能：获取文档属性（frontmatter）的行数
    // 输入：doc (any) - 文档对象
    // 输出：number - 文档属性的行数
    private getFrontmatterLineCount(doc: any): number {
        let lineCount = 0;
        const firstLine = doc.line(1);
        if (firstLine.text.trim() !== '---') {
            return 0; // 没有文档属性
        }
        for (let i = 2; i <= doc.lines; i++) {
            lineCount++;
            const line = doc.line(i);
            if (line.text.trim() === '---') {
                return lineCount + 1; // +1 包括结束的 "---" 行
            }
        }
        return 0; // 未找到结束的文档属性分隔符
    }

    // 模块编号：2
    // 功能：显示拖动占位符
    // 输入：view (EditorView) - 编辑器视图, pos (number) - 当前位置, sourceLineNumber (number) - 源行号
    // 输出：无
    showDragPlaceholder(view: EditorView, pos: number, sourceLineNumber: number) {
        const doc = view.state.doc;
        const frontmatterLineCount = this.getFrontmatterLineCount(doc);
        const firstContentLineNumber = frontmatterLineCount + 1;
        const line = doc.lineAt(pos);
        let placeholderPos: number;
        let targetLineNumber: number;

        if (line.number < firstContentLineNumber) {
            placeholderPos = doc.line(firstContentLineNumber).from;
            targetLineNumber = firstContentLineNumber;
        } else if (pos >= doc.length) {
            placeholderPos = doc.length;
            targetLineNumber = doc.lines + 1;
        } else if (pos <= line.from + (line.to - line.from) / 2) {
            placeholderPos = line.from;
            targetLineNumber = line.number;
        } else {
            placeholderPos = line.to + 1;
            targetLineNumber = line.number + 1;
        }

        const rect = view.coordsAtPos(placeholderPos);
        if (!rect) return;

        const lineElement = view.dom.querySelector('.cm-line');
        if (!lineElement) return;

        const lineRect = lineElement.getBoundingClientRect();

        this.element.classList.add('drag-placeholder-visible');
        this.element.style.setProperty('--left', `${lineRect.left}px`);
        this.element.style.setProperty('--width', `${lineRect.width}px`);

        if (targetLineNumber === firstContentLineNumber) {
            const firstContentLineRect = view.coordsAtPos(placeholderPos);
            if (firstContentLineRect) {
                this.element.style.setProperty('--top', `${firstContentLineRect.top - 5}px`);
            }
        } else if (targetLineNumber > doc.lines) {
            this.element.style.setProperty('--top', `${rect.bottom + 2}px`);
        } else {
            const currentLineRect = view.coordsAtPos(line.from);
            const nextLineRect = view.coordsAtPos(doc.line(targetLineNumber).from);
            if (currentLineRect && nextLineRect) {
                this.element.style.setProperty('--top', `${(currentLineRect.bottom + nextLineRect.top) / 2}px`);
            }
        }

        this.currentPosition = placeholderPos;
        this.targetLine = targetLineNumber;
        this.sourceLineNumber = sourceLineNumber;
    }

    // 模块编号：3
    // 功能：隐藏拖动占位符
    // 输入：无
    // 输出：无
    hideDragPlaceholder() {
        this.element.classList.remove('drag-placeholder-visible');
        this.currentPosition = null;
        this.targetLine = null;
        this.sourceLineNumber = null;
    }

    // 模块编号：4
    // 功能：获取占位符位置
    // 输入：无
    // 输出：number | null - 占位符位置
    getPlaceholderPosition(): number | null {
        return this.currentPosition;
    }

    // 模块编号：5
    // 功能：获取目标行号
    // 输入：无
    // 输出：number | null - 目标行号
    getTargetLine(): number | null {
        return this.targetLine;
    }

    // 模块编号：6
    // 功能：获取源行号
    // 输入：无
    // 输出：number | null - 源行号
    getSourceLineNumber(): number | null {
        return this.sourceLineNumber;
    }
}