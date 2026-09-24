import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProjectProvider } from './state/ProjectContext';
import { ToastProvider } from './components/ui/Toast';
import { WorkspaceIndex, WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { Sparkle } from './components/ui/Logo';
import { EmptyState } from './components/ui/states';
import { ButtonLink } from './components/ui/Button';
import Landing from './pages/Landing';
import Projects from './pages/Projects';

const Understand = lazy(() => import('./pages/workspace/Understand'));
const Strategy = lazy(() => import('./pages/workspace/Strategy'));
const Challenge = lazy(() => import('./pages/workspace/Challenge'));
const Visual = lazy(() => import('./pages/workspace/Visual'));
const BrandKit = lazy(() => import('./pages/workspace/BrandKit'));

function PageFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-label="Loading">
      <Sparkle className="size-8" animated />
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <EmptyState
        title="This page doesn’t exist."
        description="But your next brand might. Head back and start with an idea."
        action={
          <ButtonLink to="/" variant="primary">
            Back to IdeaForge
          </ButtonLink>
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ProjectProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/workspace/:projectId" element={<WorkspaceLayout />}>
                <Route index element={<WorkspaceIndex />} />
                <Route path="understand" element={<Understand />} />
                <Route path="strategy" element={<Strategy />} />
                <Route path="challenge" element={<Challenge />} />
                <Route path="visual" element={<Visual />} />
                <Route path="brand-kit" element={<BrandKit />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ProjectProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
