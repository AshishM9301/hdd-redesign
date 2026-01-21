import React from "react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const infoCheckItems = [
  {
    title: "COMPLETE DESCRIPTION",
    description:
      "Details year, make, model, hours, parts, tooling, and pipe. See our Listing Guide.",
  },
  {
    title: "DETAILED PHOTOS",
    description:
      "At least 10 high-resolution photos. See our Tips for Taking Photos.",
  },
  {
    title: "VIDEOS",
    description: "Footage of equipment operating basic functions.",
  },
  {
    title: "COMPLETE SERIAL NUMBERS",
    description:
      "Required for all components, but NOT displayed on the website.",
  },
  {
    title: "INSPECTION REPORTS",
    description: "Carried out by a qualified mechanic.",
  },
  {
    title: "LIEN DISCLOSURES",
    description: 'Fill out and sign "Ownership Statement document".',
  },
  {
    title: "TITLES",
    description: "Supply digital or faxed copy for road-worthy vehicles.",
  },
  {
    title: "SERVICE HISTORY",
    description: "Submit detailed records for at least six months.",
  },
];

export default function InfoCheckSection() {
  return (
    <div>
      <h2 className="text-foreground mb-6 text-3xl font-bold">INFO CHECK</h2>
      <p className="text-muted-foreground mb-6 text-lg">
        Info Check helps you provide the information buyers want. Listings with
        &quot;Info Checked&quot; appear first on our website. Check out a{" "}
        <Link href="/sell/listing-sample" className="text-primary hover:text-primary/80 underline">
          sample listing
        </Link>{" "}
        for an example.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {infoCheckItems.map((item) => (
          <div
            key={item.title}
            className="bg-card flex gap-4 rounded-lg border p-4"
          >
            <div className="shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground mb-2 font-semibold">
                {item.title}:
              </h3>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground mt-6">
        Check out our{" "}
        <Link href="#" className="text-primary hover:text-primary/80 underline">
          Info Check frequently asked questions
        </Link>{" "}
        for more information.
      </p>
    </div>
  );
}
