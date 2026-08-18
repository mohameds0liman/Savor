"use client";

import { FormEvent, useState } from "react";
import Navbar from "@/components/navbar/page";

function Contact() {

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden bg-orange-400 px-6 pb-16 pt-12 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-7 w-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0l-7.5-4.615A2.25 2.25 0 0 1 2.25 6.993V6.75"
            />
          </svg>
        </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                    We'd Love to Hear From You!
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-orange-50 md:text-base">
                    Have a question, feedback, or a recipe request?
                    <br/>
                    Drop us a line. We're always hungry for good conversation.
                </p>
            </div>
            
        </section>



        
        {/* Section 2 of contact methods */}
        <section className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 px-6 py-8 text-center sm:flex-row sm:gap-10">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-400">
            ☎
            </div>

            <div className="text-left">
            <p className="text-xs font-medium text-gray-500">Call Us</p>
            <a
                href="tel:+15551234567"
                className="text-sm font-semibold text-gray-900 hover:text-orange-400"
            >
                (555) 123-4567
            </a>
            </div>
        </div>

        <div className="hidden h-10 w-px bg-gray-200 sm:block" />

        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-400">
            ✉
            </div>

            <div className="text-left">
            <p className="text-xs font-medium text-gray-500">Email Us</p>
            <a
                href="mailto:hello@zestsavory.com"
                className="text-sm font-semibold text-gray-900 hover:text-orange-400"
            >
                hello@zestsavory.com
            </a>
            </div>
        </div>
        </section>
      </div>
    </main>
  );
}

export default Contact;