import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function CoachDashboard() {
  // In the future, fetch real data here
  // const session = await getServerSession(authOptions);
  // const coachName = session?.user?.name || 'Coach';
  const coachName = 'Coach';

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {coachName}!</h1>
      <p className="text-gray-600 mb-6">Manage athletes, protocols, schedules, and more from your dashboard.</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link href="/dashboard/coach/athletes" className="block bg-indigo-50 hover:bg-indigo-100 rounded-lg p-6 shadow transition">
          <h2 className="text-lg font-semibold mb-2 text-indigo-700">Athlete Management</h2>
          <p className="text-gray-700">View, add, and manage athletes.</p>
        </Link>
        <Link href="/dashboard/coach/protocols" className="block bg-green-50 hover:bg-green-100 rounded-lg p-6 shadow transition">
          <h2 className="text-lg font-semibold mb-2 text-green-700">Test Protocols</h2>
          <p className="text-gray-700">Create and edit test protocols.</p>
        </Link>
        <Link href="/dashboard/coach/schedule" className="block bg-yellow-50 hover:bg-yellow-100 rounded-lg p-6 shadow transition">
          <h2 className="text-lg font-semibold mb-2 text-yellow-700">Schedule Management</h2>
          <p className="text-gray-700">Manage test schedules and appointments.</p>
        </Link>
        <Link href="/dashboard/coach/dataentry" className="block bg-purple-50 hover:bg-purple-100 rounded-lg p-6 shadow transition">
          <h2 className="text-lg font-semibold mb-2 text-purple-700">Test Data Entry</h2>
          <p className="text-gray-700">Enter test results for athletes.</p>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/coach/analysis" className="block bg-blue-50 hover:bg-blue-100 rounded-lg p-6 shadow transition">
          <h2 className="text-lg font-semibold mb-2 text-blue-700">Performance Analysis</h2>
          <p className="text-gray-700">Analyze athlete performance and trends.</p>
        </Link>
        <Link href="/dashboard/coach/notes" className="block bg-pink-50 hover:bg-pink-100 rounded-lg p-6 shadow transition">
          <h2 className="text-lg font-semibold mb-2 text-pink-700">Notes & Feedback</h2>
          <p className="text-gray-700">Leave notes and feedback for athletes.</p>
        </Link>
      </div>
      {/* Future: Add stats, recent activity, or quick actions here */}
    </div>
  );
} 