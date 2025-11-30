import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: {
    regular: string;
    gradient: string;
  };
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  bottomImage?: {
    light: string;
    dark: string;
  };
  gridOptions?: {
    angle?: number;
    cellSize?: number;
    opacity?: number;
    lightLineColor?: string;
    darkLineColor?: string;
  };
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = 'gray',
  darkLineColor = 'gray',
}) => {
  const gridStyles = {
    '--grid-angle': `${angle}deg`,
    '--cell-size': `${cellSize}px`,
    '--opacity': opacity,
    '--light-line': lightLineColor,
    '--dark-line': darkLineColor,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        'pointer-events-none absolute size-full overflow-hidden [perspective:200px]',
        `opacity-[var(--opacity)]`
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))] overflow-hidden">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  );
};

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = 'Build products for everyone',
      subtitle = {
        regular: 'Designing your projects faster with ',
        gradient: 'the largest figma UI kit.',
      },
      description = 'Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.',
      ctaText = 'Browse courses',
      ctaHref = '#',
      bottomImage = {
        light: '/dashboard.png',
        dark: '/dashboard.png',
      },
      gridOptions,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn('relative min-h-screen flex items-center overflow-x-hidden', className)}
        ref={ref}
        {...props}
      >
        {/* Enhanced background with multiple layers */}
        <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/10 dark:bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        {/* Floating orbs for visual interest */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />

        <section className="relative max-w-full mx-auto z-1 w-full">
          <RetroGrid {...gridOptions} />
          <div className="max-w-screen-xl z-10 mx-auto px-4 py-12 sm:py-16 md:py-28 gap-8 md:gap-12 md:px-8">
            <div className="space-y-6 sm:space-y-8 max-w-4xl leading-0 lg:leading-5 mx-auto text-center">
              {/* Enhanced badge with better animation */}
              <div className="animate-fade-in-up">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 group font-geist mx-auto px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[1px] md:border-[2px] border-black/5 dark:border-white/5 rounded-2xl md:rounded-3xl w-fit hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  {title}
                  <ChevronRight className="inline w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 duration-300" />
                </div>
              </div>

              {/* Enhanced main heading with better typography */}
              <div className="animate-fade-in-up stagger-1">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tighter font-geist bg-clip-text text-transparent mx-auto bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] leading-tight">
                  <span className="block sm:inline">{subtitle.regular}</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-500 to-pink-500 dark:from-purple-300 dark:via-violet-300 dark:to-orange-200 block sm:inline relative">
                    {subtitle.gradient}
                    {/* Subtle underline animation */}
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200 rounded-full opacity-30 animate-pulse" />
                  </span>
                </h2>
              </div>

              {/* Enhanced description with better spacing */}
              <div className="animate-fade-in-up stagger-2">
                <p className="text-base sm:text-lg md:text-xl max-w-2xl sm:max-w-3xl mx-auto text-gray-600 dark:text-gray-300 px-2 sm:px-0 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Enhanced CTA with multiple options */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 sm:pt-6 animate-fade-in-up stagger-3">
                {/* Primary CTA */}
                <span className="relative inline-block overflow-hidden rounded-full p-[2px] group">
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] group-hover:animate-[spin_1s_linear_infinite]" />
                  <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-gray-950 text-xs font-medium backdrop-blur-3xl">
                    <a
                      href={ctaHref}
                      className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent dark:hover:from-zinc-300/10 dark:hover:via-purple-400/30 transition-all duration-300 py-4 px-8 sm:px-10 text-base font-semibold hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
                    >
                      {ctaText}
                      <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </div>
                </span>

                {/* Secondary CTA */}
                <a
                  href="/demo"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 group"
                >
                  Watch Demo
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 11-6 0V4"
                    />
                  </svg>
                </a>
              </div>

              {/* Trust indicators */}
              <div className="animate-fade-in-up stagger-4 pt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Trusted by 50,000+ users worldwide
                </p>
                <div className="flex items-center justify-center gap-8 opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <div className="text-xs font-medium">⭐ 4.9/5 Rating</div>
                  <div className="text-xs font-medium">🔒 Bank-Level Security</div>
                  <div className="text-xs font-medium">📱 Mobile First</div>
                </div>
              </div>
            </div>

            {/* Enhanced image section with better presentation */}
            {bottomImage && (
              <div className="mt-16 sm:mt-20 md:mt-28 lg:mt-36 mx-2 sm:mx-4 md:mx-10 relative z-10 animate-fade-in-up stagger-5">
                <div className="relative group">
                  {/* Glow effect behind image */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <Image
                      src={bottomImage.light}
                      className="w-full shadow-2xl rounded-xl border border-gray-200 dark:hidden transition-transform duration-500 group-hover:scale-[1.02]"
                      alt="Dashboard preview"
                      width={1200}
                      height={600}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                      quality={85}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k="
                    />
                    <Image
                      src={bottomImage.dark}
                      className="hidden w-full shadow-2xl rounded-xl border border-gray-800 dark:block transition-transform duration-500 group-hover:scale-[1.02]"
                      alt="Dashboard preview"
                      width={1200}
                      height={600}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                      quality={85}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k="
                    />

                    {/* Floating UI elements for visual interest */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
                      ✓
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                      AI
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }
);
HeroSection.displayName = 'HeroSection';

export { HeroSection };
