import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import type { Question } from "../types";
import {
  createSession,
  getAllSessions,
  updateSession,
  getQuestionById,
} from "../services/firestore";
import { setSessions, addSession, updateSession as updateSessionStore } from "../store/slices/sessionSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Copy, StopCircle, Plus } from "lucide-react";

export const SessionsPage = () => {
  const dispatch = useDispatch();
  const sessions = useSelector((state: RootState) => state.sessions.sessions);
  const candidates = useSelector((state: RootState) => state.candidates.candidates);
  const templates = useSelector((state: RootState) => state.templates.templates);
  const [showForm, setShowForm] = useState(false);
  const [selection, setSelection] = useState<{ candidate?: string; template?: string }>({});
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sessionList = await getAllSessions();
      dispatch(setSessions(sessionList));
    })();
  }, [dispatch]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection.candidate || !selection.template) return;

    const selectedTemplate = templates.find((t) => t.id === selection.template);
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      // Fetch all questions for the template
      const questionsData: Question[] = [];
      for (const questionId of selectedTemplate.questionIds) {
        const question = await getQuestionById(questionId);
        if (question) questionsData.push(question);
      }

      const newSession = await createSession(
        selection.candidate,
        selectedTemplate,
        questionsData
      );

      dispatch(addSession(newSession));
      setSelection({});
      setShowForm(false);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!window.confirm("Terminate this session?")) return;

    try {
      await updateSession(sessionId, { status: "terminated" });
      const updatedSession = sessions.find((s) => s.id === sessionId);
      if (updatedSession) {
        dispatch(updateSessionStore({ ...updatedSession, status: "terminated" }));
      }
    } catch (error) {
      console.error("Error terminating session:", error);
    }
  };

  const handleCopyLink = (sessionId: string) => {
    const link = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(sessionId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getSessionCandidate = (candidateId: string) => {
    return candidates.find((c) => c.id === candidateId);
  };

  const getSessionTemplate = (templateId: string) => {
    return templates.find((t) => t.id === templateId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-orange-100 text-orange-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evaluation Sessions</h1>
          <p className="text-muted-foreground mt-2">Start and manage candidate evaluation sessions</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus size={20} />
          New Session
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Start New Session</CardTitle>
            <CardDescription>Create an evaluation session for a candidate</CardDescription>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 || templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  {candidates.length === 0 && templates.length === 0
                    ? "Create candidates and templates first."
                    : candidates.length === 0
                      ? "Create candidates first."
                      : "Create templates first."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="candidate">Select Candidate</Label>
                    <select
                      id="candidate"
                      value={selection.candidate || ""}
                      onChange={(e) => setSelection({ ...selection, candidate: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      required
                    >
                      <option value="">Choose a candidate...</option>
                      {candidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name} ({candidate.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template">Select Template</Label>
                    <select
                      id="template"
                      value={selection.template || ""}
                      onChange={(e) => setSelection({ ...selection, template: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      required
                    >
                      <option value="">Choose a template...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.questionIds.length} questions)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Start Session"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setSelection({});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Recent Sessions</CardTitle>
          <CardDescription>{sessions.length} session(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sessions yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const candidate = getSessionCandidate(session.candidateId);
                const template = getSessionTemplate(session.templateId);
                const isExpired = new Date() > session.expiresAt;

                return (
                  <div
                    key={session.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {candidate?.name || "Unknown Candidate"}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(isExpired ? "expired" : session.status)}`}>
                            {isExpired ? "Expired" : session.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Template: {template?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Session ID: {session.id.slice(0, 8)}... • Started{" "}
                          {new Date(session.startedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(session.expiresAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {session.status === "active" && !isExpired && (
                          <>
                            <button
                              onClick={() => handleCopyLink(session.id)}
                              className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                              title="Copy session link"
                            >
                              <Copy size={16} />
                            </button>
                            {copiedLink === session.id && (
                              <span className="text-xs text-green-600 self-center">Copied!</span>
                            )}
                          </>
                        )}
                        {session.status === "active" && !isExpired && (
                          <button
                            onClick={() => handleTerminateSession(session.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Terminate session"
                          >
                            <StopCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
