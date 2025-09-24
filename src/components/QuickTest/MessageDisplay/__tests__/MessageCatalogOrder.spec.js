import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import MessageCatalogOrder from '../MessageCatalogOrder.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';
import i18n from '@/utils/plugins/i18n';

describe('MessageCatalogOrder.vue', () => {
  let wrapper;

  const orderHeader = () =>
    wrapper.find('[data-testid="order-summary-header"]');
  const orderContent = () =>
    wrapper.find('[data-testid="order-summary-content"]');
  const orderIcon = () =>
    wrapper.findComponent('[data-testid="order-summary-icon"]');
  const orderTitle = () =>
    wrapper.findComponent('[data-testid="order-summary-title"]');
  const orderItemsText = () =>
    wrapper.findComponent('[data-testid="order-summary-items-text"]');
  const orderSubtotalText = () =>
    wrapper.findComponent('[data-testid="order-summary-subtotal-text"]');
  const viewDetailsButton = () =>
    wrapper.findComponent('[data-testid="order-summary-view-details"]');
  const cartModal = () =>
    wrapper.findComponent('[data-testid="order-summary-cart-modal"]');

  const mockOrder = {
    products: [
      {
        id: '1',
        product: 'Product 1',
        description: 'Description 1',
        price: 100,
        quantity: 2,
        currency: 'R$',
      },
      {
        id: '2',
        product: 'Product 2',
        description: 'Description 2',
        price: 50,
        quantity: 1,
        currency: 'R$',
      },
    ],
    productsQuantity: 3,
    subtotal: 250,
  };

  const createWrapper = (props = {}) => {
    return shallowMount(MessageCatalogOrder, {
      props: {
        order: mockOrder,
        ...props,
      },
      global: {
        stubs: {
          UnnnicIntelligenceText: Text,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the order summary component correctly', () => {
      expect(orderHeader().exists()).toBe(true);
      expect(orderContent().exists()).toBe(true);
      expect(orderIcon().exists()).toBe(true);
      expect(orderTitle().exists()).toBe(true);
      expect(orderItemsText().exists()).toBe(true);
      expect(orderSubtotalText().exists()).toBe(true);
      expect(viewDetailsButton().exists()).toBe(true);
      expect(cartModal().exists()).toBe(true);
    });

    it('displays correct header text', () => {
      expect(orderTitle().text()).toBe(
        i18n.global.t('router.preview.catalog.order_summary'),
      );
    });

    it('displays correct items quantity and subtotal', () => {
      expect(orderItemsText().text()).toBe('3 items');
      expect(orderSubtotalText().text()).toBe('Subtotal: R$ 250');
    });

    it('displays singular item text when quantity is 1', async () => {
      await wrapper.setProps({
        order: {
          ...mockOrder,
          productsQuantity: 1,
        },
      });

      expect(orderItemsText().text()).toBe('1 item');
    });

    it('renders view details button with correct text', () => {
      expect(viewDetailsButton().props('text')).toBe('View order details');
      expect(viewDetailsButton().props('size')).toBe('small');
      expect(viewDetailsButton().props('type')).toBe('primary');
    });

    it('renders cart modal with correct props', () => {
      expect(cartModal().props('products')).toEqual(mockOrder.products);
      expect(cartModal().props('subtotal')).toBe(mockOrder.subtotal);
      expect(cartModal().props('enablePlaceOrder')).toBe(false);
      expect(cartModal().props('modelValue')).toBe(false);
    });
  });

  describe('Currency handling', () => {
    it('uses the currency from the first product', () => {
      expect(orderSubtotalText().text()).toBe('Subtotal: R$ 250');
    });

    it('uses default currency when products array is empty', async () => {
      await wrapper.setProps({
        order: {
          ...mockOrder,
          products: [],
        },
      });

      expect(orderSubtotalText().text()).toBe('Subtotal: $ 250');
    });

    it('uses custom currency from products', async () => {
      const euroProducts = mockOrder.products.map((product) => ({
        ...product,
        currency: '€',
      }));

      await wrapper.setProps({
        order: {
          ...mockOrder,
          products: euroProducts,
        },
      });

      expect(orderSubtotalText().text()).toBe('Subtotal: € 250');
    });
  });

  describe('User interactions', () => {
    it('opens the modal when view details button is clicked', async () => {
      expect(wrapper.vm.isOrderDetailsOpen).toBe(false);

      await viewDetailsButton().vm.$emit('click');

      expect(wrapper.vm.isOrderDetailsOpen).toBe(true);
      expect(cartModal().props('modelValue')).toBe(true);
    });

    it('emits view-details event when view details button is clicked', async () => {
      await viewDetailsButton().vm.$emit('click');

      expect(wrapper.emitted('view-details')).toBeTruthy();
      expect(wrapper.emitted('view-details').length).toBe(1);
    });

    it('closes the modal when close event is received', async () => {
      wrapper.vm.isOrderDetailsOpen = true;
      await wrapper.vm.$nextTick();

      await cartModal().vm.$emit('close');

      expect(wrapper.vm.isOrderDetailsOpen).toBe(false);
    });

    it('emits close-order-details event when modal is closed', async () => {
      wrapper.vm.isOrderDetailsOpen = true;
      await wrapper.vm.$nextTick();

      await cartModal().vm.$emit('close');

      expect(wrapper.emitted('close-order-details')).toBeTruthy();
      expect(wrapper.emitted('close-order-details').length).toBe(1);
    });
  });

  describe('Computed properties', () => {
    it('generates correct itemsText for multiple items', () => {
      expect(wrapper.vm.itemsText).toBe('3 items');
    });

    it('generates correct itemsText for a single item', async () => {
      await wrapper.setProps({
        order: {
          ...mockOrder,
          productsQuantity: 1,
        },
      });

      expect(wrapper.vm.itemsText).toBe('1 item');
    });

    it('generates correct subtotalText with currency', () => {
      expect(wrapper.vm.subtotalText).toBe('Subtotal: R$ 250');
    });
  });
});
