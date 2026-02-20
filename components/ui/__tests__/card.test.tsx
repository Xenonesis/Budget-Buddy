import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card component', () => {
      const { container } = render(<Card>Card content</Card>);
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('border-2', 'border-foreground', 'bg-card');
    });

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>);
      expect(container.firstChild).toHaveClass('custom-card');
    });

    it('should render children', () => {
      render(<Card>Test content</Card>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should apply shadow styles', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild).toHaveClass('shadow-[4px_4px_0px_hsl(var(--foreground))]');
    });

    it('should have hover effect', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild).toHaveClass('hover:shadow-[8px_8px_0px_hsl(var(--foreground))]');
    });
  });

  describe('CardHeader', () => {
    it('should render card header', () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('should apply custom className', () => {
      const { container } = render(<CardHeader className="custom-header">Header</CardHeader>);
      expect(container.firstChild).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('should render as h3 element', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H3');
    });

    it('should apply title styles', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      expect(container.firstChild).toHaveClass('font-semibold', 'leading-tight');
    });

    it('should apply responsive text size', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      expect(container.firstChild).toHaveClass('text-xl', 'sm:text-2xl');
    });

    it('should apply custom className', () => {
      const { container } = render(<CardTitle className="custom-title">Title</CardTitle>);
      expect(container.firstChild).toHaveClass('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('should render as paragraph element', () => {
      render(<CardDescription>Description</CardDescription>);
      const desc = screen.getByText('Description');
      expect(desc.tagName).toBe('P');
    });

    it('should apply description styles', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      expect(container.firstChild).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CardDescription className="custom-desc">Description</CardDescription>
      );
      expect(container.firstChild).toHaveClass('custom-desc');
    });
  });

  describe('CardContent', () => {
    it('should render card content', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('p-6', 'pt-0');
    });

    it('should apply custom className', () => {
      const { container } = render(<CardContent className="custom-content">Content</CardContent>);
      expect(container.firstChild).toHaveClass('custom-content');
    });
  });

  describe('CardFooter', () => {
    it('should render card footer', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('should apply custom className', () => {
      const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
      expect(container.firstChild).toHaveClass('custom-footer');
    });
  });

  describe('Complete Card Structure', () => {
    it('should render complete card with all parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('should maintain proper structure and styling', () => {
      const { container } = render(
        <Card className="test-card">
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(container.querySelector('.test-card')).toBeInTheDocument();
    });
  });
});
