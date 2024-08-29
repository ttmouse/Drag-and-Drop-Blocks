import { Plugin, MarkdownView, Editor } from 'obsidian';

// 1. 块重排插件类
export default class BlockReorderPlugin extends Plugin {
    dragHandle: HTMLElement;
    draggingElement: HTMLElement | null = null;
    dragStartY: number = 0;
    dragPlaceholder: HTMLElement;
    dragPreview: HTMLElement;
    originalContent: string = '';
    currentLine: HTMLElement | null = null;
    hideTimeout: NodeJS.Timeout | null = null;

    // 1.1 插件加载
    async onload() {
        console.log('Loading Block Reorder plugin');

        // 1.1.1 创建拖动手柄
        this.dragHandle = this.createDragHandle();
        document.body.appendChild(this.dragHandle);

        // 1.1.2 创建拖动占位符
        this.dragPlaceholder = document.createElement('div');
        this.dragPlaceholder.addClass('drag-placeholder');
        document.body.appendChild(this.dragPlaceholder);

        // 1.1.3 创建拖动预览
        this.dragPreview = document.createElement('div');
        this.dragPreview.addClass('drag-preview');
        document.body.appendChild(this.dragPreview);

        // 1.1.4 注册事件监听器
        this.registerDomEvent(document, 'mousemove', this.onMouseMove.bind(this));
        this.registerDomEvent(this.dragHandle, 'mousedown', this.onDragStart.bind(this));
        this.registerDomEvent(document, 'mousemove', this.onDragMove.bind(this));
        this.registerDomEvent(document, 'mouseup', this.onDragEnd.bind(this));

        console.log('Block Reorder plugin loaded successfully');
    }

    // 1.2 创建拖动手柄
    createDragHandle(): HTMLElement {
        const dragHandle = document.createElement('div');
        dragHandle.className = 'cm-drag-handler-container';
        dragHandle.innerHTML = `
            <span class="clickable-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-grip-vertical">
                    <circle cx="9" cy="12" r="1"></circle>
                    <circle cx="9" cy="5" r="1"></circle>
                    <circle cx="9" cy="19" r="1"></circle>
                    <circle cx="15" cy="12" r="1"></circle>
                    <circle cx="15" cy="5" r="1"></circle>
                    <circle cx="15" cy="19" r="1"></circle>
                </svg>
            </span>
        `;
        return dragHandle;
    }

    // 1.3 鼠标移动处理
    onMouseMove = (event: MouseEvent) => {
        if (this.draggingElement) return; // 如果正在拖拽，不处理滑块显示

        const target = event.target as HTMLElement;
        const cmLine = this.getNearestLine(event.clientX, event.clientY);

        if (cmLine) {
            this.currentLine = cmLine;
            this.showDragHandle(cmLine);
        } else if (this.dragHandle && !this.isMouseNearHandle(event)) {
            this.hideDragHandle();
        }
    }

    // 1.16 获取最近的行元素
    getNearestLine(x: number, y: number): HTMLElement | null {
        const lines = Array.from(document.querySelectorAll('.cm-line')) as HTMLElement[];
        let nearestLine = null;
        let minDistance = Infinity;

        for (const line of lines) {
            const rect = line.getBoundingClientRect();
            const distance = Math.min(
                Math.abs(y - rect.top),
                Math.abs(y - rect.bottom)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestLine = line;
            }
        }

        return nearestLine;
    }



    // 1.15 检查鼠标是否在滑块附近
    isMouseNearHandle(event: MouseEvent): boolean {
        if (!this.dragHandle) return false;

        const handleRect = this.dragHandle.getBoundingClientRect();
        const buffer = 20; // 扩大检测区域

        return (
            event.clientX >= handleRect.left - buffer &&
            event.clientX <= handleRect.right + buffer &&
            event.clientY >= handleRect.top - buffer &&
            event.clientY <= handleRect.bottom + buffer
        );
    }


    // 1.2 插件卸载
    onunload() {
        console.log('Unloading Block Reorder plugin');
        this.dragHandle.remove();
        this.dragPlaceholder.remove();
        this.dragPreview.remove();
    }

    // 1.3 鼠标悬停处理
    onMouseOver(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const cmLine = target.closest('.cm-line');
        if (cmLine) {
            this.currentLine = cmLine as HTMLElement;
            this.showDragHandle(this.currentLine);
        }
    }



    // 1.4 显示拖动手柄
    showDragHandle(target: HTMLElement) {
        if (!this.dragHandle) return;

        const rect = target.getBoundingClientRect();
        const distanceFromText = 30; // 可以调整这个值来改变滑块与文本的距离
        const squareSize = 26; // 正方形的大小

        // 检查是否是标题行
        const isHeader = target.classList.contains('HyperMD-header');

        let verticalPosition;
        if (isHeader) {
            // 如果是标题，与 cm-header span 对齐
            const headerSpan = target.querySelector('.cm-header');
            if (headerSpan) {
                const headerRect = headerSpan.getBoundingClientRect();
                verticalPosition = headerRect.top + (headerRect.height - squareSize) / 2;
            } else {
                // 如果找不到 cm-header span，则使用整行高度
                verticalPosition = rect.top + (rect.height - squareSize) / 2;
            }
        } else {
            // 非标题行，使用整行高度
            verticalPosition = rect.top + (rect.height - squareSize) / 2;
        }

        this.dragHandle.style.top = `${verticalPosition + window.scrollY}px`;
        this.dragHandle.style.left = `${rect.left + window.scrollX - distanceFromText}px`;
        this.dragHandle.style.width = `${squareSize}px`;
        this.dragHandle.style.height = `${squareSize}px`;
        this.dragHandle.style.display = 'flex';
    }




