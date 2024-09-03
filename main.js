/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => DragAndDropBlocksPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/DragVisuals/DragVisuals.ts
var import_obsidian = require("obsidian");

// src/DragVisuals/DragPlaceholder.ts
var DragPlaceholder = class {
  constructor() {
    this.currentPosition = null;
    this.targetLine = null;
    this.sourceLineNumber = null;
    this.element = this.createDragPlaceholderElement();
    document.body.appendChild(this.element);
  }
  createDragPlaceholderElement() {
    const dragPlaceholder = document.createElement("div");
    dragPlaceholder.className = "drag-placeholder";
    dragPlaceholder.style.position = "absolute";
    dragPlaceholder.style.height = "2px";
    dragPlaceholder.style.backgroundColor = "var(--interactive-accent)";
    dragPlaceholder.style.display = "none";
    dragPlaceholder.style.zIndex = "1000";
    return dragPlaceholder;
  }
  getFrontmatterEndPosition(doc) {
    const firstLine = doc.line(1);
    if (firstLine.text.trim() !== "---") {
      return 0;
    }
    for (let i = 2; i <= doc.lines; i++) {
      const line = doc.line(i);
      if (line.text.trim() === "---") {
        return line.to;
      }
    }
    return 0;
  }
  showDragPlaceholder(view, pos, sourceLineNumber) {
    const doc = view.state.doc;
    const line = doc.lineAt(pos);
    let placeholderPos;
    let targetLineNumber;
    const frontmatterEndPos = this.getFrontmatterEndPosition(doc);
    const firstContentLine = doc.lineAt(frontmatterEndPos);
    if (pos <= firstContentLine.from) {
      placeholderPos = firstContentLine.from;
      targetLineNumber = firstContentLine.number;
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
    if (!rect)
      return;
    const lineElement = view.dom.querySelector(".cm-line");
    if (!lineElement)
      return;
    const lineRect = lineElement.getBoundingClientRect();
    this.element.style.display = "block";
    this.element.style.left = `${lineRect.left}px`;
    this.element.style.width = `${lineRect.width}px`;
    this.element.style.height = "2px";
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
  hideDragPlaceholder() {
    this.element.style.display = "none";
    this.currentPosition = null;
    this.targetLine = null;
    this.sourceLineNumber = null;
  }
  getPlaceholderPosition() {
    return this.currentPosition;
  }
  getTargetLine() {
    return this.targetLine;
  }
  getSourceLineNumber() {
    return this.sourceLineNumber;
  }
};

// src/DragVisuals/DragHandleManager.ts
var import_view = require("@codemirror/view");
var import_state = require("@codemirror/state");
var DragHandleWidget = class extends import_view.WidgetType {
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
};
var addDragHandle = import_state.StateEffect.define();
var setDraggingLine = import_state.StateEffect.define();
var dragHandleField = import_state.StateField.define({
  create() {
    return import_view.Decoration.none;
  },
  update(handles, tr) {
    handles = handles.map(tr.changes);
    for (let e of tr.effects) {
      if (e.is(addDragHandle)) {
        handles = handles.update({
          add: [import_view.Decoration.widget({
            widget: new DragHandleWidget(),
            side: -1
          }).range(e.value.from)]
        });
      }
    }
    return handles;
  },
  provide: (f) => import_view.EditorView.decorations.from(f)
});
var draggingLineField = import_state.StateField.define({
  create() {
    return null;
  },
  update(value, tr) {
    for (let e of tr.effects) {
      if (e.is(setDraggingLine)) {
        return e.value;
      }
    }
    return value;
  },
  provide: (f) => import_view.EditorView.decorations.from(f, (value) => {
    return (view) => {
      if (value === null)
        return import_view.Decoration.none;
      let line = view.state.doc.line(value);
      return import_view.Decoration.set(import_view.Decoration.line({ class: "cm-dragging-line" }).range(line.from));
    };
  })
});
var dragHandlePlugin = import_view.ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.createDecorations(view);
  }
  update(update) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.createDecorations(update.view);
    }
  }
  createDecorations(view) {
    let widgets = [];
    for (let { from, to } of view.visibleRanges) {
      for (let pos = from; pos <= to; ) {
        let line = view.state.doc.lineAt(pos);
        widgets.push(import_view.Decoration.widget({
          widget: new DragHandleWidget(),
          side: -1
        }).range(line.from));
        pos = line.to + 1;
      }
    }
    return import_view.Decoration.set(widgets);
  }
}, {
  decorations: (v) => v.decorations
});

