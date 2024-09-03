import { EditorView } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';

export class BlockMover {
    // 模块编号：1
    // 功能：移动文本块
    // 输入：view (EditorView), fromLine (number), toLine (number)
    // 输出：无
    static moveBlock(view: EditorView, fromLine: number, toLine: number) {
        console.log('BlockMover.moveBlock 开始:', { 
            从行: fromLine, 
            到行: toLine 
        });

        const doc = view.state.doc;
        const totalLines = doc.lines;

        console.log('文档信息:', { 总行数: totalLines });

        // 确保行号在有效范围内
        fromLine = Math.max(1, Math.min(fromLine, totalLines));
        toLine = Math.max(1, Math.min(toLine, totalLines + 1));

        console.log('调整后的行号:', { 从行: fromLine, 到行: toLine });

        // 检查是否是相邻行移动的情况
        if (toLine === fromLine + 1 || fromLine === toLine) {
            console.log('源行和目标行相同或相邻，无需移动');
            return;
        }

        const fromLineContent = doc.line(fromLine);
        const lineContent = fromLineContent.text;

        console.log('要移动的内容:', { 行内容: lineContent });

        let changes = [];
        let insertPos;
        let newCursorPos;
        

        if (toLine > fromLine) {
            // 向下移动
            console.log('向下移动');
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
            console.log('向上移动');
            const targetLine = doc.line(toLine - 1);
            const lastLine = doc.line(doc.lines);
            insertPos = targetLine.to; // 使用 .to 而不是 .from

            if (fromLine === totalLines) {
                // 如果是最后一行向上移动,直接删除最后一行内容。
                console.log('最后一行向上移动');
                const secondLastLine = doc.line(totalLines - 1);
                changes = [
                    { from: insertPos, insert: '\n' + lineContent }, // 添加换行符
                    { from: secondLastLine.to, to: doc.length } // 直接删除最后一行

                ];
            } else {
                changes = [
                    { from: insertPos, insert: '\n' + lineContent }, // 添加换行符
                    { from: fromLineContent.from, to: fromLineContent.to + 1, insert: '' }
                ];
            }
            newCursorPos = insertPos + lineContent.length + 1; // +1 因为添加了换行符
        }

        console.log('准备执行的更改:', changes);
        
        try {
            view.dispatch({
                changes: changes,
                selection: EditorSelection.cursor(Math.min(newCursorPos, doc.length))
            });
            console.log('执行更改:', {
                deleteFrom: fromLine,
                insertAt: toLine,
                insertContent: lineContent,
                newCursorPos: newCursorPos
            });

            // 验证移动结果
            const newDoc = view.state.doc;
            console.log('移动后的文档总行数:', newDoc.lines);

            // 检查新位置的内容
            if (toLine <= newDoc.lines) {
                const newTargetLine = newDoc.line(Math.min(toLine, newDoc.lines));
                console.log('新位置的内容:', { 行号: Math.min(toLine, newDoc.lines), 内容: newTargetLine.text });
            } else {
                console.log('新位置在文档末尾');
            }

            // 检查原位置的内容
            if (fromLine <= newDoc.lines) {
                const originalLine = newDoc.line(Math.min(fromLine, newDoc.lines));
                console.log('原位置的当前内容:', { 行号: Math.min(fromLine, newDoc.lines), 内容: originalLine.text });
            } else {
                console.log('原位置已超出文档范围');
            }

        } catch (error) {
            console.error('移动块时出错:', error);
        }
    }

    // // 模块编号：2
    // // 功能：获取文档属性信息结束的位置
    // // 输入：doc (any)
    // // 输出：number (文档属性信息结束的位置)
    // private static getFrontmatterEndPosition(doc: any): number {
    //     const firstLine = doc.line(1);
    //     if (firstLine.text.trim() !== '---') {
    //         return 0; // 没有文档属性信息
    //     }
    //     for (let i = 2; i <= doc.lines; i++) {
    //         const line = doc.line(i);
    //         if (line.text.trim() === '---') {
    //             return line.to;
    //         }
    //     }
    //     return 0; // 未找到结束的文档属性信息分隔符
    // }
}