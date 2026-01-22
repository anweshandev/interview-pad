import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import {
  createQuestion,
  updateQuestion as updateQuestionService,
  deleteQuestion,
  subscribeToQuestions,
} from "../services/firestore";
import {
  setQuestions,
  addQuestion,
  updateQuestion,
  removeQuestion,
  setSelectedQuestion,
} from "../store/slices/questionSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Trash2, Plus, Edit2 } from "lucide-react";

export const QuestionsPage = () => {
  const dispatch = useDispatch();
  const questions = useSelector((state: RootState) => state.questions.questions);
  const selectedQuestion = useSelector((state: RootState) => state.questions.selectedQuestion);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToQuestions((updatedQuestions) => {
      dispatch(setQuestions(updatedQuestions));
    });

    return unsubscribe;
  }, [dispatch]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setLoading(true);
    try {
      if (isEditing && selectedQuestion) {
        await updateQuestionService(selectedQuestion.id, {
          title: formData.title,
          content: formData.content,
        });
        dispatch(
          updateQuestion({
            ...selectedQuestion,
            title: formData.title,
            content: formData.content,
          })
        );
        setIsEditing(false);
      } else {
        const newQuestion = await createQuestion(formData.title, formData.content);
        dispatch(addQuestion(newQuestion));
      }
      setFormData({ title: "", content: "" });
      setShowForm(false);
      dispatch(setSelectedQuestion(null));
    } catch (error) {
      console.error("Error saving question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question: any) => {
    dispatch(setSelectedQuestion(question));
    setFormData({ title: question.title, content: question.content });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm("Are you sure? Questions in templates will be affected.")) return;

    try {
      await deleteQuestion(questionId);
      dispatch(removeQuestion(questionId));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setFormData({ title: "", content: "" });
    dispatch(setSelectedQuestion(null));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
          <p className="text-muted-foreground mt-2">Manage global questions</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) handleCancel();
          }}
          className="gap-2"
        >
          <Plus size={20} />
          Add Question
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Question" : "Add New Question"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update the question details"
                : "Create a new global question in markdown format"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Question Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Reverse a String"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Question Content (Markdown)</Label>
                <Textarea
                  id="content"
                  placeholder="Write your question in markdown format..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Question"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
          <CardDescription>{questions.length} question(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No questions yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{question.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {question.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {new Date(question.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