// src/DragVisuals/DragVisuals.ts
var DragVisuals = class {
  constructor(app) {
    this.app = app;
    this.dragPlaceholder = new DragPlaceholder();
  }
  showDragPlaceholder(view, pos, sourceLineNumber) {
    this.dragPlaceholder.showDragPlaceholder(view, pos, sourceLineNumber);
  }
  hideDragPlaceholder() {
    this.dragPlaceholder.hideDragPlaceholder();
  }
  createDragPreview(text, event) {
    var _a;
    const dragImage = document.createElement("div");
    dragImage.textContent = text.slice(0, 20) + "...";
    dragImage.className = "drag-preview";
    document.body.appendChild(dragImage);
    (_a = event.dataTransfer) == null ? void 0 : _a.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }
  getEditorView() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view)
      return null;
    return view.editor.cm;
  }
  setDraggingLine(view, lineNumber) {
    view.dispatch({
      effects: setDraggingLine.of(lineNumber)
    });
  }
  static getDragExtensions() {
    return [
      dragHandleField,
      draggingLineField,
      dragHandlePlugin
    ];
  }
  getPlaceholderPosition() {
    return this.dragPlaceholder.getPlaceholderPosition();
  }
  getTargetLine() {
    return this.dragPlaceholder.getTargetLine();
  }
  getSourceLineNumber() {
    return this.dragPlaceholder.getSourceLineNumber();
  }
};

// src/BlockMover.ts
var import_state2 = require("@codemirror/state");
var BlockMover = class {
  static moveBlock(view, fromLine, toLine) {
    console.log("BlockMover.moveBlock \u5F00\u59CB:", {
      \u4ECE\u884C: fromLine,
      \u5230\u884C: toLine
    });
    const doc = view.state.doc;
    const totalLines = doc.lines;
    console.log("\u6587\u6863\u4FE1\u606F:", { \u603B\u884C\u6570: totalLines });
    fromLine = Math.max(1, Math.min(fromLine, totalLines));
    toLine = Math.max(1, Math.min(toLine, totalLines + 1));
    console.log("\u8C03\u6574\u540E\u7684\u884C\u53F7:", { \u4ECE\u884C: fromLine, \u5230\u884C: toLine });
    if (toLine === fromLine + 1 || fromLine === toLine) {
      console.log("\u6E90\u884C\u548C\u76EE\u6807\u884C\u76F8\u540C\u6216\u76F8\u90BB\uFF0C\u65E0\u9700\u79FB\u52A8");
      return;
    }
    const fromLineContent = doc.line(fromLine);
    const lineContent = fromLineContent.text;
    console.log("\u8981\u79FB\u52A8\u7684\u5185\u5BB9:", { \u884C\u5185\u5BB9: lineContent });
    let changes = [];
    let insertPos;
    let newCursorPos;
    if (toLine > fromLine) {
      console.log("\u5411\u4E0B\u79FB\u52A8");
      if (toLine > totalLines) {
        const lastLine = doc.line(totalLines);
        insertPos = lastLine.to;
        changes = [
          { from: insertPos, insert: "\n" + lineContent },
          { from: fromLineContent.from, to: fromLineContent.to + (fromLine === totalLines ? 0 : 1), insert: "" }
        ];
        newCursorPos = insertPos + lineContent.length + 1;
      } else {
        const targetLine = doc.line(toLine - 1);
        insertPos = targetLine.to;
        changes = [
          { from: insertPos, insert: "\n" + lineContent },
          { from: fromLineContent.from, to: fromLineContent.to + 1, insert: "" }
        ];
        newCursorPos = insertPos + lineContent.length + 1;
      }
    } else {
      console.log("\u5411\u4E0A\u79FB\u52A8");
      const targetLine = doc.line(toLine - 1);
      const lastLine = doc.line(doc.lines);
      insertPos = targetLine.to;
      if (fromLine === totalLines) {
        console.log("\u6700\u540E\u4E00\u884C\u5411\u4E0A\u79FB\u52A8");
        const secondLastLine = doc.line(totalLines - 1);
        changes = [
          { from: insertPos, insert: "\n" + lineContent },
          { from: secondLastLine.to, to: doc.length }
        ];
      } else {
        changes = [
          { from: insertPos, insert: "\n" + lineContent },
          { from: fromLineContent.from, to: fromLineContent.to + 1, insert: "" }
        ];
      }
      newCursorPos = insertPos + lineContent.length + 1;
    }
    console.log("\u51C6\u5907\u6267\u884C\u7684\u66F4\u6539:", changes);
    try {
      view.dispatch({
        changes,
        selection: import_state2.EditorSelection.cursor(Math.min(newCursorPos, doc.length))
      });
      console.log("\u6267\u884C\u66F4\u6539:", {
        deleteFrom: fromLine,
        insertAt: toLine,
        insertContent: lineContent,
        newCursorPos
      });
      const newDoc = view.state.doc;
      console.log("\u79FB\u52A8\u540E\u7684\u6587\u6863\u603B\u884C\u6570:", newDoc.lines);
      if (toLine <= newDoc.lines) {
        const newTargetLine = newDoc.line(Math.min(toLine, newDoc.lines));
        console.log("\u65B0\u4F4D\u7F6E\u7684\u5185\u5BB9:", { \u884C\u53F7: Math.min(toLine, newDoc.lines), \u5185\u5BB9: newTargetLine.text });
      } else {
        console.log("\u65B0\u4F4D\u7F6E\u5728\u6587\u6863\u672B\u5C3E");
      }
      if (fromLine <= newDoc.lines) {
        const originalLine = newDoc.line(Math.min(fromLine, newDoc.lines));
        console.log("\u539F\u4F4D\u7F6E\u7684\u5F53\u524D\u5185\u5BB9:", { \u884C\u53F7: Math.min(fromLine, newDoc.lines), \u5185\u5BB9: originalLine.text });
      } else {
        console.log("\u539F\u4F4D\u7F6E\u5DF2\u8D85\u51FA\u6587\u6863\u8303\u56F4");
      }
    } catch (error) {
      console.error("\u79FB\u52A8\u5757\u65F6\u51FA\u9519:", error);
    }
  }
};

