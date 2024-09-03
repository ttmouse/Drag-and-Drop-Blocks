import { WidgetType, ViewUpdate, ViewPlugin, DecorationSet, Decoration, EditorView } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

// 1. 拖动手柄小部件类
class DragHandleWidget extends WidgetType {
    toDOM() {
        const span = document.createElement("span");
        span.className = "cm-drag-handler-container";
        span.setAttribute("draggable", "true");
        span.setAttribute("contenteditable", "false");
        span.innerHTML = `
            <span class="clickable-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-grip-vertical">
                    <circle cx="9" cy="12" r="1"></circle>
                    <circle cx="9" cy="5" r="1"></circle>
                    <circle cx="9" cy="19" r="1"></circle>
                    <circle cx="15" cy="12" r="1"></circle>
                    <circle cx="15" cy="5" r="1"></circle>
                    <circle cx="15" cy="19" r="1"></circle>
                </svg>
            </span>
        `;
        return span;
    }
}

// 2. 状态效果定义
const addDragHandle = StateEffect.define<{from: number, to: number}>();
const setDraggingLine = StateEffect.define<number | null>();

// 3. 拖动手柄状态字段
const dragHandleField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none;
    },
    update(handles, tr) {
        handles = handles.map(tr.changes);
        for (let e of tr.effects) {
            if (e.is(addDragHandle)) {
                handles = handles.update({
                    add: [Decoration.widget({
                        widget: new DragHandleWidget(),
                        side: -1
                    }).range(e.value.from)]
                });
            }
        }
        return handles;
    },
    provide: f => EditorView.decorations.from(f)
});

// 4. 拖动行状态字段
const draggingLineField = StateField.define<number | null>({
    create() { return null; },
    update(value, tr) {
        for (let e of tr.effects) {
            if (e.is(setDraggingLine)) {
                return e.value;
            }
        }
        return value;
    },
    provide: f => EditorView.decorations.from(f, value => {
        return (view: EditorView) => {
            if (value === null) return Decoration.none;
            let line = view.state.doc.line(value);
            return Decoration.set(Decoration.line({ class: "cm-dragging-line" }).range(line.from));
        };
    })
});

// 5. 拖动手柄插件
const dragHandlePlugin = ViewPlugin.fromClass(class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.createDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.createDecorations(update.view);
        }
    }

    createDecorations(view: EditorView) {
        let widgets = [];
        for (let {from, to} of view.visibleRanges) {
            for (let pos = from; pos <= to;) {
                let line = view.state.doc.lineAt(pos);
                widgets.push(Decoration.widget({
                    widget: new DragHandleWidget(),
                    side: -1
                }).range(line.from));
                pos = line.to + 1;
            }
        }
        return Decoration.set(widgets);
    }
}, {
    decorations: v => v.decorations
});

export { dragHandleField, draggingLineField, dragHandlePlugin, setDraggingLine };