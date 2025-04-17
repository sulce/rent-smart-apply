
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CustomQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Edit2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CustomQuestionsManager = () => {
  const { agentProfile, addCustomQuestion, deleteCustomQuestion, updateCustomQuestion } = useAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({
    id: "",
    questionText: "",
    required: false,
    type: "text",
    options: []
  });
  const [newOption, setNewOption] = useState("");

  const resetNewQuestionForm = () => {
    setNewQuestion({
      id: "",
      questionText: "",
      required: false,
      type: "text",
      options: []
    });
    setNewOption("");
  };

  const handleAddQuestion = async () => {
    try {
      if (!newQuestion.questionText) {
        toast({
          title: "Invalid Input",
          description: "Please enter a question.",
          variant: "destructive"
        });
        return;
      }
      
      // For question types that require options, validate that there are options
      if ((newQuestion.type === "radio" || newQuestion.type === "checkbox" || newQuestion.type === "select") && 
          (!newQuestion.options || newQuestion.options.length < 2)) {
        toast({
          title: "Invalid Input",
          description: `${newQuestion.type} questions need at least 2 options.`,
          variant: "destructive"
        });
        return;
      }
      
      // Create new question with unique ID
      const questionToAdd = {
        ...newQuestion,
        id: `cq-${Date.now()}`
      };
      
      const success = await addCustomQuestion(questionToAdd);
      
      if (success) {
        toast({
          title: "Success",
          description: "Custom question added successfully."
        });
        setIsAdding(false);
        resetNewQuestionForm();
      } else {
        toast({
          title: "Error",
          description: "Failed to add custom question.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding custom question:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const success = await deleteCustomQuestion(id);
      
      if (success) {
        toast({
          title: "Success",
          description: "Question deleted successfully."
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete question.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateQuestion = async (question: CustomQuestion) => {
    try {
      // Validate the same way as adding
      if (!question.questionText) {
        toast({
          title: "Invalid Input",
          description: "Please enter a question.",
          variant: "destructive"
        });
        return;
      }
      
      if ((question.type === "radio" || question.type === "checkbox" || question.type === "select") && 
          (!question.options || question.options.length < 2)) {
        toast({
          title: "Invalid Input",
          description: `${question.type} questions need at least 2 options.`,
          variant: "destructive"
        });
        return;
      }
      
      const success = await updateCustomQuestion(question);
      
      if (success) {
        toast({
          title: "Success",
          description: "Question updated successfully."
        });
        setIsEditing(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to update question.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    setNewQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption.trim()]
    }));
    setNewOption("");
  };

  const handleRemoveOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }));
  };

  const handleEditAddOption = (question: CustomQuestion, option: string) => {
    if (!option.trim()) return;
    
    const updatedQuestion = {
      ...question,
      options: [...(question.options || []), option.trim()]
    };
    
    setIsEditing(updatedQuestion.id);
    setNewQuestion(updatedQuestion);
    setNewOption("");
  };

  const handleEditRemoveOption = (question: CustomQuestion, index: number) => {
    const updatedQuestion = {
      ...question,
      options: (question.options || []).filter((_, i) => i !== index)
    };
    
    setIsEditing(updatedQuestion.id);
    setNewQuestion(updatedQuestion);
  };

  const startEditing = (question: CustomQuestion) => {
    setIsEditing(question.id);
    setNewQuestion(question);
  };

  const cancelEditing = () => {
    setIsEditing(null);
    resetNewQuestionForm();
  };

  const renderQuestionCard = (question: CustomQuestion) => {
    const isCurrentlyEditing = isEditing === question.id;
    
    if (isCurrentlyEditing) {
      return (
        <Card key={question.id} className="mb-4 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Edit Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`edit-question-${question.id}`}>Question Text</Label>
              <Input
                id={`edit-question-${question.id}`}
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id={`edit-required-${question.id}`}
                checked={newQuestion.required}
                onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, required: checked })}
              />
              <Label htmlFor={`edit-required-${question.id}`}>Required</Label>
            </div>
            
            <div>
              <Label htmlFor={`edit-type-${question.id}`}>Question Type</Label>
              <Select
                value={newQuestion.type}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value as any })}
              >
                <SelectTrigger id={`edit-type-${question.id}`} className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="radio">Radio Buttons</SelectItem>
                  <SelectItem value="checkbox">Checkboxes</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Options editing for radio, checkbox, and select types */}
            {(newQuestion.type === "radio" || newQuestion.type === "checkbox" || newQuestion.type === "select") && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {(newQuestion.options || []).map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Input value={option} disabled />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRemoveOption(newQuestion, idx)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      placeholder="Add new option"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEditAddOption(newQuestion, newOption);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleEditAddOption(newQuestion, newOption)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button onClick={() => handleUpdateQuestion(newQuestion)}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    return (
      <Card key={question.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-md">{question.questionText}</CardTitle>
              <div className="text-sm text-gray-500 flex space-x-2 mt-1">
                <span>{question.type}</span>
                {question.required && <span className="text-red-500">required</span>}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startEditing(question)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteQuestion(question.id)}
                className="h-8 w-8 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {(question.type === "radio" || question.type === "checkbox" || question.type === "select") && question.options && (
          <CardContent className="pt-0">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Options:</p>
              <ul className="list-disc list-inside">
                {question.options.map((option, idx) => (
                  <li key={idx}>{option}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Custom Questions</h2>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)} 
            variant="outline"
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        )}
      </div>
      
      {isAdding && (
        <Card className="mb-4 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Add New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question-text">Question Text</Label>
              <Input
                id="question-text"
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                placeholder="Enter your question"
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="question-required"
                checked={newQuestion.required}
                onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, required: checked })}
              />
              <Label htmlFor="question-required">Required</Label>
            </div>
            
            <div>
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                value={newQuestion.type}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, type: value as any })}
              >
                <SelectTrigger id="question-type" className="mt-1">
                  <SelectValue placeholder="Select a question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="radio">Radio Buttons</SelectItem>
                  <SelectItem value="checkbox">Checkboxes</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Options for radio, checkbox, and select types */}
            {(newQuestion.type === "radio" || newQuestion.type === "checkbox" || newQuestion.type === "select") && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {(newQuestion.options || []).map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Input value={option} disabled />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(idx)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      placeholder="Add new option"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={handleAddOption}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setIsAdding(false);
              resetNewQuestionForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddQuestion}>
              Add Question
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* List of existing questions */}
      <div className="space-y-4">
        {agentProfile?.customQuestions && agentProfile.customQuestions.length > 0 ? (
          agentProfile.customQuestions.map(question => renderQuestionCard(question))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">
              No custom questions added yet. Add questions to gather specific information from tenants.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomQuestionsManager;
