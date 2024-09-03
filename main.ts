import { Plugin } from 'obsidian';
import { EditorView } from '@codemirror/view';
import { DragVisuals } from './src/DragVisuals/DragVisuals';
import { dragHandleField, draggingLineField, dragHandlePlugin } from './src/DragVisuals/DragHandleManager';
import { BlockMover } from './src/BlockMover';
import { getEditorView } from './src/utils';


export default class DragAndDropBlocksPlugin extends Plugin {
    private dragVisuals: DragVisuals;
    private draggingStartPos: number | null = null;
    private sourceLineNumber: number | null = null;


    // 1. 插件加载
    async onload() {

        this.dragVisuals = new DragVisuals(this.app);

        this.registerEditorExtension([
            dragHandleField,
            draggingLineField,
            dragHandlePlugin,
            ...DragVisuals.getDragExtensions()
        ]);

        // 1.1 添加拖动和放置事件监听器
        this.addDragAndDropListeners();


    }

    // 2. 插件卸载
    onunload() {
    }

    // 3. 添加拖放监听器
    private addDragAndDropListeners() {
        this.registerDomEvent(document, 'dragstart', this.onDragStart.bind(this));
        this.registerDomEvent(document, 'dragover', this.onDragOver.bind(this));
        this.registerDomEvent(document, 'drop', this.onDrop.bind(this));
        this.registerDomEvent(document, 'dragend', this.onDragEnd.bind(this));
    }


    // 4. 拖动开始事件处理 
    private onDragStart(event: DragEvent) {

        console.clear();
        // 4.1 获取拖动目标元素
        const target = event.target as HTMLElement;
        // 4.2 如果目标不是拖动手柄容器，则退出
        if (!target.classList.contains('cm-drag-handler-container')) return;

        // 4.3 获取编辑器视图
        const view = getEditorView(this.app);
        // 4.4 如果无法获取视图，则退出
        if (!view) return;

        // 4.5 获取目标元素在文档中的位置
        const pos = view.posAtDOM(target);
        // 4.6 如果无法获取位置，则退出
        if (pos === null) return;

        // 4.7 获取拖动开始的行
        const line = view.state.doc.lineAt(pos);
        // 4.8 记录拖动开始的位置
        this.draggingStartPos = line.from;
        this.sourceLineNumber = line.number;

        // 4.9 设置拖动效果为移动
        event.dataTransfer!.effectAllowed = 'move';

        // 创建拖动预览
        this.dragVisuals.createDragPreview(line.text, event);
        // 设置正在拖动的行
        this.dragVisuals.setDraggingLine(view, line.number);
    }


    // 5. 拖动过程中事件处理，拖动过程中的视觉反馈
    private onDragOver(event: DragEvent) {
        event.preventDefault();
        const view = getEditorView(this.app);
        if (!view || this.sourceLineNumber === null) return;

        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos === null) return;

        this.dragVisuals.showDragPlaceholder(view, pos, this.sourceLineNumber);
    }

    // 6. 拖动结束事件处理，它决定了拖动结束后块的最终位置
    private onDrop(event: DragEvent) {
        event.preventDefault();
        console.log('6.1 拖放事件触发');
    
        const view = getEditorView(this.app);
        if (!view) {
            console.error('6.2 未找到编辑器视图');
            return;
        }
    
        const targetLine = this.dragVisuals.getTargetLine();
        const sourceLineNumber = this.dragVisuals.getSourceLineNumber();
        
        console.log('6.3 拖放信息:', {
            源行号: sourceLineNumber,
            目标行号: targetLine
        });
        
        if (targetLine === null || sourceLineNumber === null) {
            console.error('6.4 无法确定目标行或源行');
            return;
        }
    
        // 6.5 检查是否需要移动
        if (sourceLineNumber !== targetLine && targetLine !== sourceLineNumber + 1) {
            console.log('6.6 正在移动块');
            BlockMover.moveBlock(view, sourceLineNumber, targetLine);
        } else {
            console.log('6.7 源行和目标行相同或相邻，无需移动');
        }
    
        this.dragVisuals.hideDragPlaceholder();
        this.dragVisuals.setDraggingLine(view, null);
        console.log('6.8 拖放完成');
    }
    
    // 7. 获取文档属性信息结束位置
    private getFrontmatterEndPosition(doc: any): number {
        const firstLine = doc.line(1);
        if (firstLine.text.trim() !== '---') {
            return 0; // 没有文档属性信息
        }
        for (let i = 2; i <= doc.lines; i++) {
            const line = doc.line(i);
            if (line.text.trim() === '---') {
                return line.to;
            }
        }
        return 0; // 未找到结束的文档属性信息分隔符
    }

    // 8. 判断是否应该在当前位置之前插入
    private shouldInsertBefore(view: EditorView, pos: number): boolean {
        const line = view.state.doc.lineAt(pos);
        const lineStart = line.from;
        const lineMiddle = lineStart + Math.floor(line.length / 2);
        return pos < lineMiddle;
    }

    // 9. 拖动结束事件处理
    private onDragEnd(event: DragEvent) {
        const view = getEditorView(this.app);
        if (!view) return;

        this.dragVisuals.hideDragPlaceholder();
        this.dragVisuals.setDraggingLine(view, null);

        this.draggingStartPos = null;
    }
}