import { redirect } from 'next/navigation';

/** The product IS the app; the landing is the explorer. Case study is in nav. */
export default function Home() {
  redirect('/spaces');
}