    // 1.5 隐藏拖动手柄,延时100毫秒
    hideDragHandle = () => {
        if (this.dragHandle) {
            // 使用 setTimeout 来延迟隐藏滑块
            setTimeout(() => {
                if (this.dragHandle && !this.isMouseNearHandle(event as MouseEvent)) {
                    this.dragHandle.style.display = 'none';
                }
            }, 100); // 100ms 延迟
        }
    }

    // 1.7 开始拖动
    onDragStart = (event: MouseEvent) => {
        if (this.currentLine) {
            this.draggingElement = this.currentLine;
            this.dragStartY = event.clientY;
            this.hideDragHandle();  // 确保在拖拽开始时隐藏滑块
            this.dragPreview.innerHTML = this.draggingElement.innerHTML;
            this.dragPreview.style.display = 'block';
            this.dragPreview.style.top = `${event.clientY}px`;
            this.dragPreview.style.left = `${event.clientX}px`;
            this.draggingElement.classList.add('dragging');
            this.originalContent = this.draggingElement.innerHTML;
            event.preventDefault();
            event.stopPropagation();
        }
    }


    // 1.8 拖动过程
    onDragMove = (event: MouseEvent) => {
        if (this.draggingElement) {
            this.hideDragHandle();
            
            this.dragPreview.style.top = `${event.clientY}px`;
            this.dragPreview.style.left = `${event.clientX}px`;
    
            const nearestLine = this.getNearestLine(event.clientX, event.clientY);
            if (nearestLine && nearestLine !== this.draggingElement) {
                const rect = nearestLine.getBoundingClientRect();
                const midPoint = rect.top + rect.height / 2;
    
                if (event.clientY < midPoint) {
                    this.showPlaceholder(nearestLine, 'before');
                } else {
                    const nextElement = nearestLine.nextElementSibling as HTMLElement;
                    if (nextElement && nextElement.matches('.cm-line')) {
                        this.showPlaceholder(nextElement, 'before');
                    } else {
                        this.showPlaceholder(nearestLine, 'after');
                    }
                }
            } else {
                this.hidePlaceholder();
            }
        }
    }

    // 1.9 结束拖动
    onDragEnd = (event: MouseEvent) => {
        if (this.draggingElement) {
            this.dragPreview.style.display = 'none';
            this.hidePlaceholder();
    
            const nearestLine = this.getNearestLine(event.clientX, event.clientY);
            if (nearestLine && nearestLine !== this.draggingElement) {
                const rect = nearestLine.getBoundingClientRect();
                if (event.clientY < rect.top + rect.height / 2) {
                    nearestLine.parentNode?.insertBefore(this.draggingElement, nearestLine);
                } else {
                    nearestLine.parentNode?.insertBefore(this.draggingElement, nearestLine.nextElementSibling);
                }
            }
    
            this.draggingElement.classList.remove('dragging');
            this.updateEditorContent();
            this.draggingElement = null;
    
            // 移除鼠标移动和鼠标释放的事件监听器
            document.removeEventListener('mousemove', this.onDragMove);
            document.removeEventListener('mouseup', this.onDragEnd);
    
            // 拖拽结束后，如果鼠标在某一行附近，重新显示滑块
            const lineElement = this.getNearestLine(event.clientX, event.clientY);
            if (lineElement) {
                this.showDragHandle(lineElement);
            }
        }
    }


    // 1.10 获取鼠标位置下的行元素
    getLineElementFromPoint(x: number, y: number): HTMLElement | null {
        const elements = document.elementsFromPoint(x, y);
        for (const element of elements) {
            if (element.classList.contains('cm-line')) {
                return element as HTMLElement;
            }
            // 检查元素是否在 cm-line 的左侧或右侧
            const rect = element.getBoundingClientRect();
            if (Math.abs(x - rect.left) <= 120 || Math.abs(x - rect.right) <= 120) {
                const closestLine = element.closest('.cm-line');
                if (closestLine) {
                    return closestLine as HTMLElement;
                }
            }
        }
        return null;
    }

    // 1.11 更新编辑器内容
    updateEditorContent() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
            const editor = view.editor;
            const content = editor.getValue();
            const lines = content.split('\n');
            const frontMatterEndIndex = this.getFrontMatterEndIndex(lines);

            // 1.11.1 获取新的行顺序，保留空行
            const newOrder = Array.from(document.querySelectorAll('.cm-line'))
                .map(line => line.textContent || '');

            // 1.11.2 更新内容部分，保留前置元数据和所有行（包括空行）
            const updatedContent = [
                ...lines.slice(0, frontMatterEndIndex),
                ...newOrder
            ].join('\n');

            // 1.11.3 设置新内容
            editor.setValue(updatedContent);
        }
    }

    // 1.12 获取前置元数据结束索引
    getFrontMatterEndIndex(lines: string[]): number {
        if (lines[0] === '---') {
            for (let i = 1; i < lines.length; i++) {
                if (lines[i] === '---') {
                    return i + 1;
                }
            }
        }
        return 0;
    }

    // 1.13 显示占位符
    showPlaceholder(element: HTMLElement, position: 'before' | 'after') {
        const rect = element.getBoundingClientRect();
        this.dragPlaceholder.style.display = 'block';
        this.dragPlaceholder.style.width = `${rect.width}px`;
        this.dragPlaceholder.style.left = `${rect.left}px`;

        // 调整占位线的位置，使其显示在两个文本之间
        if (position === 'before') {
            this.dragPlaceholder.style.top = `${rect.top - 5}px`;  // -1px 使线略微向上偏移
        } else {
            this.dragPlaceholder.style.top = `${rect.bottom}px`;
        }
    }

    // 1.14 隐藏占位符
    hidePlaceholder() {
        this.dragPlaceholder.style.display = 'none';
    }
}