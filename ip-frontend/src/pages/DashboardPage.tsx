import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Users, BookOpen, FileText, Clock } from "lucide-react";
import { subscribeToCandidates, subscribeToQuestions, subscribeToTemplates, getSessionsByAdminId } from "../services/firestore";

export const DashboardPage = () => {
  const { user } = useAuth();
  const [candidateCount, setCandidateCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to candidates
    const unsubCandidates = subscribeToCandidates(user.id, (candidates) => {
      setCandidateCount(candidates.length);
    });

    // Subscribe to questions
    const unsubQuestions = subscribeToQuestions(user.id, (questions) => {
      setQuestionCount(questions.length);
    });

    // Subscribe to templates
    const unsubTemplates = subscribeToTemplates(user.id, (templates) => {
      setTemplateCount(templates.length);
    });

    // Load sessions
    (async () => {
      const sessions = await getSessionsByAdminId(user.id);
      setSessionCount(sessions.filter(s => s.status === "active").length);
    })();

    return () => {
      unsubCandidates();
      unsubQuestions();
      unsubTemplates();
    };
  }, [user?.id]);

  const stats = [
    {
      label: "Total Candidates",
      value: candidateCount,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Questions",
      value: questionCount,
      icon: FileText,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Templates",
      value: templateCount,
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Active Sessions",
      value: sessionCount,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.displayName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get started with the interview platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Create candidates, add questions, build templates, and start evaluation sessions.
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <a href="/dashboard/candidates" className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors">
              <h3 className="font-semibold text-sm">Create Candidate</h3>
              <p className="text-xs text-muted-foreground">Add a new candidate for interviews</p>
            </a>
            <a href="/dashboard/questions" className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors">
              <h3 className="font-semibold text-sm">Add Question</h3>
              <p className="text-xs text-muted-foreground">Create a global question</p>
            </a>
            <a href="/dashboard/templates" className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors">
              <h3 className="font-semibold text-sm">Create Template</h3>
              <p className="text-xs text-muted-foreground">Build an evaluation template</p>
            </a>
            <a href="/dashboard/sessions" className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors">
              <h3 className="font-semibold text-sm">Start Session</h3>
              <p className="text-xs text-muted-foreground">Begin an evaluation</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
