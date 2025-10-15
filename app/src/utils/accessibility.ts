/**
 * Accessibility utilities for Requestly API Client & Interceptor
 * Provides comprehensive accessibility features and utilities
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * ARIA labels and descriptions for common UI elements
 */
export const ARIA_LABELS = {
  // API Client
  apiClient: 'API Client',
  requestBuilder: 'Request Builder',
  responseViewer: 'Response Viewer',
  requestHistory: 'Request History',
  requestCollection: 'Request Collection',
  
  // Request Builder
  methodSelector: 'HTTP Method Selector',
  urlInput: 'URL Input Field',
  headersEditor: 'Headers Editor',
  bodyEditor: 'Request Body Editor',
  queryParamsEditor: 'Query Parameters Editor',
  
  // Response Viewer
  responseStatus: 'Response Status',
  responseHeaders: 'Response Headers',
  responseBody: 'Response Body',
  responseTime: 'Response Time',
  responseSize: 'Response Size',
  
  // Navigation
  navigationMenu: 'Main Navigation Menu',
  navigationItem: 'Navigation Item',
  sidebar: 'Sidebar',
  mainContent: 'Main Content Area',
  
  // Actions
  sendRequest: 'Send Request',
  saveRequest: 'Save Request',
  deleteRequest: 'Delete Request',
  duplicateRequest: 'Duplicate Request',
  importRequest: 'Import Request',
  exportRequest: 'Export Request',
  
  // Settings
  settingsPanel: 'Settings Panel',
  themeSelector: 'Theme Selector',
  languageSelector: 'Language Selector',
  proxySettings: 'Proxy Settings',
  
  // Error States
  errorMessage: 'Error Message',
  loadingSpinner: 'Loading Spinner',
  successMessage: 'Success Message',
  warningMessage: 'Warning Message',
  
  // Form Elements
  formField: 'Form Field',
  formLabel: 'Form Label',
  formHelp: 'Form Help Text',
  formError: 'Form Error Message',
  formRequired: 'Required Field',
  
  // Buttons
  primaryButton: 'Primary Action Button',
  secondaryButton: 'Secondary Action Button',
  dangerButton: 'Dangerous Action Button',
  iconButton: 'Icon Button',
  
  // Modals and Dialogs
  modal: 'Modal Dialog',
  dialog: 'Dialog',
  modalClose: 'Close Modal',
  modalConfirm: 'Confirm Action',
  modalCancel: 'Cancel Action',
  
  // Tables and Lists
  dataTable: 'Data Table',
  tableRow: 'Table Row',
  tableCell: 'Table Cell',
  listItem: 'List Item',
  selectableItem: 'Selectable Item',
  
  // Code Editor
  codeEditor: 'Code Editor',
  codeEditorToolbar: 'Code Editor Toolbar',
  codeEditorLineNumbers: 'Line Numbers',
  codeEditorGutter: 'Code Editor Gutter',
  
  // Environment and Variables
  environmentSelector: 'Environment Selector',
  variableEditor: 'Variable Editor',
  environmentVariable: 'Environment Variable',
  globalVariable: 'Global Variable',
  collectionVariable: 'Collection Variable',
} as const;

/**
 * Keyboard shortcuts for Requestly
 */
export const KEYBOARD_SHORTCUTS = {
  // Global shortcuts
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  
  // Request actions
  SEND_REQUEST: 'Ctrl+Enter',
  SAVE_REQUEST: 'Ctrl+S',
  NEW_REQUEST: 'Ctrl+N',
  DUPLICATE_REQUEST: 'Ctrl+D',
  DELETE_REQUEST: 'Delete',
  
  // Navigation
  NEXT_TAB: 'Ctrl+Tab',
  PREVIOUS_TAB: 'Ctrl+Shift+Tab',
  CLOSE_TAB: 'Ctrl+W',
  NEW_TAB: 'Ctrl+T',
  
  // Editor shortcuts
  FORMAT_CODE: 'Shift+Alt+F',
  COMMENT_CODE: 'Ctrl+/',
  FIND_REPLACE: 'Ctrl+H',
  GO_TO_LINE: 'Ctrl+G',
  
  // Application shortcuts
  TOGGLE_SIDEBAR: 'Ctrl+B',
  TOGGLE_THEME: 'Ctrl+Shift+T',
  OPEN_SETTINGS: 'Ctrl+,',
  HELP: 'F1',
  DEVTOOLS: 'F12',
  
  // Environment shortcuts
  SWITCH_ENVIRONMENT: 'Ctrl+E',
  TOGGLE_VARIABLES: 'Ctrl+Shift+V',
  
  // Request history
  CLEAR_HISTORY: 'Ctrl+Shift+H',
  SEARCH_HISTORY: 'Ctrl+F',
} as const;

/**
 * Screen reader announcements
 */
export class ScreenReader {
  private static announcementElement: HTMLElement | null = null;

  static initialize(): void {
    if (typeof document === 'undefined') return;
    
    // Create announcement element if it doesn't exist
    if (!this.announcementElement) {
      this.announcementElement = document.createElement('div');
      this.announcementElement.setAttribute('aria-live', 'polite');
      this.announcementElement.setAttribute('aria-atomic', 'true');
      this.announcementElement.className = 'sr-only';
      this.announcementElement.id = 'screen-reader-announcements';
      document.body.appendChild(this.announcementElement);
    }
  }

  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (typeof document === 'undefined') return;
    
    this.initialize();
    
