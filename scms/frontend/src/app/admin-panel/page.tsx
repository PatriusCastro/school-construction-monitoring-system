'use client';

import { useEffect, useState } from 'react';
import { createSchool, fetchSchools, updateSchool, deleteSchool } from '@/lib/api';
import SidebarLayout from '@/components/SidebarLayout';

interface School {
  id?: string | number;
  school_id: string;
  school_name: string;
  municipality: string;
  legislative_district: string;
  number_of_sites: number;
  existing_classrooms: number;
  proposed_classrooms: number;
  number_of_units: number;
  stories: number;
  funding_year: number;
  construction_progress_pct: number;
  materials_delivered_pct: number;
  budget_allocated_php: number;
  budget_utilized_php: number;
  completion_date: string;
  latitude: number;
  longitude: number;
}

const emptySchool: School = {
  school_id: '',
  school_name: '',
  municipality: '',
  legislative_district: '',
  number_of_sites: 1,
  existing_classrooms: 0,
  proposed_classrooms: 0,
  number_of_units: 0,
  stories: 0,
  funding_year: new Date().getFullYear(),
  construction_progress_pct: 0,
  materials_delivered_pct: 0,
  budget_allocated_php: 0,
  budget_utilized_php: 0,
  completion_date: '',
  latitude: 13.1939,
  longitude: 123.7437,
};

export default function AdminPanel() {
  const [schools, setSchools] = useState<School[]>([]);
  const [school, setSchool] = useState<School>(emptySchool);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const data = await fetchSchools();
      setSchools(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Failed to load schools');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      if (editingId) {
        await updateSchool(editingId, school);
        setMessage('✓ School updated');
      } else {
        await createSchool(school);
        setMessage('✓ School added');
      }
      setTimeout(() => {
        setSchool(emptySchool);
        setEditingId(null);
        setShowForm(false);
        loadSchools();
      }, 500);
    } catch (err) {
      setError((err as Error).message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s: School) => {
    setSchool(s);
    setEditingId(s.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Delete this school?')) return;
    try {
      setLoading(true);
      await deleteSchool(id);
      setMessage('✓ School deleted');
      await loadSchools();
    } catch (err) {
      setError((err as Error).message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout title="Admin Panel" description="Manage schools">
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-950">Schools Management</h1>
            <p className="text-slate-600 mt-2">Add, edit, and manage school records</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg border border-green-200">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {showForm ? (
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-6 text-slate-950">
                {editingId ? 'Edit School' : 'Add New School'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">School ID *</label>
                    <input type="text" required value={school.school_id} onChange={(e) => setSchool({ ...school, school_id: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">School Name *</label>
                    <input type="text" required value={school.school_name} onChange={(e) => setSchool({ ...school, school_name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Municipality *</label>
                    <input type="text" required value={school.municipality} onChange={(e) => setSchool({ ...school, municipality: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Legislative District</label>
                    <input type="text" value={school.legislative_district} onChange={(e) => setSchool({ ...school, legislative_district: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Sites</label>
                    <input type="number" value={school.number_of_sites} onChange={(e) => setSchool({ ...school, number_of_sites: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Existing Classrooms</label>
                    <input type="number" value={school.existing_classrooms} onChange={(e) => setSchool({ ...school, existing_classrooms: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Proposed Classrooms</label>
                    <input type="number" value={school.proposed_classrooms} onChange={(e) => setSchool({ ...school, proposed_classrooms: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Units</label>
                    <input type="number" value={school.number_of_units} onChange={(e) => setSchool({ ...school, number_of_units: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Stories</label>
                    <input type="number" value={school.stories} onChange={(e) => setSchool({ ...school, stories: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Funding Year</label>
                    <input type="number" value={school.funding_year} onChange={(e) => setSchool({ ...school, funding_year: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Construction Progress %</label>
                    <input type="number" min="0" max="100" value={school.construction_progress_pct} onChange={(e) => setSchool({ ...school, construction_progress_pct: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Materials Delivered %</label>
                    <input type="number" min="0" max="100" value={school.materials_delivered_pct} onChange={(e) => setSchool({ ...school, materials_delivered_pct: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Budget Allocated (PHP)</label>
                    <input type="number" value={school.budget_allocated_php} onChange={(e) => setSchool({ ...school, budget_allocated_php: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Budget Utilized (PHP)</label>
                    <input type="number" value={school.budget_utilized_php} onChange={(e) => setSchool({ ...school, budget_utilized_php: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Completion Date</label>
                    <input type="date" value={school.completion_date} onChange={(e) => setSchool({ ...school, completion_date: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
                    <input type="number" step="0.0001" value={school.latitude} onChange={(e) => setSchool({ ...school, latitude: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
                    <input type="number" step="0.0001" value={school.longitude} onChange={(e) => setSchool({ ...school, longitude: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="flex-1 bg-slate-950 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50">
                    {loading ? 'Saving...' : editingId ? 'Update School' : 'Add School'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setSchool(emptySchool); setEditingId(null); }} className="flex-1 bg-slate-200 text-slate-950 px-6 py-3 rounded-lg font-semibold hover:bg-slate-300">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <button onClick={() => setShowForm(true)} className="mb-6 w-full bg-slate-950 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800">
                + Add New School
              </button>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-950">Schools ({schools.length})</h2>
                </div>
                {loading ? (
                  <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : schools.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No schools added yet. Click "Add New School" to create one.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-950">ID</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-950">Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-950">Municipality</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-950">Progress</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-950">Budget</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-950">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {schools.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-700">{s.school_id}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{s.school_name}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{s.municipality}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{s.construction_progress_pct}%</td>
                            <td className="px-6 py-4 text-sm text-slate-700">₱{(s.budget_allocated_php || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-right space-x-2">
                              <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 font-medium">
                                Edit
                              </button>
                              <button onClick={() => handleDelete(s.id || '')} className="text-red-600 hover:text-red-800 font-medium">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
