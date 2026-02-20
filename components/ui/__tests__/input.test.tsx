import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Textarea } from '../input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('border-2', 'border-foreground', 'bg-paper/50');
    });

    it('should apply custom className', () => {
      const { container } = render(<Input className="custom-input" />);
      expect(container.querySelector('input')).toHaveClass('custom-input');
    });
  });

  describe('Types', () => {
    it('should render text input by default', () => {
      render(<Input />);
      // When type is not specified, browsers don't set the type attribute (it defaults to text)
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      const { container } = render(<Input type="password" />);
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render number input', () => {
      render(<Input type="number" />);
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should accept placeholder prop', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should accept value prop', () => {
      render(<Input value="test value" readOnly />);
      expect(screen.getByRole('textbox')).toHaveValue('test value');
    });

    it('should accept disabled prop', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should accept required prop', () => {
      render(<Input required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('should accept maxLength prop', () => {
      render(<Input maxLength={10} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '10');
    });
  });

  describe('Interaction', () => {
    it('should handle onChange event', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle onFocus event', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should handle onBlur event', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalled();
    });

    it('should update value on input', () => {
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'test' } });
      expect(input.value).toBe('test');
    });
  });

  describe('Accessibility', () => {
    it('should have proper focus styles', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('focus-visible:outline-none');
    });

    it('should support aria-label', () => {
      render(<Input aria-label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(<Input aria-describedby="helper-text" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'helper-text');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('Textarea Component', () => {
  describe('Rendering', () => {
    it('should render textarea element', () => {
      render(<Textarea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('min-h-[80px]', 'border-2', 'border-foreground', 'bg-paper/50');
    });

    it('should apply custom className', () => {
      const { container } = render(<Textarea className="custom-textarea" />);
      expect(container.querySelector('textarea')).toHaveClass('custom-textarea');
    });
  });

  describe('Props', () => {
    it('should accept placeholder prop', () => {
      render(<Textarea placeholder="Enter description" />);
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('should accept rows prop', () => {
      render(<Textarea rows={5} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
    });

    it('should accept disabled prop', () => {
      render(<Textarea disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should accept value prop', () => {
      render(<Textarea value="test content" readOnly />);
      expect(screen.getByRole('textbox')).toHaveValue('test content');
    });
  });

  describe('Interaction', () => {
    it('should handle onChange event', () => {
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'new text' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value on input', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: 'multiline\ntext' } });
      expect(textarea.value).toBe('multiline\ntext');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Textarea aria-label="Description" />);
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should have proper focus styles', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('focus-visible:outline-none');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Textarea ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});
