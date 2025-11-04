<template>
  <section
    class="content-section"
    data-testid="content"
    v-html="html"
  />
</template>

<script>
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export default {
  props: {
    content: {
      type: String,
      default: '',
    },
  },

  computed: {
    html() {
      const purifiedContent = DOMPurify.sanitize(this.content);

      marked.use({
        breaks: true,
        useNewRenderer: true,
        renderer: {
          link(token) {
            if (typeof token === 'string' && token.includes('mailto:')) {
              return token.replace('mailto:', '');
            }
            return `<a target="_blank" href="${token.href || token}">${token.text || token}</a>`;
          },
        },
      });

      const processedContent = purifiedContent
        // Convert • bullet points to proper Markdown list syntax
        .replace(/\n•\s*/g, '\n* ')
        // Handle cases where • appears at the start of content
        .replace(/^•\s*/g, '* ');

      return marked.parse(processedContent);
    },
  },
};
</script>

<style lang="scss" scoped>
.content-section {
  & > * {
    max-width: 100%;

    word-wrap: break-word;
    overflow-wrap: anywhere;
    text-wrap: auto;
  }

  // Markdown elements styling
  :deep(p) {
    margin: $unnnic-space-2 0;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(a) {
    text-decoration: underline;
    
    cursor: pointer;
  }

  :deep(ul), :deep(ol) {
    margin: $unnnic-space-2 0;
    list-style: initial;
    padding-left: $unnnic-space-4;
  }

  :deep(li) {
    margin: $unnnic-space-1 0;
  }

  :deep(h1) {
    font: $unnnic-font-display-1;
  }

  :deep(h2) {
    font: $unnnic-font-display-2;
  }

  :deep(h3) {
    font: $unnnic-font-display-3;
  }

  :deep(h4) {
    font: $unnnic-font-display-4;
  }
}
</style>
