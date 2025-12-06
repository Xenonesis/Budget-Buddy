import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render badge with text', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full');
    });

    it('should apply custom className', () => {
      const { container } = render(<Badge className="custom-badge">Badge</Badge>);
      expect(container.firstChild).toHaveClass('custom-badge');
    });

    it('should have proper text styles', () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass('text-xs', 'font-semibold');
    });

    it('should have padding and border radius', () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass('px-2.5', 'py-0.5', 'rounded-full');
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      const { container } = render(<Badge variant="default">Default</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should apply secondary variant styles', () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('should apply destructive variant styles', () => {
      const { container } = render(<Badge variant="destructive">Delete</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('should apply outline variant styles', () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('text-foreground');
      expect(badge).not.toHaveClass('border-transparent');
    });

    it('should have hover effects on variants', () => {
      const { container } = render(<Badge variant="default">Hover</Badge>);
      expect(container.firstChild).toHaveClass('hover:bg-primary/80');
    });
  });

  describe('Border and Transition', () => {
    it('should have border', () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass('border');
    });

    it('should have transition effects', () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.firstChild).toHaveClass('transition-colors');
    });

    it('should have focus ring styles', () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Content', () => {
    it('should render text content', () => {
      render(<Badge>Success</Badge>);
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should render with numbers', () => {
      render(<Badge>99+</Badge>);
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('should render with emoji', () => {
      render(<Badge>✅ Verified</Badge>);
      expect(screen.getByText('✅ Verified')).toBeInTheDocument();
    });

    it('should render children elements', () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Text</span>
        </Badge>
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Props and Attributes', () => {
    it('should accept data attributes', () => {
      render(<Badge data-testid="custom-badge">Badge</Badge>);
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });

    it('should accept aria attributes', () => {
      render(<Badge aria-label="Status badge">New</Badge>);
      expect(screen.getByLabelText('Status badge')).toBeInTheDocument();
    });

    it('should accept role attribute', () => {
      const { container } = render(<Badge role="status">Active</Badge>);
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work as status indicator', () => {
      render(<Badge variant="default">Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should work as count indicator', () => {
      render(<Badge variant="destructive">5</Badge>);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should work as label', () => {
      render(<Badge variant="secondary">Premium</Badge>);
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should work with multiple badges', () => {
      const { container } = render(
        <div>
          <Badge variant="default">New</Badge>
          <Badge variant="secondary">Featured</Badge>
          <Badge variant="destructive">Sale</Badge>
        </div>
      );
      expect(container.querySelectorAll('[class*="inline-flex"]')).toHaveLength(3);
    });
  });
});
