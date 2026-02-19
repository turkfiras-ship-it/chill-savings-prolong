export type ElementType =
  | 'text'
  | 'heading'
  | 'image'
  | 'button'
  | 'card'
  | 'chart'
  | 'divider'
  | 'spacer'
  | 'section'
  | 'container';

export interface ElementStyle {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  backgroundColor?: string;
  borderRadius?: string;
  border?: string;
  borderColor?: string;
  borderWidth?: string;
  width?: string;
  height?: string;
  minHeight?: string;
  gap?: string;
  flexDirection?: 'row' | 'column';
  alignItems?: string;
  justifyContent?: string;
  opacity?: string;
  boxShadow?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  lineHeight?: string;
  letterSpacing?: string;
  fontFamily?: string;
}

export interface PageElement {
  id: string;
  type: ElementType;
  content?: string;
  src?: string;
  alt?: string;
  href?: string;
  placeholder?: string;
  style: ElementStyle;
  children?: PageElement[];
}

export interface PageLayout {
  id?: string;
  name: string;
  elements: PageElement[];
  status: 'draft' | 'published';
}

export const ELEMENT_LIBRARY: { type: ElementType; label: string; icon: string; defaultProps: Partial<PageElement> }[] = [
  {
    type: 'heading',
    label: 'Heading',
    icon: 'H',
    defaultProps: {
      content: 'Your Heading Here',
      style: { fontSize: '32px', fontWeight: '700', color: '#111827', padding: '8px 0' },
    },
  },
  {
    type: 'text',
    label: 'Text',
    icon: 'T',
    defaultProps: {
      content: 'Add your paragraph text here. Click to edit.',
      style: { fontSize: '16px', color: '#374151', lineHeight: '1.6', padding: '4px 0' },
    },
  },
  {
    type: 'image',
    label: 'Image',
    icon: '🖼',
    defaultProps: {
      src: 'https://placehold.co/600x300',
      alt: 'Image',
      style: { width: '100%', borderRadius: '8px' },
    },
  },
  {
    type: 'button',
    label: 'Button',
    icon: '⬜',
    defaultProps: {
      content: 'Click Me',
      href: '#',
      style: {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        padding: '10px 24px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '14px',
        width: 'fit-content',
      },
    },
  },
  {
    type: 'card',
    label: 'Card',
    icon: '🃏',
    defaultProps: {
      content: 'Card content goes here',
      style: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        minHeight: '120px',
      },
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: '—',
    defaultProps: {
      style: {
        borderColor: '#e5e7eb',
        borderWidth: '1px',
        margin: '16px 0',
        width: '100%',
      },
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: '↕',
    defaultProps: {
      style: { height: '48px', width: '100%' },
    },
  },
  {
    type: 'section',
    label: 'Section',
    icon: '▭',
    defaultProps: {
      style: {
        backgroundColor: '#f9fafb',
        padding: '48px 24px',
        width: '100%',
        minHeight: '200px',
      },
      children: [],
    },
  },
  {
    type: 'container',
    label: 'Container',
    icon: '⬚',
    defaultProps: {
      style: {
        padding: '16px',
        width: '100%',
        minHeight: '80px',
        border: '1px dashed #d1d5db',
        borderRadius: '8px',
      },
      children: [],
    },
  },
];
