import { EditorView } from '@codemirror/view';

export class BlockMover {
    static moveBlock(view: EditorView, fromLine: number, toLine: number): boolean {
        const doc = view.state.doc;
        const totalLines = doc.lines;

        // 验证输入
        if (fromLine < 1 || fromLine > totalLines || toLine < 1 || toLine > totalLines) {
            console.error("无效的行号");
            return false;
        }

        // 如果源行和目标行相同，无需移动
        if (fromLine === toLine) {
            return true;
        }

        // 获取要移动的行的内容
        const lineToMove = doc.line(fromLine);
        const contentToMove = lineToMove.text;

        // 确定实际的插入位置
        const targetLine = doc.line(toLine);
        const insertPos = toLine > fromLine ? targetLine.to : targetLine.from;

        // 准备变更
        let changes = [];

        // 删除原位置的内容
        changes.push({ from: lineToMove.from, to: lineToMove.to + 1, insert: '' });

        // 在新位置插入内容
        changes.push({ from: insertPos, insert: contentToMove + '\n' });

        // 应用变更
        view.dispatch({ changes: changes });

        console.log('移动行:', {
            从: fromLine,
            到: toLine,
            内容: contentToMove
        });

        return true;
    }
}
