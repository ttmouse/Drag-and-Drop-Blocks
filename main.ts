import { Plugin, MarkdownView, Editor } from 'obsidian';

export default class BlockReorderPlugin extends Plugin {
    // 1. 定义拖动句柄和当前行元素
    dragHandle: HTMLElement;
    draggingElement: HTMLElement | null = null;
    dragStartY: number = 0;

    // 2. 插件加载时的初始化
    async onload() {
        console.log('Loading Block Reorder plugin');

        // 2.1 创建拖动句柄
        this.dragHandle = document.createElement('div');
        this.dragHandle.addClass('block-drag-handle');
        this.dragHandle.innerHTML = '⋮⋮';
        document.body.appendChild(this.dragHandle);

        // 2.2 注册事件监听器
        this.registerDomEvent(document, 'mouseover', this.onMouseOver.bind(this));
        this.registerDomEvent(document, 'mouseout', this.onMouseOut.bind(this));
        this.registerDomEvent(this.dragHandle, 'mousedown', this.onDragStart.bind(this));
        this.registerDomEvent(document, 'mousemove', this.onDragMove.bind(this));
        this.registerDomEvent(document, 'mouseup', this.onDragEnd.bind(this));

        console.log('Block Reorder plugin loaded successfully');
    }

    // 3. 插件卸载时的清理
    onunload() {
        console.log('Unloading Block Reorder plugin');
        this.dragHandle.remove();
    }

    // 4. 鼠标悬停事件处理
    onMouseOver(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target.matches('.cm-line')) {
            this.showDragHandle(target);
        }
    }

    // 5. 鼠标移出事件处理
    onMouseOut(event: MouseEvent) {
        const relatedTarget = event.relatedTarget as HTMLElement;
        if (relatedTarget !== this.dragHandle && !relatedTarget?.closest('.block-drag-handle')) {
            this.hideDragHandle();
        }
    }

    // 6. 显示拖动句柄
    showDragHandle(target: HTMLElement) {
        const rect = target.getBoundingClientRect();
        this.dragHandle.style.display = 'block';
        this.dragHandle.style.top = `${rect.top + window.scrollY}px`;
        this.dragHandle.style.left = `${rect.left + window.scrollX - 20}px`;
    }

    // 7. 隐藏拖动句柄
    hideDragHandle() {
        this.dragHandle.style.display = 'none';
    }

    // 8. 开始拖动
    onDragStart(event: MouseEvent) {
        const lineElement = this.getLineElementFromPoint(event.clientX, event.clientY);
        if (lineElement) {
            this.draggingElement = lineElement;
            this.dragStartY = event.clientY;
            event.preventDefault();
        }
    }

    // 9. 拖动过程
    onDragMove(event: MouseEvent) {
        if (this.draggingElement) {
            const hoverElement = this.getLineElementFromPoint(event.clientX, event.clientY);
            if (hoverElement && hoverElement !== this.draggingElement) {
                const rect = hoverElement.getBoundingClientRect();
                if (event.clientY < rect.top + rect.height / 2) {
                    hoverElement.parentNode?.insertBefore(this.draggingElement, hoverElement);
                } else {
                    hoverElement.parentNode?.insertBefore(this.draggingElement, hoverElement.nextElementSibling);
                }
            }
        }
    }

    // 10. 结束拖动
    onDragEnd() {
        if (this.draggingElement) {
            this.updateEditorContent();
            this.draggingElement = null;
        }
    }

    // 11. 获取鼠标位置下的行元素
    getLineElementFromPoint(x: number, y: number): HTMLElement | null {
        const element = document.elementFromPoint(x, y);
        return element ? element.closest('.cm-line') : null;
    }

    // 12. 更新编辑器内容
    updateEditorContent() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
            const editor = view.editor;
            const content = Array.from(document.querySelectorAll('.cm-line'))
                .map(line => (line as HTMLElement).innerText)
                .join('\n');
            editor.setValue(content);
        }
    }
}