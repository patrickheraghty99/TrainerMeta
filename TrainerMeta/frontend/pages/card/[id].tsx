// frontend/pages/card/[id].tsx
import React, { useEffect } from 'react';
import Layout from '../../components/Layout';
import { apiGet } from '../../lib/api';

export async function getServerSideProps(ctx:any) {
  const { id } = ctx.params;
  const data = await apiGet(`/api/cards/${id}`);
  if (!data || data.detail === 'Card not found') return { notFound: true };
  return { props: { data } };
}

export default function CardPage({ data }: { data: any }) {
  const { card, listings, last_updated_by_source } = data;

  useEffect(() => {
    const key = 'recent_viewed';
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    const nv = [card.id, ...v.filter((x:string)=>x!==card.id)].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(nv));
  }, [card.id]);

  return (
    <Layout>
      <h2>{card.name} — {card.set_name} #{card.number}</h2>
      {card.image_url ? <img src={card.image_url} alt={card.name} style={{ maxWidth: 320 }} /> : null}

      <div className="table-wrap">
        <table style={{ width:'100%', marginTop:16, borderCollapse:'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign:'left', borderBottom:'1px solid #ddd' }}>Source</th>
              <th style={{ textAlign:'left', borderBottom:'1px solid #ddd' }}>Title</th>
              <th style={{ textAlign:'left', borderBottom:'1px solid #ddd' }}>Condition</th>
              <th style={{ textAlign:'right', borderBottom:'1px solid #ddd' }}>Price</th>
              <th style={{ textAlign:'right', borderBottom:'1px solid #ddd' }}>Shipping</th>
              <th style={{ textAlign:'left', borderBottom:'1px solid #ddd' }}>Last Updated</th>
              <th style={{ textAlign:'left', borderBottom:'1px solid #ddd' }}>Link</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l:any)=>(
              <tr key={l.id}>
                <td>{l.source_code === 'ptcg' ? 'Pokémon TCG API' : l.source_code === 'ebay_sandbox' ? 'eBay (Sandbox Demo)' : l.source_code}</td>
                <td>{l.title}</td>
                <td>{l.condition ?? '-'}</td>
                <td style={{ textAlign:'right' }}>${(l.price_cents/100).toFixed(2)}</td>
                <td style={{ textAlign:'right' }}>{l.shipping_cents != null ? '$'+(l.shipping_cents/100).toFixed(2) : '-'}</td>
                <td>{new Date(l.fetched_at).toLocaleString()}</td>
                <td>{l.url ? <a href={l.url} target="_blank">View</a> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop:8, fontSize:12, color:'#666' }}>
        Last Updated by Source: {Object.entries(last_updated_by_source).map(([k,v])=>`${k}: ${new Date(v as string).toLocaleString()}`).join(' • ') || '—'}
      </p>
    </Layout>
  );
}
