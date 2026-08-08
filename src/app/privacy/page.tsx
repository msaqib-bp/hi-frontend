import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & contact",
  description:
    "What Smart Civic Services stores when you report a civic problem, and how to reach the service.",
};

/**
 * A plain statement of what the system holds, written from what the code actually does:
 * `POST /complaints` accepts a description, a location and two optional contact fields,
 * and the classifier runs on the description alone.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy &amp; contact
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        What the service stores, what it does with it, and how to reach it.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">What is collected</h2>
          <p className="mt-3">
            A complaint has two required fields — a description of the problem and a
            location — and two optional ones, your name and an email address or phone
            number. Nothing else is requested and no account is created. Leaving the
            optional fields blank does not affect how the complaint is handled; it only
            means there is no way to send you an update directly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            What the AI sees
          </h2>
          <p className="mt-3">
            The classifier reads the description in order to predict a service category
            and a priority, and to write a short summary for the crew. It does not use
            your name or contact details, and there is no camera, sensor or location
            tracking anywhere in the system — the location is the text you typed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Who can see it</h2>
          <p className="mt-3">
            Complaint records are visible to municipal staff signed in to the service
            dashboard. The public analytics on this site are aggregate counts only — no
            individual complaint, name or contact detail is exposed by them. Your
            reference code is what lets you look up your own complaint without signing
            in, so treat it as private.
          </p>
        </section>

        <section id="contact">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-3">
            The fastest way to reach the service about a civic problem is to{" "}
            <Link href="/#report" className="font-medium text-brand hover:underline">
              file a report
            </Link>
            {" "}— it goes straight into the queue that staff work from, and you get a
            reference code back. To check on something you have already reported, use{" "}
            <Link href="/track" className="font-medium text-brand hover:underline">
              complaint tracking
            </Link>
            .
          </p>
          <p className="mt-3">
            Smart Civic Services is a demonstration platform. It is not an emergency
            service: if there is an immediate danger to life or property, call your local
            emergency number instead of filing a complaint here.
          </p>
        </section>
      </div>
    </div>
  );
}
