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
        dragPlaceholder.style.position = 'absolute';
        dragPlaceholder.style.height = '2px';
        dragPlaceholder.style.backgroundColor = 'var(--interactive-accent)';
        dragPlaceholder.style.display = 'none';
        dragPlaceholder.style.zIndex = '1000';
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
            // 如果目标位置在文档属性内，将占位符放在第一个内容行的顶部
            placeholderPos = doc.line(firstContentLineNumber).from;
            targetLineNumber = firstContentLineNumber;
        } else if (pos >= doc.length) {
            // 如果在文档末尾，将占位符放在最后
            placeholderPos = doc.length;
            targetLineNumber = doc.lines + 1;
        } else if (pos <= line.from + (line.to - line.from) / 2) {
            // 如果在行的上半部分，将占位符放在行的开始
            placeholderPos = line.from;
            targetLineNumber = line.number;
        } else {
            // 如果在行的下半部分，将占位符放在下一行的开始
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

        if (targetLineNumber === firstContentLineNumber) {
            // 如果是在第一个内容行，将占位符放在其上方
            const firstContentLineRect = view.coordsAtPos(placeholderPos);
            if (firstContentLineRect) {
                this.element.style.top = `${firstContentLineRect.top - 5}px`;
            }
        } else if (targetLineNumber > doc.lines) {
            // 如果是在文档末尾，将占位符放在最后一行下方
            this.element.style.top = `${rect.bottom + 2}px`;
        } else {
            // 其他情况，将占位符放在两行之间
            const currentLineRect = view.coordsAtPos(line.from);
            const nextLineRect = view.coordsAtPos(doc.line(targetLineNumber).from);
            if (currentLineRect && nextLineRect) {
                this.element.style.top = `${(currentLineRect.bottom + nextLineRect.top) / 2}px`;
            }
        }

        this.currentPosition = placeholderPos;
        this.targetLine = targetLineNumber;
        this.sourceLineNumber = sourceLineNumber;

        // console.log('占位符位置:', {
        //     位置: this.currentPosition,
        //     目标行号: this.targetLine,
        //     源行号: this.sourceLineNumber,
        //     当前行内容: line.text,
        //     矩形: {top: rect.top, left: rect.left},
        //     文档属性行数: frontmatterLineCount,
        //     第一个内容行号: firstContentLineNumber
        // });
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