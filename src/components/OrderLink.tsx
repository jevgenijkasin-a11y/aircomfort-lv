'use client';

import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { saveContactPrefill } from '@/lib/contactPrefill';

/**
 * "Order" button: links to the clean /contacts URL and hands the prefilled
 * request over via sessionStorage, so no ?service=…&message=… URLs are
 * created (they were getting indexed by Google).
 */
export default function OrderLink({
  service, message, className, children, ...rest
}: {
  service: string;
  message: string;
  className?: string;
  children: ReactNode;
  'data-fab-avoid'?: boolean;
}) {
  return (
    <Link href="/contacts" className={className} onClick={() => saveContactPrefill({ service, message })} {...rest}>
      {children}
    </Link>
  );
}
