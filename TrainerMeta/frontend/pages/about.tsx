// frontend/pages/about.tsx
import React from 'react';
import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <h2>About TrainerMeta</h2>
      <p>
        <strong>TrainerMeta</strong> is an independent metasearch engine that helps collectors find the best prices
        on Pokémon singles and sealed products across the web. We don’t sell cards; we link you to trusted sellers.
      </p>
      <p>
        Our mission is simple: <em>fast, fair, reliable</em> price comparison, so you spend less time hunting and more time collecting.
      </p>
      <h3>How it works</h3>
      <ul>
        <li>API-friendly sources only. No scraping.</li>
        <li>We normalize price and shipping to compare apples-to-apples.</li>
        <li>We refresh regularly and show per-source timestamps.</li>
      </ul>
      <h3>Affiliate disclosure</h3>
      <p>Some links may be affiliate links. If you click them, we may earn a commission. This does not affect your price.</p>
      <h3>Contact</h3>
      <p>Email us at <a href="mailto:hello@trainermeta.example">hello@trainermeta.example</a>.</p>
    </Layout>
  );
}
