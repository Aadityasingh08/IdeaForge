import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProjectProvider } from './state/ProjectContext';
import { AuthProvider, RequireAuth, useAuth } from './state/AuthContext';
import { CookieNotice } from './components/CookieNotice';
import type { ReactNode } from 'react';
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
const BrandBook = lazy(() => import('./pages/BrandBook'));
const PitchDeck = lazy(() => import('./pages/PitchDeck'));
const SharedBrand = lazy(() => import('./pages/SharedBrand'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/auth/PasswordReset').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/PasswordReset').then((m) => ({ default: m.ResetPassword })));
const Account = lazy(() => import('./pages/auth/Account'));
const ResumeIdea = lazy(() => import('./pages/auth/ResumeIdea'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));

/** Project cache is per account — switching users starts from a clean slate. */
function AccountScope({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <ProjectProvider key={user?.id ?? 'signed-out'}>{children}</ProjectProvider>;
}

const priv = (el: ReactNode) => <RequireAuth>{el}</RequireAuth>;

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
        <AuthProvider>
        <AccountScope>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/account" element={priv(<Account />)} />
              <Route path="/new-idea" element={priv(<ResumeIdea />)} />
              <Route path="/projects" element={priv(<Projects />)} />
              <Route path="/workspace/:projectId" element={priv(<WorkspaceLayout />)}>
                <Route index element={<WorkspaceIndex />} />
                <Route path="understand" element={<Understand />} />
                <Route path="strategy" element={<Strategy />} />
                <Route path="challenge" element={<Challenge />} />
                <Route path="visual" element={<Visual />} />
                <Route path="brand-kit" element={<BrandKit />} />
              </Route>
              <Route path="/brand-book/:projectId" element={priv(<BrandBook />)} />
              <Route path="/pitch-deck/:projectId" element={priv(<PitchDeck />)} />
              <Route path="/b/:projectId" element={<SharedBrand />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieNotice />
        </AccountScope>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
