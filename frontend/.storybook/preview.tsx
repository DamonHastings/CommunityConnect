import type { Preview } from '@storybook/react'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app',     value: '#F4F5F7' },
        { name: 'surface', value: '#FFFFFF' },
        { name: 'dark',    value: '#1B1D2E' },
      ],
    },
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-heading)' }}>
        <Story />
      </div>
    ),
  ],
}

export default preview
