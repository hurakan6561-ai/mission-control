'use client'

import { useState, useEffect, useCallback } from 'react'
import { PipelineTab } from './pipeline-tab'

interface WorkflowTemplate {
  id: number
  name: string
  description: string | null
  model: string
  task_prompt: string
  timeout_seconds: number
  agent_role: string | null
  tags: string[]
  created_by: string
  use_count: number
  last_used_at: number | null
}

const MODEL_OPTIONS = [
  { value: 'opus', label: 'Claude Opus' },
  { value: 'sonnet', label: 'Claude Sonnet' },
  { value: 'haiku', label: 'Claude Haiku' },
]

function TemplateForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<WorkflowTemplate>
  onSave: (data: Partial<WorkflowTemplate>) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [model, setModel] = useState(initial?.model ?? 'sonnet')
  const [taskPrompt, setTaskPrompt] = useState(initial?.task_prompt ?? '')
  const [agentRole, setAgentRole] = useState(initial?.agent_role ?? '')
  const [timeoutSeconds, setTimeoutSeconds] = useState(initial?.timeout_seconds ?? 300)
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(', '))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !taskPrompt.trim()) {
      setError('Name and task prompt are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({
        ...(initial?.id ? { id: initial.id } : {}),
        name: name.trim(),
        description: description.trim() || undefined,
        model,
        task_prompt: taskPrompt.trim(),
        agent_role: agentRole.trim() || undefined,
        timeout_seconds: timeoutSeconds,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="text-xs px-2 py-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Code Review"
            className="w-full h-8 px-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full h-8 px-2 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary"
          >
            {MODEL_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Description</label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Short description of what this workflow does"
          className="w-full h-8 px-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Task Prompt *</label>
        <textarea
          value={taskPrompt}
          onChange={e => setTaskPrompt(e.target.value)}
          placeholder="Describe exactly what the agent should do when this workflow runs..."
          rows={4}
          className="w-full px-2 py-1.5 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary resize-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Agent Role</label>
          <input
            value={agentRole}
            onChange={e => setAgentRole(e.target.value)}
            placeholder="e.g. reviewer, builder"
            className="w-full h-8 px-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Timeout (seconds)</label>
          <input
            type="number"
            value={timeoutSeconds}
            onChange={e => setTimeoutSeconds(Number(e.target.value))}
            min={30}
            max={3600}
            className="w-full h-8 px-2 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Tags (comma-separated)</label>
        <input
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="e.g. review, quality, automation"
          className="w-full h-8 px-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-3 rounded-md bg-secondary text-foreground text-xs hover:bg-secondary/80 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : initial?.id ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  )
}

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: WorkflowTemplate
  onEdit: (t: WorkflowTemplate) => void
  onDelete: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const modelBadgeColor: Record<string, string> = {
    opus: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    sonnet: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    haiku: 'bg-green-500/15 text-green-400 border-green-500/20',
  }

  return (
    <div className="rounded-lg border border-border bg-card hover:border-border/80 transition-colors">
      <div
        className="flex items-start gap-3 p-3 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary">
            <path d="M2 4h12M2 8h8M2 12h5" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{template.name}</span>
            <span className={`text-2xs px-1.5 py-0.5 rounded border ${modelBadgeColor[template.model] ?? 'bg-secondary text-muted-foreground border-border'}`}>
              {template.model}
            </span>
            {template.agent_role && (
              <span className="text-2xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                {template.agent_role}
              </span>
            )}
            {template.use_count > 0 && (
              <span className="text-2xs text-muted-foreground">{template.use_count}x used</span>
            )}
          </div>
          {template.description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{template.description}</p>
          )}
          {template.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {template.tags.map(tag => (
                <span key={tag} className="text-2xs px-1 py-0.5 rounded bg-secondary/60 text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onEdit(template) }}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Edit template"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M11.5 1.5l3 3-9 9H2.5v-3z" />
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(template.id) }}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete template"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-150 ${expanded ? '' : '-rotate-90'}`}
          >
            <polyline points="4,6 8,10 12,6" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50 mt-0 pt-2.5 space-y-2">
          <div className="space-y-1">
            <span className="text-2xs text-muted-foreground uppercase tracking-wider">Task Prompt</span>
            <p className="text-xs text-foreground bg-secondary/40 rounded-md p-2 whitespace-pre-wrap leading-relaxed">
              {template.task_prompt}
            </p>
          </div>
          <div className="flex items-center gap-4 text-2xs text-muted-foreground">
            <span>Timeout: {template.timeout_seconds}s</span>
            <span>Created by: {template.created_by}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function WorkflowBuilderPanel() {
  const [activeTab, setActiveTab] = useState<'templates' | 'pipelines'>('templates')
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden')
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/workflows')
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch {
      setError('Failed to load workflow templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  useEffect(() => {
    if (!result) return
    const t = setTimeout(() => setResult(null), 3000)
    return () => clearTimeout(t)
  }, [result])

  const handleSave = async (data: Partial<WorkflowTemplate>) => {
    const isEdit = !!data.id
    const res = await fetch('/api/workflows', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to save template')
    }
    setFormMode('hidden')
    setEditingTemplate(null)
    fetchTemplates()
    setResult({ ok: true, text: isEdit ? 'Template updated' : 'Template created' })
  }

  const handleDelete = async (id: number) => {
    const res = await fetch('/api/workflows', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      fetchTemplates()
      setResult({ ok: true, text: 'Template deleted' })
    } else {
      setResult({ ok: false, text: 'Failed to delete template' })
    }
  }

  const openEdit = (t: WorkflowTemplate) => {
    setEditingTemplate(t)
    setFormMode('edit')
  }

  const closeForm = () => {
    setFormMode('hidden')
    setEditingTemplate(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workflow Builder</h1>
            <p className="text-muted-foreground mt-2">
              Create reusable workflow templates and compose them into automated pipelines
            </p>
          </div>
          {activeTab === 'templates' && formMode === 'hidden' && (
            <button
              onClick={() => setFormMode('create')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              + New Template
            </button>
          )}
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 mt-4">
          {(['templates', 'pipelines'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab === 'templates' ? 'Workflow Templates' : 'Pipelines'}
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {result && (
        <div className={`text-xs px-3 py-2 rounded-md border ${
          result.ok
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {result.text}
        </div>
      )}

      {/* Templates tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Create/Edit form */}
          {formMode !== 'hidden' && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                {formMode === 'edit' ? 'Edit Template' : 'New Workflow Template'}
              </h2>
              <TemplateForm
                initial={editingTemplate ?? undefined}
                onSave={handleSave}
                onCancel={closeForm}
              />
            </div>
          )}

          {/* Template list */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <span className="ml-3 text-muted-foreground text-sm">Loading templates...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={fetchTemplates} className="mt-2 text-xs text-primary hover:underline">
                Retry
              </button>
            </div>
          ) : templates.length === 0 && formMode === 'hidden' ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M8 2v12M2 8h12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No workflow templates yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Create a template to define reusable tasks for your AI agents
              </p>
              <button
                onClick={() => setFormMode('create')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Create First Template
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
                <span>{templates.length} template{templates.length !== 1 ? 's' : ''}</span>
              </div>
              {templates.map(t => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pipelines tab */}
      {activeTab === 'pipelines' && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-foreground">Pipeline Composer</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chain workflow templates into multi-step automated pipelines
            </p>
          </div>
          <PipelineTab />
        </div>
      )}
    </div>
  )
}
