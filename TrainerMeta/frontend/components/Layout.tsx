// frontend/components/Layout.tsx
import React from 'react';
import Head from 'next/head';
import Attribution from './Attribution';
import AdSlot from './AdSlot';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <Head>
        <title>TrainerMeta — Compare card prices (Prototype)</title>
        <meta name="description" content="TrainerMeta helps you compare card prices across marketplaces. We don’t sell cards; we link you to trusted sellers." />
        <link rel="icon" href="/trainermeta.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <img src="/trainermeta.svg" alt="TrainerMeta" style={{ width:140, height:'auto' }} />
          <div>
            <h1 style={{ margin:'0 0 4px 0' }}>TrainerMeta</h1>
            <div style={{ color:'#444' }}>“Compare card prices across the web — fast, fair, reliable.”</div>
          </div>
        </div>
        <nav style={{ display:'flex', gap:16, margin:'12px 0 16px' }}>
          <a href="/" style={{ fontWeight: 600 }}>Singles</a>
          <a href="/sealed" style={{ fontWeight: 600 }}>Sealed</a>
          <a href="/about" style={{ fontWeight: 600 }}>About</a>
        </nav>
        <p style={{ color: '#666', marginTop: 0 }}>US • Price comparisons • Hourly refresh • eBay Sandbox enabled when token provided</p>
      </header>
      <AdSlot />
      <main>{children}</main>
      <footer style={{ marginTop: 48 }}>
        <p style={{ fontSize: 12, color: '#666' }}>
          Prices &amp; availability change. We don’t sell cards—click through to sellers.
          &nbsp;|&nbsp;<a href="/privacy.html">Privacy</a>
          &nbsp;|&nbsp;<a href="/affiliate-disclosure.html">Affiliate Disclosure</a>
          &nbsp;|&nbsp;<a href="/credits.html">Credits</a>
          &nbsp;|&nbsp;<a href="/terms.html">Terms</a>
        </p>
        <Attribution />
      </footer>
    </div>
  );
}
