import mammoth from 'mammoth';

export interface ParseResult {
  html: string;
  messages: Array<{ type: string; message: string }>;
}

export const parseDocxToHtml = async (file: Blob): Promise<ParseResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    return {
      html: result.value,
      messages: result.messages,
    };
  } catch (error) {
    console.error('Error parsing .docx file:', error);
    throw new Error('Failed to parse document. Please ensure the file is a valid .docx file.');
  }
};

export const extractPlainText = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const textContent = doc.body.textContent || '';

  return textContent
    .replace(/\s+/g, ' ')
    .trim();
};

interface PositionMapEntry {
  node: Node;
  startOffset: number;
  endOffset: number;
}

export const createPositionMap = (containerElement: HTMLElement): PositionMapEntry[] => {
  const map: PositionMapEntry[] = [];
  let currentOffset = 0;

  const walker = document.createTreeWalker(
    containerElement,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node = walker.nextNode();
  while (node) {
    const textLength = node.textContent?.length || 0;

    map.push({
      node,
      startOffset: currentOffset,
      endOffset: currentOffset + textLength,
    });

    currentOffset += textLength;
    node = walker.nextNode();
  }

  return map;
};

export const convertDomRangeToCharPositions = (
  range: Range,
  containerElement: HTMLElement
): { startPosition: number; endPosition: number } | null => {
  try {
    const positionMap = createPositionMap(containerElement);

    let startPosition = -1;
    let endPosition = -1;

    for (const entry of positionMap) {
      if (entry.node === range.startContainer) {
        startPosition = entry.startOffset + range.startOffset;
      }
      if (entry.node === range.endContainer) {
        endPosition = entry.startOffset + range.endOffset;
      }
    }

    if (startPosition === -1 || endPosition === -1) {
      return null;
    }

    return { startPosition, endPosition };
  } catch (error) {
    console.error('Error converting DOM range to character positions:', error);
    return null;
  }
};
