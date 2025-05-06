'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CoachRequest {
  id: string;
  coach: { id: string; name: string; email: string };
}

export default function AthleteDashboardPage() {
  const [pendingRequests, setPendingRequests] = useState<CoachRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/athletes/pending-coach-requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setPendingRequests(data);
    } catch (e) {
      toast({ title: 'Error', description: 'Could not load coach requests', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch('/api/athletes/accept-coach-request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id }),
      });
      if (!res.ok) throw new Error('Failed to accept request');
      toast({ title: 'Success', description: 'Coach request accepted!' });
      setPendingRequests(pendingRequests.filter(r => r.id !== id));
    } catch (e) {
      toast({ title: 'Error', description: 'Could not accept request', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8">
      {pendingRequests.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-blue-700">Pending Coach Requests</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ul className="space-y-2">
              {pendingRequests.map((req) => (
                <li key={req.id} className="flex items-center justify-between bg-white rounded p-2 shadow">
                  <span>
                    <span className="font-medium">{req.coach.name}</span> (<span className="text-gray-600">{req.coach.email}</span>)
                  </span>
                  <Button size="sm" onClick={() => handleAccept(req.id)}>Accept</Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2">Welcome, Athlete!</h1>
      <p className="text-gray-600 mb-6">Track your performance, view your schedule, and communicate with your coach.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/athlete/pretest" className="block bg-indigo-50 hover:bg-indigo-100 rounded-lg p-6 shadow transition">
          <h2 className="text-lg font-semibold mb-2 text-indigo-700">Pre-test Assessment</h2>
          <p className="text-gray-700">Complete your pre-test assessment before each session.</p>
        </Link>
        <Link href="/dashboard/athlete/tracking" className="block bg-green-50 hover:bg-green-100 rounded-lg p-6 shadow transition">
          <h2 className="text-lg font-semibold mb-2 text-green-700">Performance Tracking</h2>
          <p className="text-gray-700">Track your performance and progress over time.</p>
        </Link>
        <Link href="/dashboard/athlete/schedule" className="block bg-yellow-50 hover:bg-yellow-100 rounded-lg p-6 shadow transition">
          <h2 className="text-lg font-semibold mb-2 text-yellow-700">Schedule</h2>
          <p className="text-gray-700">View your upcoming test schedule.</p>
        </Link>
        <Link href="/dashboard/athlete/communication" className="block bg-pink-50 hover:bg-pink-100 rounded-lg p-6 shadow transition">
          <h2 className="text-lg font-semibold mb-2 text-pink-700">Coach Communication</h2>
          <p className="text-gray-700">Message your coach and receive feedback.</p>
        </Link>
      </div>
      {/* Future: Add stats, next test info, or quick actions here */}
    </div>
  );
} 