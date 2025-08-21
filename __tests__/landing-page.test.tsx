import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from '../components/landing/header';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '/',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      beforePopState: jest.fn(),
      prefetch: jest.fn()
    };
  }
}));

// Mock framer-motion
jest.mock('framer-motion', () => {
  return {
    motion: {
      header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
      a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
      svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
    },
    useScroll: () => ({
      scrollY: {
        on: jest.fn(),
        get: jest.fn(() => 0)
      }
    }),
    useTransform: () => ({
      on: jest.fn(),
      get: jest.fn(() => 0)
    }),
    useInView: () => true,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn()
    }),
    AnimatePresence: ({ children }: any) => <div>{children}</div>
  };
});

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe('Header Component', () => {
  it('renders without crashing', () => {
    render(<Header />);
    expect(screen.getByText('Budget Buddy')).toBeInTheDocument();
  });

  it('displays navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('displays sign in and sign up buttons', () => {
    render(<Header />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });
});