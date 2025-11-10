import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SnippetCard } from './SnippetCard';
import { PostCodeDialog } from './PostCodeDialog';
import { AuthDialog } from './AuthDialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Search, Loader2, Code2, Shield, LogIn, LogOut, User } from 'lucide-react';
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

interface HomePageProps {
  onViewDetails: (id: string) => void;
  onAdminClick: () => void;
  user: UserState;
  onLogin: (accessToken: string, userId: string, userName: string) => void;
  onLogout: () => void;
}

const CATEGORIES = ['All', 'UI Components', 'Functions', 'Animation', 'GetX', 'State Management', 'Navigation', 'Widgets', 'Layouts', 'Other'];

export function HomePage({ onViewDetails, onAdminClick, user, onLogin, onLogout }: HomePageProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handlePostSuccess = () => {
    fetchSnippets();
  };

  const handleAuthSuccess = (accessToken: string, userId: string, userName: string) => {
    onLogin(accessToken, userId, userName);
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = 
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || snippet.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/50">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  Flutter Code Library
                </h1>
                <p className="text-sm text-muted-foreground">Browse, Post & Copy Flutter Code</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user.accessToken ? (
                <>
                  <PostCodeDialog 
                    onSuccess={handlePostSuccess}
                    userId={user.userId}
                    userName={user.userName}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userName}`} />
                          <AvatarFallback>{user.userName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline">{user.userName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={onAdminClick}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={() => setShowAuthDialog(true)} className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="max-w-6xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search code snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-card border-border text-lg"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] bg-card border-border">
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
            <span className="text-sm text-muted-foreground ml-auto">
              {filteredSnippets.length} {filteredSnippets.length === 1 ? 'snippet' : 'snippets'}
            </span>
          </div>
        </div>

        {/* Snippets Grid */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/50">
                <Code2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl mb-2">No snippets found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter' 
                  : 'Be the first to share a Flutter code snippet!'}
              </p>
              {user.accessToken && (
                <PostCodeDialog 
                  onSuccess={handlePostSuccess}
                  userId={user.userId}
                  userName={user.userName}
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map(snippet => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
