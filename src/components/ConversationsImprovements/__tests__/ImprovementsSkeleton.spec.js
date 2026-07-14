import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';

import ImprovementsSkeleton from '../ImprovementsSkeleton.vue';

describe('ImprovementsSkeleton.vue', () => {
  let wrapper;

  const elements = {
    root: () => wrapper.find('[data-testid="improvements-skeleton"]'),
    header: () => wrapper.find('[data-testid="improvements-skeleton-header"]'),
    title: () =>
      wrapper.findComponent('[data-testid="improvements-skeleton-title"]'),
    description: () =>
      wrapper.findComponent(
        '[data-testid="improvements-skeleton-description"]',
      ),
    buttons: () =>
      wrapper.findAllComponents('[data-testid="improvements-skeleton-button"]'),
    list: () => wrapper.find('[data-testid="improvements-skeleton-list"]'),
    listHeader: () =>
      wrapper.find('[data-testid="improvements-skeleton-list-header"]'),
    columnImprovement: () =>
      wrapper.findComponent(
        '[data-testid="improvements-skeleton-column-improvement"]',
      ),
    columnType: () =>
      wrapper.findComponent(
        '[data-testid="improvements-skeleton-column-type"]',
      ),
    columnAffectedConversations: () =>
      wrapper.findComponent(
        '[data-testid="improvements-skeleton-column-affected_conversations"]',
      ),
    rows: () =>
      wrapper.findAllComponents('[data-testid^="improvements-skeleton-row-"]'),
  };

  const createWrapper = () => {
    wrapper = shallowMount(ImprovementsSkeleton);
  };

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders the skeleton structure', () => {
    createWrapper();

    expect(elements.root().exists()).toBe(true);
    expect(elements.header().exists()).toBe(true);
    expect(elements.list().exists()).toBe(true);
    expect(elements.listHeader().exists()).toBe(true);
  });

  it('renders header title and description skeletons', () => {
    createWrapper();

    expect(elements.title().exists()).toBe(true);
    expect(elements.title().props('width')).toBe('439px');
    expect(elements.title().props('height')).toBe('20px');

    expect(elements.description().exists()).toBe(true);
    expect(elements.description().props('width')).toBe('128px');
    expect(elements.description().props('height')).toBe('20px');
  });

  it('renders two button skeletons', () => {
    createWrapper();

    expect(elements.buttons()).toHaveLength(2);
    elements.buttons().forEach((button) => {
      expect(button.props('width')).toBe('116px');
      expect(button.props('height')).toBe('45px');
    });
  });

  it('renders table column skeletons', () => {
    createWrapper();

    expect(elements.columnImprovement().exists()).toBe(true);
    expect(elements.columnType().exists()).toBe(true);
    expect(elements.columnAffectedConversations().exists()).toBe(true);
  });

  it('renders seven row skeletons', () => {
    createWrapper();

    expect(elements.rows()).toHaveLength(7);
    elements.rows().forEach((row) => {
      expect(row.props('width')).toBe('100%');
      expect(row.props('height')).toBe('60px');
    });
  });
});
