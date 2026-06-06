import React, { useEffect, useState } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import AudioTest from './AudioTest';
import { UnitIndexView } from '../views/UnitIndexView';
import ProgressView from '../views/ProgressView';
import { ActivityView } from '../views/ActivityView';
import { EndlessActivity } from './Activities/EndlessActivity';
import { BlendEndlessActivity } from './Activities/BlendEndlessActivity';
import { MixedEndlessActivity } from './Activities/MixedEndlessActivity';
import SuccessDemo from '../views/SuccessDemo';
import { ProfileSelector } from '../views/ProfileSelector';
import { NewProfileView } from '../views/NewProfileView';
import { EditProfileView } from '../views/EditProfileView';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import MapView from '../views/MapView';
import { LessonView } from '../views/LessonView';
import { AuthView } from '../views/AuthView';
import { supabase } from '../store/supabaseClient';
import { initStorageAdapter } from '../store/storage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { activeProfile, isLoaded } = useProfile();
  if (!isLoaded) return null;
  if (!activeProfile) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProfileSelector />} />
      <Route path="/new-profile" element={<NewProfileView />} />
      <Route path="/edit-profile/:profileId" element={<EditProfileView />} />
      <Route path="/activity/:activityId" element={<ProtectedRoute><ActivityView /></ProtectedRoute>} />
      <Route path="/endless" element={<ProtectedRoute><EndlessActivity /></ProtectedRoute>} />
      <Route path="/endless-blend" element={<ProtectedRoute><BlendEndlessActivity /></ProtectedRoute>} />
      <Route path="/endless-mixed" element={<ProtectedRoute><MixedEndlessActivity /></ProtectedRoute>} />
      <Route path="/audiotest" element={<AudioTest />} />
      <Route path="/units" element={<ProtectedRoute><UnitIndexView /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><ProgressView /></ProtectedRoute>} />
      <Route path="/success-demo" element={<SuccessDemo />} />
      <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
      <Route path="/lesson/:nodeId" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
    </Routes>
  );
}

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s) await initStorageAdapter();
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s) await initStorageAdapter();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return null;
  if (!session) return <AuthView />;

  return (
    <ProfileProvider>
      <AppRoutes />
    </ProfileProvider>
  );
};

export default App;
