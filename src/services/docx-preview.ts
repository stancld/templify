import { renderAsync, Options as DocxOptions } from 'docx-preview';

export interface RenderOptions {
  className?: string;
  inWrapper?: boolean;
  ignoreWidth?: boolean;
  ignoreHeight?: boolean;
  ignoreFonts?: boolean;
  breakPages?: boolean;
  debug?: boolean;
}

const defaultOptions: Partial<DocxOptions> = {
  className: 'docx-preview',
  inWrapper: true,
  ignoreWidth: false,
  ignoreHeight: false,
  ignoreFonts: false,
  breakPages: true,
  ignoreLastRenderedPageBreak: true,
  experimental: false,
  trimXmlDeclaration: true,
  useBase64URL: true,
  renderHeaders: true,
  renderFooters: true,
  renderFootnotes: true,
  renderEndnotes: true,
  debug: false,
};

export const renderDocxPreview = async (
  docxBlob: Blob,
  container: HTMLElement,
  styleContainer?: HTMLElement,
  options: RenderOptions = {}
): Promise<void> => {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  await renderAsync(docxBlob, container, styleContainer ?? container, mergedOptions);
};

export const extractPlainTextFromContainer = (container: HTMLElement): string => {
  const textContent = container.textContent || '';
  return textContent.replace(/\s+/g, ' ').trim();
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

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const extractTextFromBoundingBox = (
  box: BoundingBox,
  containerElement: HTMLElement,
  plainText: string
): { startPosition: number; endPosition: number; text: string } | null => {
  try {
    const containerRect = containerElement.getBoundingClientRect();
    const scrollTop = containerElement.scrollTop;
    const scrollLeft = containerElement.scrollLeft;
    const positionMap = createPositionMap(containerElement);

    const absBoxLeft = containerRect.left + box.x - scrollLeft;
    const absBoxRight = containerRect.left + box.x + box.width - scrollLeft;
    const absBoxTop = containerRect.top + box.y - scrollTop;
    const absBoxBottom = containerRect.top + box.y + box.height - scrollTop;

    let minPosition = Infinity;
    let maxPosition = -1;

    for (const entry of positionMap) {
      const textNode = entry.node as Text;
      const text = textNode.textContent || '';

      for (let i = 0; i < text.length; i++) {
        const range = document.createRange();
        range.setStart(textNode, i);
        range.setEnd(textNode, i + 1);
        const charRect = range.getBoundingClientRect();

        const charCenterX = (charRect.left + charRect.right) / 2;
        const charCenterY = (charRect.top + charRect.bottom) / 2;

        const centerInBox =
          charCenterX >= absBoxLeft &&
          charCenterX <= absBoxRight &&
          charCenterY >= absBoxTop &&
          charCenterY <= absBoxBottom;

        if (centerInBox) {
          const charPosition = entry.startOffset + i;
          minPosition = Math.min(minPosition, charPosition);
          maxPosition = Math.max(maxPosition, charPosition + 1);
        }
      }
    }

    if (minPosition === Infinity || maxPosition === -1) {
      return null;
    }

    const selectedText = plainText.substring(minPosition, maxPosition);
    if (!selectedText) {
      return null;
    }

    return {
      startPosition: minPosition,
      endPosition: maxPosition,
      text: selectedText,
    };
  } catch (error) {
    console.error('Error extracting text from bounding box:', error);
    return null;
  }
};
