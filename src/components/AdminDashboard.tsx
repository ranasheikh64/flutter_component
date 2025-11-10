import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, Pencil, Trash2, Loader2, Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  category: string;
  tags?: string[];
  useCase?: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  accessToken: string | null;
  userId: string | null;
  userName: string | null;
}

const CATEGORIES = [
  'UI Components',
  'Functions',
  'Animation',
  'GetX',
  'State Management',
  'Navigation',
  'Widgets',
  'Layouts',
  'Other'
];

interface AdminDashboardProps {
  onBack: () => void;
  user: UserState;
  onLogout: () => void;
}

export function AdminDashboard({ onBack, user, onLogout }: AdminDashboardProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    category: CATEGORIES[0],
    tags: '',
    useCase: '',
  });

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8768a732/snippets`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch snippets');
      }
      
      const data = await response.json();
      setSnippets(data.snippets || []);
    } catch (error) {
      console.error('Error fetching snippets:', error);
      toast.error('Failed to fetch snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.code || !formData.category) {
      toast.error('Title, code, and category are required');
      return;
    }

    if (!editingSnippet) {
      toast.error('No snippet selected for editing');
      return;
    }

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const body = {
        title: formData.title,
        description: formData.description,
        code: formData.code,
        category: formData.category,
        tags,
        useCase: formData.useCase,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8768a732/snippets/${editingSnippet.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update snippet');
      }

      toast.success('Snippet updated successfully');
      setIsDialogOpen(false);
      resetForm();
      fetchSnippets();
    } catch (error) {
      console.error('Error updating snippet:', error);
      toast.error('Failed to update snippet');
    }
  };

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setFormData({
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      category: snippet.category,
      tags: snippet.tags?.join(', ') || '',
      useCase: snippet.useCase || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8768a732/snippets/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete snippet');
      }

      toast.success('Snippet deleted successfully');
      fetchSnippets();
    } catch (error) {
      console.error('Error deleting snippet:', error);
      toast.error('Failed to delete snippet');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      code: '',
      category: CATEGORIES[0],
      tags: '',
      useCase: '',
    });
    setEditingSnippet(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
            
            {user.userName && (
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userName}`} />
                  <AvatarFallback>{user.userName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.userName}</span>
                <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/50">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Manage all Flutter code snippets - edit or delete any post</p>
              </div>
            </div>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
              <DialogHeader>
                <DialogTitle>Edit Snippet</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Custom Button Widget"
                    required
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this code snippet"
                    rows={3}
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Textarea
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Paste your Flutter code here..."
                    rows={12}
                    className="font-mono text-sm bg-input border-border"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., UI, Responsive, Material Design"
                    className="bg-input border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="useCase">Use Case</Label>
                  <Textarea
                    id="useCase"
                    value={formData.useCase}
                    onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                    placeholder="Describe when and how to use this code..."
                    rows={4}
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
                    Update Snippet
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Snippets List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : snippets.length === 0 ? (
            <Card className="border-border bg-card/50">
              <CardContent className="py-20 text-center">
                <p className="text-muted-foreground">No snippets to manage yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Users can post code snippets from the main page
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {snippets.map(snippet => (
                <Card key={snippet.id} className="border-border bg-card/50 backdrop-blur-sm hover:border-violet-500/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <CardTitle className="flex-1">{snippet.title}</CardTitle>
                          <Badge 
                            variant="secondary" 
                            className="bg-violet-500/10 text-violet-400 border-violet-500/20"
                          >
                            {snippet.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {snippet.description}
                        </p>
                        
                        {snippet.tags && snippet.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {snippet.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-border bg-secondary/50">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Avatar className="w-6 h-6 border border-border">
                            <AvatarImage src={snippet.userAvatar} />
                            <AvatarFallback className="text-xs bg-violet-500/10">
                              {snippet.userName?.[0] || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <span>Posted by {snippet.userName}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(snippet)}
                          className="gap-2 border-border hover:border-violet-500/50"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(snippet.id)}
                          className="gap-2 border-border hover:border-red-500/50 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
