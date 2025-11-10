import { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CodeViewerProps {
  code: string;
}

export function CodeViewer({ code }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="relative group">
      <div className="absolute top-4 right-4 z-10">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          className="gap-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border-violet-500/20"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Code
            </>
          )}
        </Button>
      </div>

      <pre className="bg-[#0d1117] text-gray-300 p-6 rounded-lg overflow-x-auto border border-border">
        <code className="text-sm font-mono leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}
