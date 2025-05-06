'use client';

import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  redirect('/auth/signin');
  return null;
}
