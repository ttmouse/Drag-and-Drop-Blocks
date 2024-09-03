import { Plugin } from 'obsidian';
import { EditorView } from '@codemirror/view';
import { DragVisuals } from './src/DragVisuals/DragVisuals';
import { dragHandleField, draggingLineField, dragHandlePlugin } from './src/DragVisuals/DragHandleManager';
import { BlockMover } from './src/BlockMover';
import { getEditorView } from './src/utils';

export default class DragAndDropBlocksPlugin extends Plugin {
    private dragVisuals: DragVisuals;
    private draggingStartPos: number | null = null;

    async onload() {
        console.log('Loading DragAndDropBlocks plugin');

        this.dragVisuals = new DragVisuals(this.app);

        this.registerEditorExtension([
            dragHandleField,
            draggingLineField,
            dragHandlePlugin,
            ...DragVisuals.getDragExtensions()
        ]);

        // 添加拖动和放置事件监听器
        this.addDragAndDropListeners();


        console.log('DragAndDropBlocks plugin loaded');
    }

    onunload() {
        console.log('Unloading DragAndDropBlocks plugin');
    }

    private addDragAndDropListeners() {
        this.registerDomEvent(document, 'dragstart', this.onDragStart.bind(this));
        this.registerDomEvent(document, 'dragover', this.onDragOver.bind(this));
        this.registerDomEvent(document, 'drop', this.onDrop.bind(this));
        this.registerDomEvent(document, 'dragend', this.onDragEnd.bind(this));
    }

    private onDragStart(event: DragEvent) {
        // 获取拖动目标元素
        const target = event.target as HTMLElement;
        // 如果目标不是拖动手柄容器，则退出
        if (!target.classList.contains('cm-drag-handler-container')) return;

        // 获取编辑器视图
        const view = getEditorView(this.app);
        // 如果无法获取视图，则退出
        if (!view) return;

        // 获取目标元素在文档中的位置
        const pos = view.posAtDOM(target);
        // 如果无法获取位置，则退出
        if (pos === null) return;

        // 获取拖动开始的行
        const line = view.state.doc.lineAt(pos);
        // 记录拖动开始的位置
        this.draggingStartPos = line.from;

        // 记录拖动开始的信息
        console.log('拖动开始:', {
            lineNumber: line.number,
            lineContent: line.text,
            startPosition: this.draggingStartPos
        });

        // 设置拖动效果为移动
        event.dataTransfer!.effectAllowed = 'move';

        // 创建拖动预览
        this.dragVisuals.createDragPreview(line.text, event);
        // 设置正在拖动的行
        this.dragVisuals.setDraggingLine(view, line.number);
    }

    private onDragOver(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move'; // 明确指定为移动操作

        const view = getEditorView(this.app);
        if (!view) return;

        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos === null) return;

        this.dragVisuals.showDragPlaceholder(view, pos);
    }

    private onDrop(event: DragEvent) {
        event.preventDefault();
        const view = getEditorView(this.app);
        if (!view || this.draggingStartPos === null) return;

        const targetPos = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (targetPos === null) return;

        const sourcePos = this.draggingStartPos;
        const sourceLine = view.state.doc.lineAt(sourcePos);
        const targetLine = view.state.doc.lineAt(targetPos);

        console.log('拖动结束:', {
            sourceLineNumber: sourceLine.number,
            targetLineNumber: targetLine.number,
            targetPosition: targetPos
        });

        if (sourceLine.number !== targetLine.number) {
            // 修改：传递正确的目标行号
            let targetLineNumber = targetLine.number;
            if (targetLineNumber > sourceLine.number) {
                targetLineNumber -= 1; // 向下拖动时，目标行号需要减1
            }
            BlockMover.moveBlock(view, sourceLine.number - 1, targetLineNumber - 1);
        }

        this.dragVisuals.hideDragPlaceholder();
        this.dragVisuals.setDraggingLine(view, null);

        this.draggingStartPos = null;
        console.log('Drop completed');
    }

    private onDragEnd(event: DragEvent) {
        const view = getEditorView(this.app);
        if (!view) return;

        this.dragVisuals.hideDragPlaceholder();
        this.dragVisuals.setDraggingLine(view, null);

        this.draggingStartPos = null;
        console.log('Drag ended');
    }
}