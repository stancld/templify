/**
 * Removes a wrapper element while preserving its children.
 * Used to remove field highlights from the document.
 */
export const unwrapElement = (element: Element): void => {
  const parent = element.parentNode;
  if (!parent) {
    return;
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
};

/**
 * Removes all elements matching a selector by unwrapping them.
 */
export const unwrapAllElements = (
  container: Element,
  selector: string
): void => {
  container.querySelectorAll(selector).forEach(unwrapElement);
};
