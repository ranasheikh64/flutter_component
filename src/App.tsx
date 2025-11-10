import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { DetailPage } from './components/DetailPage';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { supabase } from './utils/supabase/client';

type View = 'home' | 'detail' | 'admin';

interface UserState {
  accessToken: string | null;
  userId: string | null;
  userName: string | null;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState<UserState>({
    accessToken: null,
    userId: null,
    userName: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        setUser({
          accessToken: data.session.access_token,
          userId: data.session.user.id,
          userName: data.session.user.user_metadata?.name || 'Anonymous',
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const handleLogin = (accessToken: string, userId: string, userName: string) => {
    setUser({ accessToken, userId, userName });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser({ accessToken: null, userId: null, userName: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedSnippetId(id);
    setCurrentView('detail');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedSnippetId(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleAdminClick = () => {
    setCurrentView('admin');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      {currentView === 'home' && (
        <HomePage
          key={refreshKey}
          onViewDetails={handleViewDetails}
          onAdminClick={handleAdminClick}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}
      
      {currentView === 'detail' && selectedSnippetId && (
        <DetailPage
          snippetId={selectedSnippetId}
          onBack={handleBackToHome}
          onRefresh={handleRefresh}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}
      
      {currentView === 'admin' && (
        <AdminDashboard 
          onBack={handleBackToHome}
          user={user}
          onLogout={handleLogout}
        />
      )}
      
      <Toaster />
    </>
  );
}
