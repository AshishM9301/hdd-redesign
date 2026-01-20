export type FAQSection = {
  id: string;
  title: string;
  slug: string;
  questions: FAQItem[];
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string; // Can include HTML/markdown for formatting
  tags?: string[]; // For search functionality
};

export const faqSections: FAQSection[] = [
  {
    id: "listing-equipment",
    title: "LISTING YOUR EQUIPMENT",
    slug: "listing-equipment",
    questions: [
      {
        id: "how-to-list",
        question: "How do I list my equipment?",
        answer: "To list your equipment, click on the 'LIST ONLINE' button on the Sell page. You'll be guided through a step-by-step process where you'll provide details about your equipment, upload photos, and set your asking price.",
        tags: ["list", "equipment", "how", "process"],
      },
      {
        id: "listing-cost",
        question: "How much does it cost to list my equipment?",
        answer: "Listing your equipment on our platform is completely free! We add a commission on top of your asking price - this is the price that will appear on the website. You don't pay any fees to sell your equipment with us.",
        tags: ["cost", "price", "fee", "free", "commission"],
      },
      {
        id: "contract-signing",
        question: "Do I have to sign a contract? What if I sell the equipment on my own?",
        answer: "No contract is required to list your equipment. You maintain full control and can sell your equipment independently at any time. If you sell it elsewhere, simply notify us to remove the listing.",
        tags: ["contract", "agreement", "sell", "independent"],
      },
      {
        id: "listing-timeframe",
        question: "Ok, I've listed my equipment. How long until it's on your website?",
        answer: "Please allow up to one business day to process your listing. You will receive a confirmation email when it has been processed and is live on our website.",
        tags: ["time", "process", "approval", "live", "website"],
      },
      {
        id: "update-listing",
        question: "I have changes/more information to add to my listings, how do I do that?",
        answer: "You can update your listing by logging into your account and accessing the 'My Listings' section. From there, you can edit details, add photos, update pricing, or modify any information about your equipment.",
        tags: ["update", "edit", "change", "modify", "information"],
      },
    ],
  },
  {
    id: "how-we-sell",
    title: "HOW WE SELL YOUR EQUIPMENT",
    slug: "how-we-sell",
    questions: [
      {
        id: "advertising-locations",
        question: "Where do you advertise my equipment?",
        answer: "We advertise your equipment on our main website, through our email marketing campaigns to our subscriber base, on relevant industry platforms, and through our network of dealers and buyers. We also optimize listings for search engines to maximize visibility.",
        tags: ["advertise", "marketing", "website", "visibility", "promotion"],
      },
      {
        id: "interest-process",
        question: "What happens when someone is interested in my equipment?",
        answer: "When a potential buyer shows interest, we'll forward their contact information to you. You'll receive an email notification with the buyer's details, and you can then contact them directly to discuss the sale, arrange inspections, and finalize the transaction.",
        tags: ["interest", "buyer", "contact", "notification", "sale"],
      },
      {
        id: "hdd-broker-buy",
        question: "Does HDD Broker buy equipment?",
        answer: "HDD Broker primarily acts as a marketplace connecting sellers with buyers. We don't typically purchase equipment directly, but we do facilitate trade-ins and can connect you with dealers who may be interested in purchasing your equipment outright.",
        tags: ["buy", "purchase", "trade-in", "dealer", "direct"],
      },
    ],
  },
];

