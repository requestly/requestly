import { Text } from "@codemirror/state";

export function getOffsetFromLocation(doc: Text | any, line: number, column: number): number {
  const totalLines = doc.lines;
  const clampedLine = Math.min(Math.max(line, 1), totalLines);
  const lineInfo = doc.line(clampedLine);
  const colIndex = Math.min(Math.max(column - 1, 0), lineInfo.length);
  return lineInfo.from + colIndex;
}
