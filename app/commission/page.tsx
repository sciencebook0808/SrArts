'use client';

import { FloatingNavbar } from '@/components/floating-navbar';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const commissionSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  projectTitle: z.string().min(5, 'Project title is required'),
  description: z.string().min(20, 'Detailed description is required'),
  style: z.string().min(1, 'Please select an art style'),
  budget: z.string().min(1, 'Please select a budget range'),
  timeline: z.string().min(1, 'Please select a timeline'),
  attachments: z.string().optional(),
  terms: z.boolean().refine((v) => v === true, 'You must agree to terms'),
});

type CommissionFormData = z.infer<typeof commissionSchema>;

export default function CommissionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommissionFormData>({
    resolver: zodResolver(commissionSchema),
  });

  const onSubmit = async (data: CommissionFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitMessage({
        type: 'success',
        text: 'Commission request submitted! We will contact you within 24 hours.',
      });
      reset();
      setTimeout(() => setSubmitMessage(null), 5000);
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />

      {/* Header */}
      <section className="pt-32 pb-12 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Commission Your Art</h1>
          <p className="text-xl text-muted-foreground">
            Let's collaborate to bring your vision to life. Fill out the form below with your commission details.
          </p>
        </div>
      </section>

      {/* Commission Form */}
      <section className="px-4 md:px-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Contact Information</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  placeholder="Your name"
                  {...register('name')}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    {...register('phone')}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4 pt-6 border-t border-border">
              <h2 className="text-2xl font-bold">Project Details</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Project Title *</label>
                <input
                  type="text"
                  placeholder="Give your project a title"
                  {...register('projectTitle')}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.projectTitle && (
                  <p className="text-destructive text-sm mt-1">{errors.projectTitle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Detailed Description *</label>
                <textarea
                  placeholder="Describe your vision in detail. Include reference images, specific elements, mood, color preferences, etc."
                  {...register('description')}
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                {errors.description && (
                  <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Art Style *</label>
                  <select
                    {...register('style')}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a style</option>
                    <option value="anime">Anime</option>
                    <option value="realistic">Realistic</option>
                    <option value="modern">Modern</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.style && (
                    <p className="text-destructive text-sm mt-1">{errors.style.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Budget Range *</label>
                  <select
                    {...register('budget')}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select budget</option>
                    <option value="under-100">Under $100</option>
                    <option value="100-300">$100 - $300</option>
                    <option value="300-500">$300 - $500</option>
                    <option value="500-plus">$500+</option>
                  </select>
                  {errors.budget && (
                    <p className="text-destructive text-sm mt-1">{errors.budget.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timeline *</label>
                  <select
                    {...register('timeline')}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select timeline</option>
                    <option value="1-week">1 Week</option>
                    <option value="2-4-weeks">2-4 Weeks</option>
                    <option value="1-2-months">1-2 Months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                  {errors.timeline && (
                    <p className="text-destructive text-sm mt-1">{errors.timeline.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reference Materials (Optional)</label>
                <input
                  type="text"
                  placeholder="Link to reference images or materials"
                  {...register('attachments')}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register('terms')}
                  className="w-5 h-5 mt-1 rounded border-border cursor-pointer"
                />
                <label className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the commission terms and conditions. I understand that payment is required upfront and the artist reserves the right to modify the final artwork based on feedback.
                </label>
              </div>
              {errors.terms && (
                <p className="text-destructive text-sm">{errors.terms.message}</p>
              )}
            </div>

            {/* Messages */}
            {submitMessage && (
              <div
                className={`p-4 rounded-lg text-sm ${
                  submitMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {submitMessage.text}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-base bg-primary text-white py-3 rounded-lg hover:bg-primary-light font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit Commission Request'}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              We'll review your request and contact you within 24 hours.
            </p>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 md:px-8 py-16 bg-accent-subtle/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Commission FAQs</h2>
          <div className="space-y-6">
            {[
              {
                q: 'How long does a commission take?',
                a: 'Most commissions take 2-4 weeks depending on complexity. Rush orders are available for an additional fee.',
              },
              {
                q: 'What is your revision policy?',
                a: 'We include 2 rounds of revisions. Additional revisions can be requested for a small fee.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Refunds are available if the work has not started. Once work begins, no refunds are provided.',
              },
              {
                q: 'Can I use the artwork commercially?',
                a: 'Usage rights depend on the commission package selected. Contact us to discuss your specific needs.',
              },
            ].map((item, i) => (
              <div key={i} className="card-base p-6">
                <h3 className="font-bold text-lg mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 SR Arts. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
