// frontend/pages/index.tsx
import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import Fuse from 'fuse.js';
import { apiGet } from '../lib/api';

export async function getServerSideProps() {
  const data = await apiGet('/api/cards');
  return { props: { cards: data.cards || [] } };
}

export default function Home({ cards }: { cards: any[] }) {
  const [q, setQ] = useState('');
  const fuse = useMemo(() => new Fuse(cards, { includeScore: true, threshold: 0.4, keys: ['name','set_name','number']}), [cards]);
  const results = q ? fuse.search(q).slice(0, 20).map(h => h.item) : cards.slice(0, 20);

  return (
    <Layout>
      <form onSubmit={(e)=>e.preventDefault()} style={{ display:'flex', gap:8 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search 'Charizard 4/102'… (typo-friendly)" style={{ flex:1, padding:8 }}/>
      </form>
      <ul style={{ marginTop:16 }}>
        {results.map((r)=>(
          <li key={r.id} style={{ margin:'12px 0' }}>
            <a href={`/card/${r.id}`}><strong>{r.name}</strong> — {r.set_name} #{r.number}</a>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
