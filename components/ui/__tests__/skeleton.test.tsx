import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton Component', () => {
  describe('Rendering', () => {
    it('should render skeleton element', () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-md', 'bg-muted', 'fast-skeleton');
    });

    it('should apply custom className', () => {
      const { container } = render(<Skeleton className="custom-skeleton" />);
      expect(container.firstChild).toHaveClass('custom-skeleton');
    });

    it('should render as div element', () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });
  });

  describe('Custom Sizes', () => {
    it('should accept width and height', () => {
      const { container } = render(<Skeleton className="w-20 h-20" />);
      expect(container.firstChild).toHaveClass('w-20', 'h-20');
    });

    it('should work with custom dimensions', () => {
      const { container } = render(<Skeleton style={{ width: '100px', height: '50px' }} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.style.width).toBe('100px');
      expect(skeleton.style.height).toBe('50px');
    });

    it('should support full width', () => {
      const { container } = render(<Skeleton className="w-full" />);
      expect(container.firstChild).toHaveClass('w-full');
    });
  });

  describe('Shapes', () => {
    it('should support circle shape', () => {
      const { container } = render(<Skeleton className="rounded-full w-12 h-12" />);
      expect(container.firstChild).toHaveClass('rounded-full');
    });

    it('should support rectangle shape', () => {
      const { container } = render(<Skeleton className="rounded-none" />);
      expect(container.firstChild).toHaveClass('rounded-none');
    });

    it('should support custom border radius', () => {
      const { container } = render(<Skeleton className="rounded-lg" />);
      expect(container.firstChild).toHaveClass('rounded-lg');
    });
  });

  describe('Use Cases', () => {
    it('should work as avatar skeleton', () => {
      const { container } = render(<Skeleton className="rounded-full w-10 h-10" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-full', 'w-10', 'h-10');
    });

    it('should work as text skeleton', () => {
      const { container } = render(<Skeleton className="h-4 w-full" />);
      expect(container.firstChild).toHaveClass('h-4', 'w-full');
    });

    it('should work as card skeleton', () => {
      const { container } = render(<Skeleton className="h-24 w-full rounded-lg" />);
      expect(container.firstChild).toHaveClass('h-24', 'w-full', 'rounded-lg');
    });

    it('should support multiple skeletons', () => {
      const { container } = render(
        <div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
      expect(container.querySelectorAll('.fast-skeleton')).toHaveLength(3);
    });
  });

  describe('Props', () => {
    it('should accept data attributes', () => {
      const { container } = render(<Skeleton data-testid="skeleton" />);
      expect(container.querySelector('[data-testid="skeleton"]')).toBeInTheDocument();
    });

    it('should spread props correctly', () => {
      const { container } = render(<Skeleton id="test-skeleton" />);
      expect(container.querySelector('#test-skeleton')).toBeInTheDocument();
    });
  });
});
