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
  word-wrap: break-word;
  overflow-wrap: anywhere;
  max-width: 100%;

  & > * {
    text-wrap: auto;
  }
}
</style>
