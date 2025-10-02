// frontend/pages/sealed/[id].tsx
import React, { useEffect } from 'react';
import Layout from '../../components/Layout';
import { apiGet } from '../../lib/api';

export async function getServerSideProps(ctx:any) {
  const { id } = ctx.params;
  const data = await apiGet(`/api/sealed/${id}`);
  if (!data || data.detail === 'Sealed item not found') return { notFound: true };
  return { props: { data } };
}

export default function SealedPage({ data }: { data: any }) {
  const { sealed, listings, last_updated_by_source } = data;

  useEffect(() => {
    const key = 'recent_viewed_sealed';
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    const nv = [sealed.id, ...v.filter((x:string)=>x!==sealed.id)].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(nv));
  }, [sealed.id]);

  return (
    <Layout>
      <h2>{sealed.name}</h2>

      <div className="grid-auto" style={{ marginTop:16 }}>
        {listings.map((l:any)=>(
          <div key={l.id} style={{ display:'grid', gridTemplateColumns:'1fr 3fr 1fr 1fr 1fr', gap:12, alignItems:'center', border:'1px solid #eee', borderRadius:8, padding:12 }}>
            <div style={{ fontWeight:600 }}>{l.source_code === 'ebay_sandbox' ? 'eBay (Sandbox Demo)' : l.source_code}</div>
            <div>{l.title}</div>
            <div style={{ textAlign:'right' }}>${(l.price_cents/100).toFixed(2)}</div>
            <div style={{ textAlign:'right' }}>{l.shipping_cents != null ? '$'+(l.shipping_cents/100).toFixed(2) : '-'}</div>
            <div>{new Date(l.fetched_at).toLocaleString()} {l.url ? <a href={l.url} target="_blank" style={{ marginLeft:8 }}>View</a> : null}</div>
          </div>
        ))}
        {(!listings || !listings.length) && <p style={{ color:'#666' }}>No listings yet. Click “Refresh All” on the API or wait for hourly refresh.</p>}
      </div>

      <p style={{ marginTop:8, fontSize:12, color:'#666' }}>
        Last Updated by Source: {Object.entries(last_updated_by_source).map(([k,v])=>`${k}: ${new Date(v as string).toLocaleString()}`).join(' • ') || '—'}
      </p>
    </Layout>
  );
}
