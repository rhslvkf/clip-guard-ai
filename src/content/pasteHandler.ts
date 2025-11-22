/**
 * Paste event handler for content script
 * Intercepts paste events and applies secret masking
 */

import { maskSecretPatterns } from '@/core/detector';
import { incrementProtectedCount } from './clipboardInterceptor';

/**
 * Handle paste event and mask secrets
 */
export function handlePaste(event: ClipboardEvent): void {
  // Get clipboard data
  const clipboardData = event.clipboardData;
  if (!clipboardData) return;

  // Get text from clipboard
  const originalText = clipboardData.getData('text/plain');
  if (!originalText) return;

  // Apply masking
  const result = maskSecretPatterns(originalText);

  // If no secrets detected, allow normal paste
  if (result.replacements === 0) {
    return;
  }

  // Prevent default paste behavior
  event.preventDefault();
  event.stopPropagation();

  // Insert masked text
  insertMaskedText(result.masked);

  // Increment protected count
  incrementProtectedCount(result.replacements);

  // Log detection (optional, for debugging)
  console.log(`[Clip Guard AI] Masked ${result.replacements} secret(s)`);
}

/**
 * Insert masked text at cursor position
 */
function insertMaskedText(text: string): void {
  const activeElement = document.activeElement;

  // Handle textarea and input elements
  if (
    activeElement instanceof HTMLTextAreaElement ||
    activeElement instanceof HTMLInputElement
  ) {
    const start = activeElement.selectionStart || 0;
    const end = activeElement.selectionEnd || 0;
    const currentValue = activeElement.value;

    // Insert text at cursor position
    activeElement.value =
      currentValue.substring(0, start) +
      text +
      currentValue.substring(end);

    // Set cursor position after inserted text
    const newPosition = start + text.length;
    activeElement.setSelectionRange(newPosition, newPosition);

    // Trigger input event for frameworks (React, Vue, etc.)
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  // Handle contenteditable elements (rich text editors)
  if (activeElement instanceof HTMLElement && activeElement.isContentEditable) {
    // Check if it's ProseMirror (Claude.ai uses this)
    const isProseMirror = activeElement.classList.contains('ProseMirror');

    // Check if it's Quill (Gemini uses this)
    const isQuill = activeElement.classList.contains('ql-editor');

    // Check if it's Perplexity (uses id="ask-input")
    const isPerplexity = activeElement.id === 'ask-input';

    if (isProseMirror) {
      // ProseMirror-specific handling: use execCommand with plain text
      // ProseMirror will handle the formatting internally
      try {
        // Use insertText command which ProseMirror intercepts and handles properly
        const success = document.execCommand('insertText', false, text);

        if (success) {
          console.log('[Clip Guard AI] ProseMirror paste successful');
          return;
        }
      } catch (error) {
        console.warn('[Clip Guard AI] ProseMirror insertText failed:', error);
      }

      // Fallback for ProseMirror: direct text insertion
      try {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();

          // Insert as plain text node - ProseMirror will process it
          const textNode = document.createTextNode(text);
          range.insertNode(textNode);

          // Move cursor after inserted text
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);

          // Force ProseMirror to update
          activeElement.dispatchEvent(new Event('input', { bubbles: true }));

          console.log('[Clip Guard AI] ProseMirror fallback successful');
          return;
        }
      } catch (error) {
        console.warn('[Clip Guard AI] ProseMirror fallback failed:', error);
      }
    }

    if (isQuill) {
      // Quill-specific handling: use execCommand with plain text
      // Quill will handle the formatting internally
      try {
        // Use insertText command which Quill intercepts and handles properly
        const success = document.execCommand('insertText', false, text);

        if (success) {
          console.log('[Clip Guard AI] Quill paste successful');
          return;
        }
      } catch (error) {
        console.warn('[Clip Guard AI] Quill insertText failed:', error);
      }

      // Fallback for Quill: direct text insertion
      try {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();

          // Insert as plain text node - Quill will process it
          const textNode = document.createTextNode(text);
          range.insertNode(textNode);

          // Move cursor after inserted text
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);

          // Force Quill to update
          activeElement.dispatchEvent(new Event('text-change', { bubbles: true }));
          activeElement.dispatchEvent(new Event('input', { bubbles: true }));

          console.log('[Clip Guard AI] Quill fallback successful');
          return;
        }
      } catch (error) {
        console.warn('[Clip Guard AI] Quill fallback failed:', error);
      }
    }

    if (isPerplexity) {
      // Perplexity uses Lexical editor
      // execCommand works for basic text insertion (no line break support due to Lexical limitations)
      try {
        const success = document.execCommand('insertText', false, text);
        if (success) {
          activeElement.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('[Clip Guard AI] Perplexity paste successful (no line breaks)');
          return;
        }
      } catch (error) {
        console.warn('[Clip Guard AI] Perplexity paste failed:', error);
      }
    }

    // Standard contenteditable handling (ChatGPT, etc.)
    try {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Convert text to HTML preserving whitespace and line breaks
        const fragment = document.createDocumentFragment();
        const lines = text.split('\n');

        lines.forEach((line, index) => {
          // Preserve ALL spaces and tabs (not just leading)
          const preservedLine = line
            .replace(/ /g, '\u00A0')  // Replace all spaces with non-breaking spaces
            .replace(/\t/g, '\u00A0\u00A0\u00A0\u00A0');  // Replace tabs with 4 non-breaking spaces

          // Create text node for the line
          const textNode = document.createTextNode(preservedLine);
          fragment.appendChild(textNode);

          // Add line break if not last line
          if (index < lines.length - 1) {
            fragment.appendChild(document.createElement('br'));
          }
        });

        range.insertNode(fragment);

        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger input events for React/Vue frameworks
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        activeElement.dispatchEvent(new Event('change', { bubbles: true }));

        return;
      }
    } catch (error) {
      console.warn('[Clip Guard AI] Standard contenteditable insertion failed:', error);
    }

    // Final fallback: execCommand with preserved whitespace
    try {
      const preservedText = text
        .split('\n')
        .map(line => line.replace(/ /g, '\u00A0').replace(/\t/g, '\u00A0\u00A0\u00A0\u00A0'))
        .join('\n');

      document.execCommand('insertText', false, preservedText);
      return;
    } catch (error) {
      console.warn('[Clip Guard AI] execCommand fallback failed:', error);
    }
  }

  // Fallback: use execCommand (deprecated but widely supported)
  document.execCommand('insertText', false, text);
}
