import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render button with custom className', () => {
      const { container } = render(<Button className="custom-class">Test</Button>);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      const { container } = render(<Button variant="default">Default</Button>);
      expect(container.firstChild).toHaveClass('bg-primary');
    });

    it('should apply destructive variant styles', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>);
      expect(container.firstChild).toHaveClass('bg-destructive');
    });

    it('should apply outline variant styles', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      expect(container.firstChild).toHaveClass('border-2', 'bg-background');
    });

    it('should apply secondary variant styles', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      expect(container.firstChild).toHaveClass('bg-secondary');
    });

    it('should apply ghost variant styles', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      expect(container.firstChild).toHaveClass('hover:bg-accent');
    });

    it('should apply link variant styles', () => {
      const { container } = render(<Button variant="link">Link</Button>);
      expect(container.firstChild).toHaveClass('underline-offset-4');
    });

    it('should apply success variant styles', () => {
      const { container } = render(<Button variant="success">Success</Button>);
      expect(container.firstChild).toHaveClass('bg-[hsl(var(--success))]');
    });

    it('should apply warning variant styles', () => {
      const { container } = render(<Button variant="warning">Warning</Button>);
      expect(container.firstChild).toHaveClass('bg-[hsl(var(--warning))]');
    });
  });

  describe('Sizes', () => {
    it('should apply default size styles', () => {
      const { container } = render(<Button size="default">Default Size</Button>);
      expect(container.firstChild).toHaveClass('h-10', 'px-4');
    });

    it('should apply small size styles', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      expect(container.firstChild).toHaveClass('h-9', 'px-3');
    });

    it('should apply large size styles', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      expect(container.firstChild).toHaveClass('h-11', 'px-8');
    });

    it('should apply xl size styles', () => {
      const { container } = render(<Button size="xl">Extra Large</Button>);
      expect(container.firstChild).toHaveClass('h-12', 'px-10');
    });

    it('should apply icon size styles', () => {
      const { container } = render(<Button size="icon">X</Button>);
      expect(container.firstChild).toHaveClass('h-10', 'w-10');
    });
  });

  describe('Interaction', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should apply disabled styles', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      expect(container.firstChild).toHaveClass('disabled:opacity-50');
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct button role', () => {
      render(<Button>Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('should support aria-disabled', () => {
      render(<Button aria-disabled="true">Button</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should be keyboard accessible', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Props', () => {
    it('should accept and apply type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should accept and apply custom attributes', () => {
      render(<Button data-testid="custom-button">Button</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });
});
