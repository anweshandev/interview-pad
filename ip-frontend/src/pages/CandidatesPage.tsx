import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import {
  createCandidate,
  deleteCandidate,
  subscribeToCandidates,
} from "../services/firestore";
import { setCandidates, addCandidate, removeCandidate } from "../store/slices/candidateSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Trash2, Plus } from "lucide-react";

export const CandidatesPage = () => {
  const dispatch = useDispatch();
  const candidates = useSelector((state: RootState) => state.candidates.candidates);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: "", name: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCandidates((updatedCandidates) => {
      dispatch(setCandidates(updatedCandidates));
    });

    return unsubscribe;
  }, [dispatch]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name) return;

    setLoading(true);
    try {
      const newCandidate = await createCandidate(formData.email, formData.name);
      dispatch(addCandidate(newCandidate));
      setFormData({ email: "", name: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating candidate:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;

    try {
      await deleteCandidate(candidateId);
      dispatch(removeCandidate(candidateId));
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground mt-2">Manage interview candidates</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus size={20} />
          Add Candidate
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Candidate</CardTitle>
            <CardDescription>Create a new candidate for interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="candidate@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Candidate"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
          <CardDescription>{candidates.length} candidate(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No candidates yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Created</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{candidate.name}</td>
                      <td className="py-3 px-4">{candidate.email}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
