import type { Meta, StoryObj } from '@storybook/react'

function Swatch({ name, variable }: { name: string; variable: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-md border border-border shadow-sm flex-shrink-0"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <div>
        <p className="text-sm font-medium text-heading">{name}</p>
        <p className="font-mono text-xs text-muted">{variable}</p>
      </div>
    </div>
  )
}

function ColorSection({ title, swatches }: { title: string; swatches: { name: string; variable: string }[] }) {
  return (
    <section className="mb-10">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {swatches.map((s) => <Swatch key={s.variable} {...s} />)}
      </div>
    </section>
  )
}

function ThemeShowcase() {
  return (
    <div className="p-8 bg-bg min-h-screen">
      <h1 className="mb-1 text-2xl font-bold text-heading">Design Tokens</h1>
      <p className="mb-10 text-secondary">Defined in <code className="font-mono text-xs bg-bg px-1.5 py-0.5 rounded-sm border border-border">src/index.css</code> — override by changing CSS variables in <code className="font-mono text-xs">@theme</code></p>

      <ColorSection
        title="Layout"
        swatches={[
          { name: 'bg',      variable: '--color-bg' },
          { name: 'surface', variable: '--color-surface' },
          { name: 'border',  variable: '--color-border' },
        ]}
      />

      <ColorSection
        title="Brand"
        swatches={[
          { name: 'primary',        variable: '--color-primary' },
          { name: 'primary-hover',  variable: '--color-primary-hover' },
          { name: 'primary-subtle', variable: '--color-primary-subtle' },
        ]}
      />

      <ColorSection
        title="Text"
        swatches={[
          { name: 'heading',   variable: '--color-heading' },
          { name: 'secondary', variable: '--color-secondary' },
          { name: 'muted',     variable: '--color-muted' },
        ]}
      />

      <ColorSection
        title="Success"
        swatches={[
          { name: 'success',        variable: '--color-success' },
          { name: 'success-subtle', variable: '--color-success-subtle' },
          { name: 'success-text',   variable: '--color-success-text' },
        ]}
      />

      <ColorSection
        title="Warning"
        swatches={[
          { name: 'warning',        variable: '--color-warning' },
          { name: 'warning-subtle', variable: '--color-warning-subtle' },
          { name: 'warning-text',   variable: '--color-warning-text' },
        ]}
      />

      <ColorSection
        title="Danger"
        swatches={[
          { name: 'danger',        variable: '--color-danger' },
          { name: 'danger-subtle', variable: '--color-danger-subtle' },
          { name: 'danger-text',   variable: '--color-danger-text' },
        ]}
      />

      <section className="mb-10">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Shadows</h3>
        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-40 rounded-card bg-surface shadow-card" />
            <p className="font-mono text-xs text-muted">shadow-card</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-40 rounded-card bg-surface shadow-dropdown" />
            <p className="font-mono text-xs text-muted">shadow-dropdown</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Border Radius</h3>
        <div className="flex gap-8">
          {[
            { label: 'rounded-sm\n8px',   cls: 'rounded-sm' },
            { label: 'rounded-md\n12px',  cls: 'rounded-md' },
            { label: 'rounded-card\n16px', cls: 'rounded-card' },
            { label: 'rounded-full',      cls: 'rounded-full' },
          ].map(({ label, cls }) => (
            <div key={cls} className="flex flex-col items-center gap-3">
              <div className={`h-16 w-16 bg-primary-subtle border-2 border-primary ${cls}`} />
              <p className="font-mono text-xs text-muted text-center whitespace-pre">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const meta: Meta = {
  title: 'Design System/Theme',
  component: ThemeShowcase,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof meta>
export const Tokens: Story = {}