    if (this.announcementElement) {
      this.announcementElement.setAttribute('aria-live', priority);
      this.announcementElement.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (this.announcementElement) {
          this.announcementElement.textContent = '';
        }
      }, 1000);
    }
  }

  static announceError(message: string): void {
    this.announce(`Error: ${message}`, 'assertive');
  }

  static announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  static announceWarning(message: string): void {
    this.announce(`Warning: ${message}`, 'polite');
  }

  static announceInfo(message: string): void {
    this.announce(`Info: ${message}`, 'polite');
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusHistory: HTMLElement[] = [];

  static trapFocus(element: HTMLElement): void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (!firstElement || !lastElement) return;

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  static restoreFocus(element?: HTMLElement): void {
    if (element && typeof element.focus === 'function') {
      element.focus();
    } else if (this.focusHistory.length > 0) {
      const lastElement = this.focusHistory.pop();
      if (lastElement && typeof lastElement.focus === 'function') {
        lastElement.focus();
      }
    }
  }

  static saveFocus(): void {
    if (document.activeElement instanceof HTMLElement) {
      this.focusHistory.push(document.activeElement);
    }
  }

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[];
  }

  static focusFirst(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  static focusLast(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }
}

/**
 * Keyboard navigation utilities
 */
export class KeyboardNavigation {
  static handleArrowKeys(
    event: KeyboardEvent,
    items: any[],
    currentIndex: number
  ): number {
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return currentIndex;
    }
    
    event.preventDefault();
    return newIndex;
  }

  static handleEscape(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  }

  static handleEnter(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      callback();
    }
  }

  static handleSpace(event: KeyboardEvent, callback: () => void): void {
    if (event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }

  static handleTab(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Tab') {
      callback();
    }
  }
}

/**
 * Color contrast utilities
 */
export class ColorContrast {
  static getLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static isAccessible(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
}

/**
 * Accessibility validation utilities
 */
export class AccessibilityValidator {
  static validateImage(img: HTMLImageElement): string[] {
    const issues: string[] = [];
    
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push('Image missing alt text or aria-label');
    }
    
    if (img.alt === '' && img.getAttribute('role') !== 'presentation') {
      issues.push('Image has empty alt text but is not decorative');
    }
    
    return issues;
  }

  static validateButton(button: HTMLButtonElement): string[] {
    const issues: string[] = [];
    
    if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
      issues.push('Button missing accessible name');
    }
    
    if (button.disabled && !button.getAttribute('aria-disabled')) {
      issues.push('Disabled button missing aria-disabled attribute');
    }
    
    return issues;
  }

  static validateForm(form: HTMLFormElement): string[] {
    const issues: string[] = [];
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = form.querySelector(`label[for="${input.id}"]`);
        if (!label) {
          issues.push(`Input missing label or aria-label: ${input.name || input.id}`);
        }
      }
    });
    
    return issues;
  }

  static validatePage(): string[] {
    const issues: string[] = [];
    
    // Check for page title
    if (!document.title) {
      issues.push('Page missing title');
    }
    
    // Check for main landmark
    if (!document.querySelector('main, [role="main"]')) {
      issues.push('Page missing main landmark');
    }
    
    // Check for heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push(`Heading hierarchy skipped: ${heading.tagName}`);
      }
      previousLevel = level;
    });
    
    return issues;
  }
}

/**
 * React hook for accessibility
 */
export function useAccessibility() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    ScreenReader.announce(message, priority);
  }, []);

  const announceError = useCallback((message: string) => {
    ScreenReader.announceError(message);
  }, []);

  const announceSuccess = useCallback((message: string) => {
    ScreenReader.announceSuccess(message);
  }, []);

  const announceWarning = useCallback((message: string) => {
    ScreenReader.announceWarning(message);
  }, []);

  const announceInfo = useCallback((message: string) => {
    ScreenReader.announceInfo(message);
  }, []);

  const trapFocus = useCallback((element: HTMLElement) => {
    FocusManager.trapFocus(element);
  }, []);

  const restoreFocus = useCallback((element?: HTMLElement) => {
    FocusManager.restoreFocus(element);
  }, []);

  const saveFocus = useCallback(() => {
    FocusManager.saveFocus();
  }, []);

  const handleKeyboardNavigation = useCallback((
    event: KeyboardEvent,
    items: any[],
    currentIndex: number
  ) => {
    return KeyboardNavigation.handleArrowKeys(event, items, currentIndex);
  }, []);

  const validateAccessibility = useCallback(() => {
    return AccessibilityValidator.validatePage();
  }, []);

  return {
    announce,
    announceError,
    announceSuccess,
    announceWarning,
    announceInfo,
    trapFocus,
    restoreFocus,
    saveFocus,
    handleKeyboardNavigation,
    validateAccessibility,
    ARIA_LABELS,
    KEYBOARD_SHORTCUTS,
  };
}

/**
 * CSS classes for screen reader only content
 */
export const SR_ONLY_CSS = `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  transition: top 0.3s ease;
}

.skip-link:focus {
  top: 6px;
}
`;

// Inject CSS if not already present
if (typeof document !== 'undefined' && !document.querySelector('#accessibility-styles')) {
  const style = document.createElement('style');
  style.id = 'accessibility-styles';
  style.textContent = SR_ONLY_CSS;
  document.head.appendChild(style);
}

// Initialize screen reader
if (typeof document !== 'undefined') {
  ScreenReader.initialize();
}
