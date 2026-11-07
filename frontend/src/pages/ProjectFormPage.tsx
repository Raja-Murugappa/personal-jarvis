import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2, Star, FolderGit2 } from 'lucide-react';
import { projectSchema, type ProjectFormData } from '@/lib/project-schema';
import {
  useProject,
  useCreateProject,
  useUpdateProject,
} from '@/hooks/useProjects';
import {
  useUploadProjectAttachment,
  useUpdateAttachment,
  useDeleteAttachment,
} from '@/hooks/useAttachments';
import { TechChipsInput } from '@/components/showcase/TechChipsInput';
import { DynamicTeamSection } from '@/components/showcase/DynamicTeamSection';
import { DynamicLinksSection } from '@/components/showcase/DynamicLinksSection';
import { AttachmentDropzone, type PendingUpload } from '@/components/showcase/AttachmentDropzone';
import { useToast } from '@/components/ui/Toast';

export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  const projectId = id ? parseInt(id, 10) : null;

  const { data: existingProject, isLoading: isLoadingProject } = useProject(projectId);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const uploadAttachmentMutation = useUploadProjectAttachment();
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
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      title: '',
      headline: '',
      description: '',
      problem_statement: '',
      category: '',
      status: 'idea',
      start_date: '',
      end_date: '',
      my_contribution: '',
      challenges: '',
      lessons_learned: '',
      future_improvements: '',
      notes: '',
      is_featured: false,
      technologies: [],
      team_members: [],
      links: [],
    },
  });

  // Prepopulate form on edit
  useEffect(() => {
    if (existingProject) {
      reset({
        title: existingProject.title,
        headline: existingProject.headline || '',
        description: existingProject.description || '',
        problem_statement: existingProject.problem_statement || '',
        category: existingProject.category || '',
        status: existingProject.status,
        start_date: existingProject.start_date || '',
        end_date: existingProject.end_date || '',
        my_contribution: existingProject.my_contribution || '',
        challenges: existingProject.challenges || '',
        lessons_learned: existingProject.lessons_learned || '',
        future_improvements: existingProject.future_improvements || '',
        notes: existingProject.notes || '',
        is_featured: existingProject.is_featured,
        technologies: existingProject.technologies.map((t) => t.name),
        team_members: existingProject.team_members.map((tm) => ({
          name: tm.name,
          role: tm.role || '',
          linkedin_url: tm.linkedin_url || '',
        })),
        links: existingProject.links.map((l) => ({
          kind: l.kind as any,
          label: l.label || '',
          url: l.url,
          sort_order: l.sort_order,
        })),
      });
    }
  }, [existingProject, reset]);

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
      let targetId = projectId;

      if (isEditMode && targetId) {
        await updateMutation.mutateAsync({ id: targetId, data: formData });
        toast('Project updated successfully');
      } else {
        const created = await createMutation.mutateAsync(formData);
        targetId = created.id;
        toast('Project created successfully');
      }

      // Stream upload any pending attachments to this project
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
              projectId: targetId,
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
          toast(`${remaining.length} attachment(s) failed to upload. You can retry.`);
          return;
        }
      }

      navigate(`/projects/${targetId}`);
    } catch (err: any) {
      toast(err?.message || 'Failed to save project');
    }
  };

  const handleUpdateCover = async (attachmentId: number, isCover: boolean) => {
    try {
      await updateAttachmentMutation.mutateAsync({ id: attachmentId, data: { is_cover: isCover } });
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

  if (isEditMode && isLoadingProject) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Loading project...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              {isEditMode ? 'Edit Project' : 'Add New Project'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditMode ? 'Update your build showcase and links.' : 'Document a build, open-source work, or portfolio item.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || isUploadingFiles}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {isSubmitting || isUploadingFiles ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isEditMode ? 'Save Changes' : 'Create Project'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Basics */}
        <section className="p-5 rounded-xl border border-border/80 bg-card space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-primary" />
            <span>Project Basics</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Personal JARVIS"
                {...register('title')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
              />
              {errors.title && (
                <p className="text-[11px] text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Headline (short one-line summary)
              </label>
              <input
                type="text"
                placeholder="e.g. Local-first personal intelligence system with zero cloud tracking"
                {...register('headline')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
              />
              {errors.headline && (
                <p className="text-[11px] text-destructive mt-1">{errors.headline.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. AI / Full-Stack"
                  {...register('category')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
                >
                  <option value="idea">Idea</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('is_featured')}
                    className="rounded border-input text-primary"
                  />
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Featured Project</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('start_date')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">End Date</label>
                <input
                  type="date"
                  {...register('end_date')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
                />
                {errors.end_date && (
                  <p className="text-[11px] text-destructive mt-1">{errors.end_date.message}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Story & Technical Narrative */}
        <section className="p-5 rounded-xl border border-border/80 bg-card space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Project Story & Contributions
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">About (Description)</label>
              <textarea
                rows={3}
                placeholder="What is this project and what does it do?"
                {...register('description')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Problem Statement</label>
              <textarea
                rows={2}
                placeholder="What specific problem does this project solve?"
                {...register('problem_statement')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-primary mb-1">My Contribution & Highlights</label>
              <textarea
                rows={3}
                placeholder="What specifically did you build or architect?"
                {...register('my_contribution')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-primary/40 bg-primary/5 text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Challenges</label>
                <textarea
                  rows={2}
                  placeholder="Key technical hurdles..."
                  {...register('challenges')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Lessons Learned</label>
                <textarea
                  rows={2}
                  placeholder="What you learned..."
                  {...register('lessons_learned')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Future Improvements</label>
                <textarea
                  rows={2}
                  placeholder="Next steps..."
                  {...register('future_improvements')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Technologies */}
        <section className="p-5 rounded-xl border border-border/80 bg-card space-y-3">
          <label className="text-xs font-semibold text-foreground">Technologies & Frameworks</label>
          <TechChipsInput
            technologies={watch('technologies')}
            onChange={(techs) => setValue('technologies', techs, { shouldDirty: true })}
          />
        </section>

        {/* Section 4: Team Members */}
        <section className="p-5 rounded-xl border border-border/80 bg-card">
          <DynamicTeamSection
            teamMembers={watch('team_members')}
            onChange={(members) => setValue('team_members', members, { shouldDirty: true })}
          />
        </section>

        {/* Section 5: Links & Repositories */}
        <section className="p-5 rounded-xl border border-border/80 bg-card">
          <DynamicLinksSection
            links={watch('links')}
            onChange={(links) => setValue('links', links, { shouldDirty: true })}
          />
        </section>

        {/* Section 6: Photos & Documents */}
        <section className="p-5 rounded-xl border border-border/80 bg-card space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Photos, Gallery & Documents
          </h2>
          <AttachmentDropzone
            existingAttachments={existingProject?.attachments || []}
            pendingFiles={pendingFiles}
            onPendingFilesChange={setPendingFiles}
            onUpdateExisting={handleUpdateCover}
            onDeleteExisting={handleDeleteExistingAttachment}
            isUploading={isUploadingFiles}
          />
        </section>

        {/* Section 7: Private Notes */}
        <section className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Important Private Notes
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Architecture decisions, deployment reminders, or credentials structure (never logged, strictly local).
          </p>
          <textarea
            rows={3}
            placeholder="Your private notes..."
            {...register('notes')}
            className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground"
          />
        </section>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingFiles}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting || isUploadingFiles ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isEditMode ? 'Save Changes' : 'Create Project'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

