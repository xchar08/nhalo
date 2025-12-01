// ============================================================================
// FILE: src/app/page.tsx
// ============================================================================
import { analyzePdrAction } from './actions/analyze-pdr'; // We import the action mainly for types if needed, or use client side
import ClientHome from './ClientHome';

/**
 * Main Entry Page.
 * Since we need complex client state (graph + PDR view), we delegate to a Client Component.
 */
export default function Page() {
  return <ClientHome />;
}
