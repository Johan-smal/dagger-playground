import React from 'react';
import { createRoot } from 'react-dom/client';
import { Tldraw } from '@tldraw/tldraw';
import 'tldraw/tldraw.css'

export function mountTldraw(container: HTMLElement) {
  const root = createRoot(container);
  root.render(<Tldraw />);
}