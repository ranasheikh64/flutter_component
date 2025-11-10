import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CodeViewer } from './CodeViewer';
import { PostCodeDialog } from './PostCodeDialog';
import { AuthDialog } from './AuthDialog';
import { ArrowLeft, Loader2, Calendar, User, LogIn } from 'lucide-react';
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

interface DetailPageProps {
  snippetId: string;
  onBack: () => void;
  onRefresh?: () => void;
  user: UserState;
  onLogin: (accessToken: string, userId: string, userName: string) => void;
  onLogout: () => void;
}

export function DetailPage({ snippetId, onBack, onRefresh, user, onLogin, onLogout }: DetailPageProps) {
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    fetchSnippet();
  }, [snippetId]);

  const handlePostSuccess = () => {
    onRefresh?.();
  };

  const handleAuthSuccess = (accessToken: string, userId: string, userName: string) => {
    onLogin(accessToken, userId, userName);
  };

  const fetchSnippet = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8768a732/snippets/${snippetId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch snippet');
      }

      const data = await response.json();
      setSnippet(data.snippet);
    } catch (error) {
      console.error('Error fetching snippet:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Snippet not found</h2>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <Button
              variant="ghost"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
            
            {user.accessToken ? (
              <PostCodeDialog 
                onSuccess={handlePostSuccess}
                userId={user.userId}
                userName={user.userName}
              />
            ) : (
              <Button onClick={() => setShowAuthDialog(true)} variant="outline" className="gap-2">
                <LogIn className="w-4 h-4" />
                Login to Post
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="flex-1 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  {snippet.title}
                </h1>
                <Badge 
                  variant="secondary" 
                  className="bg-violet-500/10 text-violet-400 border-violet-500/20"
                >
                  {snippet.category}
                </Badge>
              </div>

              {snippet.description && (
                <p className="text-muted-foreground">{snippet.description}</p>
              )}

              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {snippet.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="border-border bg-secondary/50"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator className="bg-border" />

              {/* User Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-violet-500/20">
                    <AvatarImage src={snippet.userAvatar} />
                    <AvatarFallback className="bg-violet-500/10 text-violet-400">
                      {snippet.userName?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{snippet.userName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Posted {formatDate(snippet.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Use Case */}
          {snippet.useCase && (
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h3 className="mb-3 text-violet-400">Use Case</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{snippet.useCase}</p>
              </CardContent>
            </Card>
          )}

          {/* Code Viewer */}
          <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <CodeViewer code={snippet.code} />
            </CardContent>
          </Card>
        </div>
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
