"use client";

import Navbar from "@/components/navbar/page";
import Footer from "@/components/footer/page";
import { HiOutlineEnvelope, HiOutlinePhone, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

function Contact() {
  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Editorial Hero Banner */}
        <section className="bg-surface-container-low px-6 py-16 text-center sm:py-20">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <HiOutlineChatBubbleLeftRight className="h-6 w-6" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              We&apos;d Love to Hear From You
            </h1>
            <p className="mt-3 font-body text-base text-ink-muted">
              Have a question, feedback, or a recipe request? Drop us a line — we are always
              hungry for good conversation.
            </p>
          </div>
        </section>

        {/* Contact info cards */}
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl border border-linen-border bg-surface-container-lowest p-6 shadow-[var(--shadow-card)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary">
                <HiOutlinePhone className="h-6 w-6" />
              </div>
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Call Us
                </p>
                <a
                  href="tel:+2001004435342"
                  className="mt-1 block font-body text-lg font-bold text-ink hover:text-primary"
                >
                  01004435342
                </a>
                <p className="mt-1 font-body text-xs text-ink-muted">Mon-Fri 9am to 6pm EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-linen-border bg-surface-container-lowest p-6 shadow-[var(--shadow-card)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary">
                <HiOutlineEnvelope className="h-6 w-6" />
              </div>
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Email Us
                </p>
                <a
                  href="mailto:moahmedsoliman12571@gmail.com"
                  className="mt-1 block font-body text-sm font-bold text-ink hover:text-primary sm:text-base"
                >
                  moahmedsoliman12571@gmail.com
                </a>
                <p className="mt-1 font-body text-xs text-ink-muted">We reply within 24 hours</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

export default Contact;