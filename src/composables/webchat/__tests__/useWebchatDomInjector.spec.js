import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';

import { useWebchatDomInjector } from '../useWebchatDomInjector';

const ROOT_ID = 'test-webchat-root';
const ROOT_SELECTOR = `#${ROOT_ID}`;

describe('useWebchatDomInjector', () => {
  let rootEl;
  let messagesList;

  function createDomStructure() {
    rootEl = document.createElement('div');
    rootEl.id = ROOT_ID;

    messagesList = document.createElement('div');
    messagesList.className = 'weni-messages-list';

    rootEl.appendChild(messagesList);
    document.body.appendChild(rootEl);
  }

  beforeEach(() => {
    createDomStructure();
  });

  afterEach(() => {
    rootEl?.remove();
  });

  describe('getContainer', () => {
    it('should return the messages list element', () => {
      const { getContainer } = useWebchatDomInjector(ROOT_SELECTOR);

      expect(getContainer()).toBe(messagesList);
    });

    it('should return null when root element does not exist', () => {
      const { getContainer } = useWebchatDomInjector('#nonexistent');

      expect(getContainer()).toBeNull();
    });
  });

  describe('createElement', () => {
    it('should create a div by default', () => {
      const { createElement } = useWebchatDomInjector(ROOT_SELECTOR);

      const el = createElement({});

      expect(el.tagName).toBe('DIV');
    });

    it('should create an element with the specified tag', () => {
      const { createElement } = useWebchatDomInjector(ROOT_SELECTOR);

      const el = createElement({ tag: 'section' });

      expect(el.tagName).toBe('SECTION');
    });

    it('should set className when provided', () => {
      const { createElement } = useWebchatDomInjector(ROOT_SELECTOR);

      const el = createElement({ className: 'my-class' });

      expect(el.className).toBe('my-class');
    });

    it('should set textContent when provided', () => {
      const { createElement } = useWebchatDomInjector(ROOT_SELECTOR);

      const el = createElement({ textContent: 'hello' });

      expect(el.textContent).toBe('hello');
    });

    it('should not insert the element into the DOM', () => {
      const { createElement } = useWebchatDomInjector(ROOT_SELECTOR);

      createElement({ className: 'orphan' });

      expect(messagesList.querySelector('.orphan')).toBeNull();
    });
  });

  describe('insertAfterLastAnchor', () => {
    it('should insert after the last matching anchor', () => {
      const anchor1 = document.createElement('div');
      anchor1.className = 'anchor';
      const anchor2 = document.createElement('div');
      anchor2.className = 'anchor';

      messagesList.appendChild(anchor1);
      messagesList.appendChild(anchor2);

      const { createElement, insertAfterLastAnchor } =
        useWebchatDomInjector(ROOT_SELECTOR);

      const el = createElement({ className: 'injected' });
      insertAfterLastAnchor(el, '.anchor');

      expect(anchor2.nextSibling).toBe(el);
    });

    it('should append to container when no anchors exist', () => {
      const { createElement, insertAfterLastAnchor } =
        useWebchatDomInjector(ROOT_SELECTOR);

      const el = createElement({ className: 'injected' });
      insertAfterLastAnchor(el, '.anchor');

      expect(messagesList.lastChild).toBe(el);
    });

    it('should do nothing when container does not exist', () => {
      const { createElement, insertAfterLastAnchor } =
        useWebchatDomInjector('#nonexistent');

      const el = createElement({ className: 'injected' });

      expect(() => insertAfterLastAnchor(el, '.anchor')).not.toThrow();
    });

    it('should do nothing when element is null', () => {
      const { insertAfterLastAnchor } = useWebchatDomInjector(ROOT_SELECTOR);

      expect(() => insertAfterLastAnchor(null, '.anchor')).not.toThrow();
    });
  });

  describe('appendToContainer', () => {
    it('should append element as the last child', () => {
      const existing = document.createElement('div');
      messagesList.appendChild(existing);

      const { createElement, appendToContainer } =
        useWebchatDomInjector(ROOT_SELECTOR);

      const el = createElement({ className: 'appended' });
      appendToContainer(el);

      expect(messagesList.lastChild).toBe(el);
      expect(messagesList.children).toHaveLength(2);
    });

    it('should not throw when container does not exist', () => {
      const { createElement, appendToContainer } =
        useWebchatDomInjector('#nonexistent');

      const el = createElement({});

      expect(() => appendToContainer(el)).not.toThrow();
    });
  });

  describe('removeBySelector', () => {
    it('should remove all matching elements', () => {
      const el1 = document.createElement('div');
      el1.className = 'removable';
      const el2 = document.createElement('div');
      el2.className = 'removable';
      const el3 = document.createElement('div');
      el3.className = 'keep';

      messagesList.append(el1, el2, el3);

      const { removeBySelector } = useWebchatDomInjector(ROOT_SELECTOR);
      removeBySelector('.removable');

      expect(messagesList.querySelectorAll('.removable')).toHaveLength(0);
      expect(messagesList.querySelector('.keep')).toBe(el3);
    });

    it('should not throw when container does not exist', () => {
      const { removeBySelector } = useWebchatDomInjector('#nonexistent');

      expect(() => removeBySelector('.anything')).not.toThrow();
    });

    it('should not throw when no elements match', () => {
      const { removeBySelector } = useWebchatDomInjector(ROOT_SELECTOR);

      expect(() => removeBySelector('.nonexistent')).not.toThrow();
    });
  });

  describe('mountComponent', () => {
    const TestComponent = defineComponent({
      props: { label: { type: String, default: 'default' } },
      render() {
        return h('span', { class: 'test-component' }, this.label);
      },
    });

    it('should mount a Vue component into a wrapper inside the container', () => {
      const { mountComponent } = useWebchatDomInjector(ROOT_SELECTOR);

      const handle = mountComponent(TestComponent);

      const rendered = messagesList.querySelector('.test-component');
      expect(rendered).not.toBeNull();
      expect(rendered.textContent).toBe('default');

      handle.unmount();
    });

    it('should pass props to the component', () => {
      const { mountComponent } = useWebchatDomInjector(ROOT_SELECTOR);

      const handle = mountComponent(TestComponent, {
        props: { label: 'custom' },
      });

      const rendered = messagesList.querySelector('.test-component');
      expect(rendered.textContent).toBe('custom');

      handle.unmount();
    });

    it('should apply wrapperClass to the wrapper div', () => {
      const { mountComponent } = useWebchatDomInjector(ROOT_SELECTOR);

      const handle = mountComponent(TestComponent, {
        wrapperClass: 'my-wrapper',
      });

      expect(handle.wrapper.className).toBe('my-wrapper');
      expect(messagesList.querySelector('.my-wrapper')).toBe(handle.wrapper);

      handle.unmount();
    });

    it('should remove the wrapper from DOM on unmount', () => {
      const { mountComponent } = useWebchatDomInjector(ROOT_SELECTOR);

      const handle = mountComponent(TestComponent, {
        wrapperClass: 'disposable',
      });

      expect(messagesList.querySelector('.disposable')).not.toBeNull();

      handle.unmount();

      expect(messagesList.querySelector('.disposable')).toBeNull();
      expect(messagesList.querySelector('.test-component')).toBeNull();
    });

    it('should install plugins on the mounted app', () => {
      const installed = [];
      const fakePlugin = {
        install(app) {
          installed.push(app);
        },
      };

      const { mountComponent } = useWebchatDomInjector(ROOT_SELECTOR);

      const handle = mountComponent(TestComponent, {
        plugins: [fakePlugin],
      });

      expect(installed).toHaveLength(1);

      handle.unmount();
    });

    it('should return null when container does not exist', () => {
      const { mountComponent } = useWebchatDomInjector('#nonexistent');

      const handle = mountComponent(TestComponent);

      expect(handle).toBeNull();
    });
  });
});
