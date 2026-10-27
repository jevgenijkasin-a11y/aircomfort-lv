'use client';

import { Component, type ReactNode } from 'react';

/**
 * Error boundary for optional widgets (cookie banner, animations, floating
 * buttons…): if one of them throws, it disappears instead of taking the whole
 * page down to "Application error" — a blank page is what search engines
 * report as a soft 404.
 */
export default class SafeWidget extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('Widget hidden after an error:', error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
