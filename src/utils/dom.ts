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

export const unwrapAllElements = (
  container: Element,
  selector: string
): void => {
  container.querySelectorAll(selector).forEach(unwrapElement);
};
