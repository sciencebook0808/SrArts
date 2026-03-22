'use client';
import { FloatingNavbar } from '@/components/floating-navbar';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Valid phone required'),
  projectTitle: z.string().min(5, 'Project title required'),
  description: z.string().min(20, 'Please describe in detail'),
  style: z.string().min(1, 'Please select a style'),
  budget: z.string().min(1, 'Please select a budget'),
  timeline: z.string().min(1, 'Please select a timeline'),
  terms: z.boolean().refine(v => v === true, 'You must agree to the terms'),
});
type FormData = z.infer<typeof schema>;

const STYLES = ['Anime / Manga', 'Realistic Portrait', 'Digital Painting', 'Abstract / Modern', 'Chibi / Kawaii', 'Other'];
const BUDGETS = ['$50 – $100', '$100 – $250', '$250 – $500', '$500 – $1,000', '$1,000+'];
const TIMELINES = ['1 week', '2 weeks', '1 month', 'Flexible'];

export default function CommissionPage() {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/commissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: data.name, userEmail: data.email, userPhone: data.phone, projectTitle: data.projectTitle, description: data.description, style: data.style, budget: data.budget, timeline: data.timeline }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setDone(true); reset();
    } catch { alert('Failed to submit. Please try again.'); }
  };

  const inp = (err?: boolean) => `w-full px-4 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 transition-colors ${err ? 'border-red-400 focus:ring-red-200' : 'border-border focus:ring-primary/30'}`;

  return (
    <main className="w-full min-h-screen bg-white">
      <FloatingNavbar />
      <section className="pt-28 md:pt-32 pb-12 px-4 md:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Commission Artwork</h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">Let's bring your vision to life. Fill in the form and we'll respond within 24 hours.</p>
        </div>
      </section>
      <section className="pb-24 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold">Request Submitted!</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">We've received your commission request and will contact you within 24 hours.</p>
                <button onClick={() => setDone(false)} className="mt-4 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-colors">Submit Another</button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="font-bold text-base">Your Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium block mb-1.5">Full Name *</label><input {...register('name')} placeholder="Jane Doe" className={inp(!!errors.name)} />{errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}</div>
                    <div><label className="text-sm font-medium block mb-1.5">Email *</label><input {...register('email')} type="email" placeholder="you@example.com" className={inp(!!errors.email)} />{errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}</div>
                  </div>
                  <div><label className="text-sm font-medium block mb-1.5">Phone *</label><input {...register('phone')} type="tel" placeholder="+1 234 567 8900" className={inp(!!errors.phone)} />{errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}</div>
                </div>
                <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="font-bold text-base">Project Details</h2>
                  <div><label className="text-sm font-medium block mb-1.5">Project Title *</label><input {...register('projectTitle')} placeholder="e.g. Portrait of my character Aira" className={inp(!!errors.projectTitle)} />{errors.projectTitle && <p className="text-xs text-red-500 mt-1">{errors.projectTitle.message}</p>}</div>
                  <div><label className="text-sm font-medium block mb-1.5">Description *</label><textarea {...register('description')} rows={5} placeholder="Describe your project in detail…" className={`${inp(!!errors.description)} resize-none`} />{errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}</div>
                  <div><label className="text-sm font-medium block mb-1.5">Art Style *</label><select {...register('style')} className={inp(!!errors.style)}><option value="">Select a style…</option>{STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>{errors.style && <p className="text-xs text-red-500 mt-1">{errors.style.message}</p>}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium block mb-1.5">Budget *</label><select {...register('budget')} className={inp(!!errors.budget)}><option value="">Select budget…</option>{BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}</select>{errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget.message}</p>}</div>
                    <div><label className="text-sm font-medium block mb-1.5">Timeline *</label><select {...register('timeline')} className={inp(!!errors.timeline)}><option value="">Select timeline…</option>{TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}</select>{errors.timeline && <p className="text-xs text-red-500 mt-1">{errors.timeline.message}</p>}</div>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" {...register('terms')} className="w-4 h-4 rounded accent-primary mt-0.5" />
                  <span className="text-sm text-muted-foreground">I agree to the commission terms — a 50% deposit is required to begin, the remainder due on completion.{errors.terms && <span className="block text-red-500 mt-1">{errors.terms.message}</span>}</span>
                </label>
                <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-light disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-md">
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}{isSubmitting ? 'Submitting…' : 'Submit Commission Request'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
      <footer className="py-10 px-4 md:px-8 border-t border-border bg-accent-subtle/20">
        <div className="max-w-6xl mx-auto text-center"><p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SR Arts. All rights reserved.</p></div>
      </footer>
    </main>
  );
}
