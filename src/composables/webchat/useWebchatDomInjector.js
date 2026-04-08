export function useWebchatDomInjector(rootSelector) {
  const messagesSelector = `${rootSelector} .weni-messages-list`;

  function getContainer() {
    return document.querySelector(messagesSelector);
  }

  function createElement({ tag = 'div', className, textContent }) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
  }

  function insertAfterLastAnchor(element, anchorSelector) {
    const container = getContainer();
    if (!container || !element) return;

    const anchors = container.querySelectorAll(anchorSelector);
    const lastAnchor = anchors[anchors.length - 1];

    if (lastAnchor) {
      lastAnchor.after(element);
    } else {
      container.appendChild(element);
    }
  }

  function appendToContainer(element) {
    getContainer()?.appendChild(element);
  }

  function removeBySelector(selector) {
    getContainer()
      ?.querySelectorAll(selector)
      .forEach((el) => el.remove());
  }

  return {
    getContainer,
    createElement,
    insertAfterLastAnchor,
    appendToContainer,
    removeBySelector,
  };
}
