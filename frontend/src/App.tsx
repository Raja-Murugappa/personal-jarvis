import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Dashboard } from '@/pages/Dashboard';
import { TasksPage } from '@/pages/TasksPage';
import { JournalPage } from '@/pages/JournalPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ProjectFormPage } from '@/pages/ProjectFormPage';
import { HackathonsPage } from '@/pages/HackathonsPage';
import { HackathonDetailPage } from '@/pages/HackathonDetailPage';
import { HackathonFormPage } from '@/pages/HackathonFormPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import {
  Bot,
  GraduationCap,
  BrainCircuit,
  Briefcase,
  Newspaper,
  Dumbbell,
  Wallet,
  BarChart3,
  Settings,
} from 'lucide-react';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        {/* 1. Dashboard */}
        <Route index element={<Dashboard />} />

        {/* 2. JARVIS Assistant */}
        <Route
          path="assistant"
          element={
            <PlaceholderPage
              title="JARVIS Assistant"
              description="Local-first AI conversational intelligence partner"
              icon={<Bot className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

        {/* 3. Academics */}
        <Route
          path="academics"
          element={
            <PlaceholderPage
              title="Academics"
              description="Curriculum, exams, attendance, and coursework"
              icon={<GraduationCap className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

        {/* 4. Tasks and Calendar */}
        <Route path="tasks" element={<TasksPage />} />

        {/* 5. Skills and Learning */}
        <Route
          path="skills"
          element={
            <PlaceholderPage
              title="Skills and Learning"
              description="Continuous skill roadmaps and knowledge acquisition"
              icon={<BrainCircuit className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

        {/* 6. Career Intelligence */}
        <Route
          path="career"
          element={
            <PlaceholderPage
              title="Career Intelligence"
              description="Job market targeting, resumes, and interview preparation"
              icon={<Briefcase className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

        {/* 7. AI News */}
        <Route
          path="ai-news"
          element={
            <PlaceholderPage
              title="AI News"
              description="Curated local AI digests and developments"
              icon={<Newspaper className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

        {/* 8. Projects Vault */}
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<ProjectFormPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="projects/:id/edit" element={<ProjectFormPage />} />

        {/* 9. Hackathons Vault */}
        <Route path="hackathons" element={<HackathonsPage />} />
        <Route path="hackathons/new" element={<HackathonFormPage />} />
        <Route path="hackathons/:id" element={<HackathonDetailPage />} />
        <Route path="hackathons/:id/edit" element={<HackathonFormPage />} />

        {/* 10. Fitness and Health */}
        <Route
          path="fitness"
          element={
            <PlaceholderPage
              title="Fitness and Health"
              description="Workouts, recovery, and wellness streaks"
              icon={<Dumbbell className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

        {/* 11. Finance */}
        <Route
          path="finance"
          element={
            <PlaceholderPage
              title="Finance"
              description="Budgeting, expense logging, and savings milestones"
              icon={<Wallet className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

        {/* 12. Daily Journal */}
        <Route path="journal" element={<JournalPage />} />

        {/* 13. Analytics */}
        <Route
          path="analytics"
          element={
            <PlaceholderPage
              title="Analytics"
              description="Productivity metrics, habit correlations, and reports"
              icon={<BarChart3 className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

        {/* 14. Settings and Backup */}
        <Route
          path="settings"
          element={
            <PlaceholderPage
              title="Settings and Backup"
              description="App preferences, data backup, and export tools"
              icon={<Settings className="w-5 h-5 text-neutral-500" />}
            />
          }
        />
      </Route>
    </Routes>
  );
}
export default App;
