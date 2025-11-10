import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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

interface PostCodeDialogProps {
  onSuccess?: () => void;
  userId?: string | null;
  userName?: string | null;
}

export function PostCodeDialog({ onSuccess, userId, userName }: PostCodeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    category: CATEGORIES[0],
    tags: '',
    useCase: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.code || !formData.category) {
      toast.error('Title, code, and category are required');
      return;
    }

    setIsSubmitting(true);

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
        userId: userId || null,
        userName: userName || 'Anonymous',
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8768a732/snippets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create snippet');
      }

      toast.success('Code snippet posted successfully! 🎉');
      setIsOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating snippet:', error);
      toast.error('Failed to post code snippet');
    } finally {
      setIsSubmitting(false);
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
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Post Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Your Flutter Code</DialogTitle>
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
              className="font-mono text-sm"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
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
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Code'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
