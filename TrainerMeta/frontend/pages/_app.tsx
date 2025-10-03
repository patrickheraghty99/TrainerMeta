// pages/_app.tsx
import type { AppProps } from 'next/app';
import '../styles.css'; // <-- global styles belong here

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
