// frontend/components/Layout.tsx
import React from 'react';
import Head from 'next/head';
import Attribution from './Attribution';
import AdSlot from './AdSlot';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>TrainerMeta — Compare card prices (Prototype)</title>
        <meta name="description" content="TrainerMeta helps you compare card prices across marketplaces. We don’t sell cards; we link you to trusted sellers." />
        <link rel="icon" href="/trainermeta.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className="sticky">
        <div className="wrap nav">
          <div className="nav-left">
            <a className="brand-link" href="/" aria-label="TrainerMeta — Home">
              <div className="brand"><div className="logo"></div> <span>TrainerMeta</span></div>
            </a>
            <nav className="nav-links">
              <a href="/">Singles</a>
              <a href="/sealed">Sealed</a>
              <a href="/about">About</a>
              <a href="/privacy.html">Privacy</a>
            </nav>
          </div>
          <div className="nav-cta">
            <a className="btn" href="#">Login</a>
            <select className="select"><option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option></select>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <div className="wrap">
        <footer>
          <div style={{ fontSize: 12, color: '#666' }}>
            © TrainerMeta · Independent tracker. Prices change. Uses permitted APIs; no scraping. ·
            <a href="/privacy.html"> Privacy</a> ·
            <a href="/terms.html"> Terms</a> ·
            <a href="/affiliate-disclosure.html"> Affiliate</a> ·
            <a href="/credits.html"> Credits</a>
          </div>
          <Attribution />
        </footer>
      </div>
    </>
  );
}