// src/utils.ts
var import_obsidian2 = require("obsidian");
function getEditorView(app) {
  const view = app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
  if (!view)
    return null;
  return view.editor.cm;
}

// main.ts
var DragAndDropBlocksPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.draggingStartPos = null;
    this.sourceLineNumber = null;
  }
  async onload() {
    this.dragVisuals = new DragVisuals(this.app);
    this.registerEditorExtension([
      dragHandleField,
      draggingLineField,
      dragHandlePlugin,
      ...DragVisuals.getDragExtensions()
    ]);
    this.addDragAndDropListeners();
  }
  onunload() {
  }
  addDragAndDropListeners() {
    this.registerDomEvent(document, "dragstart", this.onDragStart.bind(this));
    this.registerDomEvent(document, "dragover", this.onDragOver.bind(this));
    this.registerDomEvent(document, "drop", this.onDrop.bind(this));
    this.registerDomEvent(document, "dragend", this.onDragEnd.bind(this));
  }
  onDragStart(event) {
    console.clear();
    const target = event.target;
    if (!target.classList.contains("cm-drag-handler-container"))
      return;
    const view = getEditorView(this.app);
    if (!view)
      return;
    const pos = view.posAtDOM(target);
    if (pos === null)
      return;
    const line = view.state.doc.lineAt(pos);
    this.draggingStartPos = line.from;
    this.sourceLineNumber = line.number;
    event.dataTransfer.effectAllowed = "move";
    this.dragVisuals.createDragPreview(line.text, event);
    this.dragVisuals.setDraggingLine(view, line.number);
  }
  onDragOver(event) {
    event.preventDefault();
    const view = getEditorView(this.app);
    if (!view || this.sourceLineNumber === null)
      return;
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos === null)
      return;
    this.dragVisuals.showDragPlaceholder(view, pos, this.sourceLineNumber);
  }
  onDrop(event) {
    event.preventDefault();
    console.log("6.1 \u62D6\u653E\u4E8B\u4EF6\u89E6\u53D1");
    const view = getEditorView(this.app);
    if (!view) {
      console.error("6.2 \u672A\u627E\u5230\u7F16\u8F91\u5668\u89C6\u56FE");
      return;
    }
    const targetLine = this.dragVisuals.getTargetLine();
    const sourceLineNumber = this.dragVisuals.getSourceLineNumber();
    console.log("6.3 \u62D6\u653E\u4FE1\u606F:", {
      \u6E90\u884C\u53F7: sourceLineNumber,
      \u76EE\u6807\u884C\u53F7: targetLine
    });
    if (targetLine === null || sourceLineNumber === null) {
      console.error("6.4 \u65E0\u6CD5\u786E\u5B9A\u76EE\u6807\u884C\u6216\u6E90\u884C");
      return;
    }
    if (sourceLineNumber !== targetLine && targetLine !== sourceLineNumber + 1) {
      console.log("6.6 \u6B63\u5728\u79FB\u52A8\u5757");
      BlockMover.moveBlock(view, sourceLineNumber, targetLine);
    } else {
      console.log("6.7 \u6E90\u884C\u548C\u76EE\u6807\u884C\u76F8\u540C\u6216\u76F8\u90BB\uFF0C\u65E0\u9700\u79FB\u52A8");
    }
    this.dragVisuals.hideDragPlaceholder();
    this.dragVisuals.setDraggingLine(view, null);
    console.log("6.8 \u62D6\u653E\u5B8C\u6210");
  }
  getFrontmatterEndPosition(doc) {
    const firstLine = doc.line(1);
    if (firstLine.text.trim() !== "---") {
      return 0;
    }
    for (let i = 2; i <= doc.lines; i++) {
      const line = doc.line(i);
      if (line.text.trim() === "---") {
        return line.to;
      }
    }
    return 0;
  }
  shouldInsertBefore(view, pos) {
    const line = view.state.doc.lineAt(pos);
    const lineStart = line.from;
    const lineMiddle = lineStart + Math.floor(line.length / 2);
    return pos < lineMiddle;
  }
  onDragEnd(event) {
    const view = getEditorView(this.app);
    if (!view)
      return;
    this.dragVisuals.hideDragPlaceholder();
    this.dragVisuals.setDraggingLine(view, null);
    this.draggingStartPos = null;
  }
};
