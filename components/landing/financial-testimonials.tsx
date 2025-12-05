'use client';

import { memo } from 'react';
import TestimonialSlider from '@/components/ui/testimonial-slider';
import { FINANCIAL_TESTIMONIALS } from './config/testimonials-data';

export const FinancialTestimonials = memo(function FinancialTestimonials() {
  return (
    <TestimonialSlider
      testimonials={FINANCIAL_TESTIMONIALS}
      title="Success Stories"
      subtitle="Real Results from Real Users"
      className="bg-gradient-to-b from-background via-muted/10 to-background"
    />
  );
});
