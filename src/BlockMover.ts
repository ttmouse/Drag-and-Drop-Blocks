import { EditorView } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';

export class BlockMover {
    // 模块编号：1
    // 功能：移动文本块
    // 输入：view (EditorView), fromLine (number), toLine (number)
    // 输出：无
    static moveBlock(view: EditorView, fromLine: number, toLine: number) {
        const doc = view.state.doc;
        const totalLines = doc.lines;

        // 确保行号在有效范围内
        fromLine = Math.max(1, Math.min(fromLine, totalLines));
        toLine = Math.max(1, Math.min(toLine, totalLines + 1));

        // 检查是否是相邻行移动的情况
        if (toLine === fromLine + 1 || fromLine === toLine) {
            return;
        }

        const fromLineContent = doc.line(fromLine);
        const lineContent = fromLineContent.text;

        let changes = [];
        let insertPos;
        let newCursorPos;

        if (toLine > fromLine) {
            // 向下移动
            if (toLine > totalLines) {
                // 移动到文档末尾
                const lastLine = doc.line(totalLines);
                insertPos = lastLine.to;
                changes = [
                    { from: insertPos, insert: '\n' + lineContent },
                    { from: fromLineContent.from, to: fromLineContent.to + (fromLine === totalLines ? 0 : 1), insert: '' }
                ];
                newCursorPos = insertPos + lineContent.length + 1;
            } else {
                const targetLine = doc.line(toLine - 1);
                insertPos = targetLine.to;
                changes = [
                    { from: insertPos, insert: '\n' + lineContent },
                    { from: fromLineContent.from, to: fromLineContent.to + 1, insert: '' }
                ];
                newCursorPos = insertPos + lineContent.length + 1;
            }
        } else {
            // 向上移动
            const targetLine = doc.line(toLine - 1);
            insertPos = targetLine.to;

            if (fromLine === totalLines) {
                // 如果是最后一行向上移动,直接删除最后一行内容。
                const secondLastLine = doc.line(totalLines - 1);
                changes = [
                    { from: insertPos, insert: '\n' + lineContent },
                    { from: secondLastLine.to, to: doc.length }
                ];
            } else {
                changes = [
                    { from: insertPos, insert: '\n' + lineContent },
                    { from: fromLineContent.from, to: fromLineContent.to + 1, insert: '' }
                ];
            }
            newCursorPos = insertPos + lineContent.length + 1;
        }
        
        try {
            view.dispatch({
                changes: changes,
                selection: EditorSelection.cursor(Math.min(newCursorPos, doc.length))
            });
        } catch (error) {
            // console.error('移动块时出错:', error);
        }
    }
}