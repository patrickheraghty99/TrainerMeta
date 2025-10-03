// frontend/pages/sealed/index.tsx
import React, { useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Fuse from 'fuse.js';
import { apiGet } from '../../lib/api';

export async function getServerSideProps() {
  const data = await apiGet('/api/sealed');
  return { props: { items: data.sealed || [] } };
}

export default function SealedHome({ items }: { items: any[] }) {
  const [q, setQ] = useState('');
  const fuse = useMemo(() => new Fuse(items, { includeScore: true, threshold: 0.4, keys: ['name']}), [items]);
  const results = q ? fuse.search(q).slice(0, 20).map(h => h.item) : items.slice(0, 20);

  return (
    <Layout>
      <form onSubmit={(e)=>e.preventDefault()} style={{ display:'flex', gap:8 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search 'Evolving Skies Booster Box'… (typo-friendly)" style={{ flex:1, padding:8 }}/>
      </form>

      <div style={{ marginTop:16, display:'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
        {results.map((it:any)=>(
          <a key={it.id} href={`/sealed/${it.id}`} style={{ border:'1px solid #eee', padding:12, borderRadius:8, display:'flex', gap:12, alignItems:'center' }}>
            <img src={'/box.svg'} alt="" style={{ width:64, height:48, objectFit:'contain' }}/>
            <div>
              <strong>{it.name}</strong>
              <div style={{ fontSize:12, color:'#666' }}>Compare live listings</div>
            </div>
          </a>
        ))}
      </div>
    </Layout>
  );
}
