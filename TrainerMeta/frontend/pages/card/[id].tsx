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
      {/* Back to search link */}
      <div className="wrap backwrap"><a href="/">← Back to search</a></div>

      <div className="wrap page">
        {/* LEFT sticky column */}
        <div className="card-left">
          <div className="imgbox">
            {card.image_url ? <img src={card.image_url} alt={card.name} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : 'Card Image'}
          </div>
          <h1>{card.name} — {card.set_name} ({card.release_year || ''}) • #{card.number}</h1>
          <div className="muted">{card.rarity || '—'} • {card.language || 'EN'} • Market opens daily 10:00 AM ET • Hot cards hourly</div>
          <div className="cta-row">
            <button className="cta">+ Add to Watchlist</button>
            <button className="cta">+ Add to Collection</button>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="rightcol">
          <div className="summary"><h3>🔥 Price Summary</h3></div>
          <div className="chart"><div className="chartbox">[chart]</div></div>
          <div className="table-card">
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Title</th>
                    <th>Condition</th>
                    <th style={{ textAlign:'right' }}>Price</th>
                    <th style={{ textAlign:'right' }}>Shipping</th>
                    <th>Last Updated</th>
                    <th>Link</th>
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
          </div>
        </div>
      </div>

      <div className="wrap">
        <footer className="muted" style={{ fontSize:12, marginTop:16 }}>
          Last Updated by Source: {Object.entries(last_updated_by_source).map(([k,v])=>`${k}: ${new Date(v as string).toLocaleString()}`).join(' • ') || '—'}
        </footer>
      </div>
    </Layout>
  );
}
