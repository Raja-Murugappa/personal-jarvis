import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Save,
  Loader2,
  Star,
  Trophy,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { hackathonSchema, type HackathonFormData } from '@/lib/hackathon-schema';
import {
  useHackathon,
  useCreateHackathon,
  useUpdateHackathon,
} from '@/hooks/useHackathons';
import { useProjects } from '@/hooks/useProjects';
import {
  useUploadHackathonAttachment,
  useUpdateAttachment,
  useDeleteAttachment,
} from '@/hooks/useAttachments';
import { TechChipsInput } from '@/components/showcase/TechChipsInput';
import { DynamicTeamSection } from '@/components/showcase/DynamicTeamSection';
import { DynamicLinksSection } from '@/components/showcase/DynamicLinksSection';
import {
  AttachmentDropzone,
  type PendingUpload,
} from '@/components/showcase/AttachmentDropzone';
import { useToast } from '@/components/ui/Toast';

export function HackathonFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  const hackathonId = id ? parseInt(id, 10) : null;

  const { data: existingHackathon, isLoading: isLoadingHackathon } =
    useHackathon(hackathonId);
  const { data: projects = [] } = useProjects({ limit: 100 });
  const createMutation = useCreateHackathon();
  const updateMutation = useUpdateHackathon();
  const uploadAttachmentMutation = useUploadHackathonAttachment();
  const updateAttachmentMutation = useUpdateAttachment();
  const deleteAttachmentMutation = useDeleteAttachment();

  const [pendingFiles, setPendingFiles] = useState<PendingUpload[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema) as any,
    defaultValues: {
      name: '',
      organiser: '',
      start_date: '',
      end_date: '',
      mode: 'online',
      location: '',
      problem_statement_id: '',
      problem_statement: '',
      team_name: '',
      my_role: '',
      submission_summary: '',
      result: 'participated',
      result_detail: '',
      feedback: '',
      lessons_learned: '',
      notes: '',
      is_featured: false,
      project_id: null,
      technologies: [],
      team_members: [],
      links: [],
    },
  });

  // Prepopulate form on edit
  useEffect(() => {
    if (existingHackathon) {
      reset({
        name: existingHackathon.name,
        organiser: existingHackathon.organiser || '',
        start_date: existingHackathon.start_date || '',
        end_date: existingHackathon.end_date || '',
        mode: existingHackathon.mode,
        location: existingHackathon.location || '',
        problem_statement_id: existingHackathon.problem_statement_id || '',
        problem_statement: existingHackathon.problem_statement || '',
        team_name: existingHackathon.team_name || '',
        my_role: existingHackathon.my_role || '',
        submission_summary: existingHackathon.submission_summary || '',
        result: existingHackathon.result,
        result_detail: existingHackathon.result_detail || '',
        feedback: existingHackathon.feedback || '',
        lessons_learned: existingHackathon.lessons_learned || '',
        notes: existingHackathon.notes || '',
        is_featured: existingHackathon.is_featured,
        project_id: existingHackathon.project_id || null,
        technologies: existingHackathon.technologies.map((t) => t.name),
        team_members: existingHackathon.team_members.map((tm) => ({
          name: tm.name,
          role: tm.role || '',
          linkedin_url: tm.linkedin_url || '',
        })),
        links: existingHackathon.links.map((l) => ({
          kind: l.kind as any,
          label: l.label || '',
          url: l.url,
          sort_order: l.sort_order,
        })),
      });
    }
  }, [existingHackathon, reset]);

  // Unsaved changes prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty || pendingFiles.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, pendingFiles.length]);

  const onSubmit = async (formData: any) => {
    try {
      let targetId = hackathonId;

      // Clean empty string dates and project_id
      const payload = {
        ...formData,
        start_date: formData.start_date?.trim() ? formData.start_date : null,
        end_date: formData.end_date?.trim() ? formData.end_date : null,
        project_id: formData.project_id ? Number(formData.project_id) : null,
      };

      if (isEditMode && targetId) {
        await updateMutation.mutateAsync({ id: targetId, data: payload });
        toast('Hackathon updated successfully');
      } else {
        const created = await createMutation.mutateAsync(payload);
        targetId = created.id;
        toast('Hackathon created successfully');
      }

      // Upload pending files if any
      if (pendingFiles.length > 0 && targetId) {
        setIsUploadingFiles(true);
        const remaining: PendingUpload[] = [];

        for (const p of pendingFiles) {
          if (p.error) {
            remaining.push(p);
            continue;
          }
          try {
            await uploadAttachmentMutation.mutateAsync({
              hackathonId: targetId,
              file: p.file,
              kind: p.kind,
              caption: p.caption,
              altText: p.altText,
            });
          } catch (err: any) {
            remaining.push({ ...p, error: err?.message || 'Upload failed' });
          }
        }

        setIsUploadingFiles(false);
        setPendingFiles(remaining);

        if (remaining.length > 0) {
          toast(
            `${remaining.length} attachment(s) failed to upload. You can retry.`
          );
          return;
        }
      }

      navigate(`/hackathons/${targetId}`);
    } catch (err: any) {
      toast(err?.message || 'Failed to save hackathon');
    }
  };

  const handleUpdateCover = async (attachmentId: number, isCover: boolean) => {
    try {
      await updateAttachmentMutation.mutateAsync({
        id: attachmentId,
        data: { is_cover: isCover },
      });
      toast('Cover image updated');
    } catch {
      toast('Failed to update cover');
    }
  };

  const handleDeleteExistingAttachment = async (attachmentId: number) => {
    try {
      await deleteAttachmentMutation.mutateAsync(attachmentId);
      toast('File removed');
    } catch {
      toast('Failed to remove file');
    }
  };

  const isFeatured = watch('is_featured');
  const watchedTechs = watch('technologies');
  const watchedMembers = watch('team_members');
  const watchedLinks = watch('links');
  const selectedProjectId = watch('project_id');

  if (isEditMode && isLoadingHackathon) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">
          Loading hackathon data...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(isEditMode ? `/hackathons/${hackathonId}` : '/hackathons')}
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>{isEditMode ? 'Edit Hackathon' : 'Log New Hackathon'}</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record competition details, problem statement, team roles, and awards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setValue('is_featured', !isFeatured, { shouldDirty: true })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isFeatured
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-current' : ''}`} />
            <span>{isFeatured ? 'Featured Competition' : 'Feature this event'}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || isUploadingFiles}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting || isUploadingFiles ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Save Changes' : 'Save Hackathon'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Event Info */}
        <div className="p-5 rounded-2xl border border-border/70 bg-card/50 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>Competition Overview</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-foreground">
                Hackathon Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Smart India Hackathon 2026, ETHGlobal Tokyo"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Organiser / Host</label>
              <input
                type="text"
                {...register('organiser')}
                placeholder="e.g. Ministry of Education, Major League Hacking"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Event Mode</label>
              <select
                {...register('mode')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="online">Online / Virtual</option>
                <option value="offline">Offline / In-person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Location</label>
              <input
                type="text"
                {...register('location')}
                placeholder="e.g. Bangalore, India (or Discord / Devpost)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Result / Standing</label>
              <select
                {...register('result')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="winner">Winner 🏆</option>
                <option value="runner_up">Runner-up 🥈</option>
                <option value="finalist">Finalist 🎖️</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="participated">Participated</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-foreground">Result Detail / Award</label>
              <input
                type="text"
                {...register('result_detail')}
                placeholder="e.g. 1st Place out of 250 teams ($5,000 cash prize, Best AI track)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Start Date</label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">End Date</label>
              <input
                type="date"
                {...register('end_date')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.end_date && (
                <p className="text-[11px] text-destructive">{errors.end_date.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Linked Project Section */}
        <div className="p-5 rounded-2xl border border-border/70 bg-card/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Linked Project</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                The portfolio project built during this hackathon.
              </p>
            </div>
            <Link
              to="/projects/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create new project</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-1.5">
            <select
              value={selectedProjectId || ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value, 10) : null;
                setValue('project_id', val, { shouldDirty: true });
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">-- None (No linked project) --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.status} - {p.category || 'General'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Problem Statement & Submission */}
        <div className="p-5 rounded-2xl border border-border/70 bg-card/50 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">
            Problem Statement & Submission
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Problem Statement ID / Code
              </label>
              <input
                type="text"
                {...register('problem_statement_id')}
                placeholder="e.g. PS-102 or AI-TRACK-01"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Problem Statement Description
              </label>
              <textarea
                rows={3}
                {...register('problem_statement')}
                placeholder="What was the challenge or problem given by the organizers?"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Submission Summary / Solution Pitch
              </label>
              <textarea
                rows={3}
                {...register('submission_summary')}
                placeholder="How did you solve it within the time limit?"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring resize-y"
              />
            </div>
          </div>
        </div>

        {/* Team & Role */}
        <div className="p-5 rounded-2xl border border-border/70 bg-card/50 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Team & Participation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Team Name</label>
              <input
                type="text"
                {...register('team_name')}
                placeholder="e.g. CodeWarriors, BinaryBeasts"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">My Role</label>
              <input
                type="text"
                {...register('my_role')}
                placeholder="e.g. Lead Fullstack Engineer & Pitch Presenter"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="pt-2">
            <DynamicTeamSection
              teamMembers={watchedMembers || []}
              onChange={(members) => setValue('team_members', members, { shouldDirty: true })}
            />
          </div>
        </div>

        {/* Technologies Used */}
        <div className="p-5 rounded-2xl border border-border/70 bg-card/50 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Tech Stack</h2>
          <TechChipsInput
            technologies={watchedTechs || []}
            onChange={(techs) => setValue('technologies', techs, { shouldDirty: true })}
          />
        </div>

        {/* Links */}
        <div className="p-5 rounded-2xl border border-border/70 bg-card/50 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">External Links</h2>
          <DynamicLinksSection
            links={watchedLinks || []}
            onChange={(links) => setValue('links', links, { shouldDirty: true })}
          />
        </div>

        {/* Reflection & Learnings */}
        <div className="p-5 rounded-2xl border border-border/70 bg-card/50 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Feedback & Retrospective</h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Judge / Mentor Feedback</label>
              <textarea
                rows={2}
                {...register('feedback')}
                placeholder="What did the judges praise or advise on?"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Lessons Learned</label>
              <textarea
                rows={2}
                {...register('lessons_learned')}
                placeholder="Key takeaways from this sprint / competition..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Private Notes (Never logged or exported)
              </label>
              <textarea
                rows={3}
                {...register('notes')}
                placeholder="Private reflections, contacts met, future followups..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring resize-y"
              />
            </div>
          </div>
        </div>

        {/* Media & Attachments */}
        <div className="p-5 rounded-2xl border border-border/70 bg-card/50 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Attachments & Certificates
          </h2>
          <p className="text-xs text-muted-foreground">
            Upload team photos, award certificates, presentation slides, or pitch deck PDFs (max 20 files).
          </p>

          <AttachmentDropzone
            existingAttachments={existingHackathon?.attachments || []}
            pendingFiles={pendingFiles}
            onPendingFilesChange={setPendingFiles}
            onUpdateExisting={handleUpdateCover}
            onDeleteExisting={handleDeleteExistingAttachment}
            isUploading={isUploadingFiles}
          />
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
          <button
            type="button"
            onClick={() => navigate(isEditMode ? `/hackathons/${hackathonId}` : '/hackathons')}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingFiles}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting || isUploadingFiles ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Save Changes' : 'Save Hackathon'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
