'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Athlete, CreateAthleteInput, UpdateAthleteInput } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AthleteForm } from './athlete-form';

const TABS = ['Accepted', 'Pending', 'Search'] as const;

type Tab = typeof TABS[number];

export default function AthletesPage() {
  const [tab, setTab] = useState<Tab>('Accepted');
  const [accepted, setAccepted] = useState<Athlete[]>([]);
  const [pending, setPending] = useState<Athlete[]>([]);
  const [searchResults, setSearchResults] = useState<Athlete[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const { toast } = useToast();

  const fetchAthletes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/athletes');
      if (!response.ok) throw new Error('Failed to fetch athletes');
      const data = await response.json();
      setAccepted(data.accepted || []);
      setPending(data.pending || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load athletes', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAthletes(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const response = await fetch(`/api/athletes?search=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to search athletes');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to search athletes', variant: 'destructive' });
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (athleteId: string) => {
    try {
      const response = await fetch('/api/athletes/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athleteId }),
      });
      if (!response.ok) throw new Error('Failed to send request');
      toast({ title: 'Success', description: 'Request sent!' });
      setSearchResults(searchResults.filter(a => a.id !== athleteId));
      fetchAthletes();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send request', variant: 'destructive' });
    }
  };

  const handleAddAthlete = () => {
    setSelectedAthlete(null);
    setIsFormOpen(true);
  };

  const handleEditAthlete = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setIsFormOpen(true);
  };

  const handleDeleteAthlete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this athlete?')) return;

    try {
      const response = await fetch(`/api/athletes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete athlete');

      toast({
        title: 'Success',
        description: 'Athlete deleted successfully',
      });

      fetchAthletes();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete athlete',
        variant: 'destructive',
      });
    }
  };

  const handleFormSubmit = async (data: CreateAthleteInput | UpdateAthleteInput) => {
    try {
      const url = selectedAthlete
        ? `/api/athletes/${selectedAthlete.id}`
        : '/api/athletes';
      
      const response = await fetch(url, {
        method: selectedAthlete ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save athlete');

      toast({
        title: 'Success',
        description: `Athlete ${selectedAthlete ? 'updated' : 'created'} successfully`,
      });

      setIsFormOpen(false);
      fetchAthletes();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${selectedAthlete ? 'update' : 'create'} athlete`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex space-x-2">
          {TABS.map((t) => (
            <Button key={t} variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)}>
              {t}
            </Button>
          ))}
        </div>
      </div>
      {tab === 'Accepted' && (
        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-4">Accepted Athletes</h2>
          {isLoading ? (
            <div className="p-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Height (cm)</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Gender</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accepted.map((athlete) => (
                  <TableRow key={athlete.id}>
                    <TableCell>{athlete.name}</TableCell>
                    <TableCell>{athlete.email}</TableCell>
                    <TableCell>{athlete.height || '-'}</TableCell>
                    <TableCell>{athlete.weight || '-'}</TableCell>
                    <TableCell>{athlete.gender || '-'}</TableCell>
                  </TableRow>
                ))}
                {accepted.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center">No accepted athletes.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
      {tab === 'Pending' && (
        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-4">Pending Requests</h2>
          {isLoading ? (
            <div className="p-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Height (cm)</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Gender</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((athlete) => (
                  <TableRow key={athlete.id}>
                    <TableCell>{athlete.name}</TableCell>
                    <TableCell>{athlete.email}</TableCell>
                    <TableCell>{athlete.height || '-'}</TableCell>
                    <TableCell>{athlete.weight || '-'}</TableCell>
                    <TableCell>{athlete.gender || '-'}</TableCell>
                  </TableRow>
                ))}
                {pending.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center">No pending requests.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
      {tab === 'Search' && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Search Athletes</h2>
          <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
            <input
              type="text"
              className="border rounded px-3 py-2 flex-1"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Button type="submit" disabled={searching || !searchQuery}>Search</Button>
          </form>
          {searching ? (
            <div>Searching...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((athlete) => (
                  <TableRow key={athlete.id}>
                    <TableCell>{athlete.name}</TableCell>
                    <TableCell>{athlete.email}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleSendRequest(athlete.id)}>Send Request</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {searchResults.length === 0 && searchQuery && !searching && (
                  <TableRow><TableCell colSpan={3} className="text-center">No athletes found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
      {isFormOpen && (
        <AthleteForm
          athlete={selectedAthlete}
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
} 