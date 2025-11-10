import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Code2, Calendar, User } from 'lucide-react';

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

interface SnippetCardProps {
  snippet: Snippet;
  onViewDetails: (id: string) => void;
}

export function SnippetCard({ snippet, onViewDetails }: SnippetCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Card
       className="group hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer border-border bg-card/50 backdrop-blur-sm hover:border-violet-500/50
             flex flex-col h-[400px]" // fixed height
  onClick={() => onViewDetails(snippet.id)}
>
  <CardHeader className="space-y-2 flex-1 overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <CardTitle
            className="flex-1 group-hover:text-violet-400 transition-colors line-clamp-2 overflow-hidden text-ellipsis min-w-0"
          >
            {snippet.title}
          </CardTitle>

          <Badge
            variant="secondary"
            className="bg-violet-500/10 text-violet-400 border-violet-500/20 shrink-0"
          >
            {snippet.category}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {snippet.description}
        </p>

        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 overflow-hidden">
            {snippet.tags && snippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-hidden">
                {snippet.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs border-border bg-secondary/50 whitespace-nowrap"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

          </div>

        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 border border-border">
              <AvatarImage src={snippet.userAvatar} />
              <AvatarFallback className="text-xs bg-violet-500/10">
                {snippet.userName?.[0] || 'A'}
              </AvatarFallback>
            </Avatar>
            <span>{snippet.userName}</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(snippet.createdAt)}
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(snippet.id);
          }}
        >
          <Code2 className="w-4 h-4 mr-2" />
          View Code
        </Button>
      </CardContent>
    </Card>
  );
}
