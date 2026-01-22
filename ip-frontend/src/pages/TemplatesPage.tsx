import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { useAuth } from "../hooks/useAuth";
import {
  createTemplate,
  updateTemplate as updateTemplateService,
  deleteTemplate,
  subscribeToTemplates,
} from "../services/firestore";
import {
  setTemplates,
  addTemplate,
  updateTemplate,
  removeTemplate,
  setSelectedTemplate,
} from "../store/slices/templateSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Trash2, Plus, Edit2 } from "lucide-react";

export const TemplatesPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const templates = useSelector((state: RootState) => state.templates.templates);
  const questions = useSelector((state: RootState) => state.questions.questions);
  const selectedTemplate = useSelector((state: RootState) => state.templates.selectedTemplate);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedQuestionIds: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToTemplates(user.id, (updatedTemplates) => {
      dispatch(setTemplates(updatedTemplates));
    });

    return unsubscribe;
  }, [user?.id, dispatch]);

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.name || formData.selectedQuestionIds.length === 0) return;

    setLoading(true);
    try {
      if (isEditing && selectedTemplate) {
        await updateTemplateService(selectedTemplate.id, {
          name: formData.name,
          description: formData.description,
          questionIds: formData.selectedQuestionIds,
        });
        dispatch(
          updateTemplate({
            ...selectedTemplate,
            name: formData.name,
            description: formData.description,
            questionIds: formData.selectedQuestionIds,
          })
        );
        setIsEditing(false);
      } else {
        const newTemplate = await createTemplate(
          user.id,
          formData.name,
          formData.description,
          formData.selectedQuestionIds
        );
        dispatch(addTemplate(newTemplate));
      }
      setFormData({ name: "", description: "", selectedQuestionIds: [] });
      setShowForm(false);
      dispatch(setSelectedTemplate(null));
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template: any) => {
    dispatch(setSelectedTemplate(template));
    setFormData({
      name: template.name,
      description: template.description,
      selectedQuestionIds: template.questionIds,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;

    try {
      await deleteTemplate(templateId);
      dispatch(removeTemplate(templateId));
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const toggleQuestion = (questionId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedQuestionIds: prev.selectedQuestionIds.includes(questionId)
        ? prev.selectedQuestionIds.filter((id) => id !== questionId)
        : [...prev.selectedQuestionIds, questionId],
    }));
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setFormData({ name: "", description: "", selectedQuestionIds: [] });
    dispatch(setSelectedTemplate(null));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground mt-2">Create and manage evaluation templates</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) handleCancel();
          }}
          className="gap-2"
        >
          <Plus size={20} />
          New Template
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Template" : "Create New Template"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update template details and questions"
                : "Create a template by combining questions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No questions available. Create questions first.</p>
              </div>
            ) : (
              <form onSubmit={handleAddTemplate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., JavaScript Basics"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Select Questions (in order)</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-lg p-4">
                    {questions.map((question) => (
                      <div key={question.id} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={question.id}
                          checked={formData.selectedQuestionIds.includes(question.id)}
                          onChange={() => toggleQuestion(question.id)}
                          className="mt-1"
                        />
                        <label htmlFor={question.id} className="flex-1 cursor-pointer">
                          <p className="font-medium text-sm">{question.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {question.content}
                          </p>
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.selectedQuestionIds.length === 0 && (
                    <p className="text-sm text-red-600">Select at least one question</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading || formData.selectedQuestionIds.length === 0}>
                    {loading ? "Saving..." : "Save Template"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>{templates.length} template(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {template.questionIds.length} question(s) • Created{" "}
                        {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
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
