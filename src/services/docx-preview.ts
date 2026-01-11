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
