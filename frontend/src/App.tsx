import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Dashboard } from '@/pages/Dashboard';
import { TasksPage } from '@/pages/TasksPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import {
  Bot,
  GraduationCap,
  BrainCircuit,
  Briefcase,
  Newspaper,
  FolderGit2,
  Trophy,
  Dumbbell,
  Wallet,
  BookMarked,
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

        {/* 8. Projects */}
        <Route
          path="projects"
          element={
            <PlaceholderPage
              title="Projects"
              description="Portfolio builds, milestones, and repositories"
              icon={<FolderGit2 className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

        {/* 9. Hackathons */}
        <Route
          path="hackathons"
          element={
            <PlaceholderPage
              title="Hackathons"
              description="Upcoming competitions and team coordination"
              icon={<Trophy className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

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
        <Route
          path="journal"
          element={
            <PlaceholderPage
              title="Daily Journal"
              description="Daily reflections, gratitude, and executive logs"
              icon={<BookMarked className="w-5 h-5 text-neutral-500" />}
            />
          }
        />

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
