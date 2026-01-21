"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Factory,
  Tag,
  Scale,
  Hash,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  Lightbulb,
  FileText,
  Image,
  Upload,
  Eye,
  ChevronRight,
  ChevronDown,
  MailCheck,
  Handshake,
  Truck,
  DollarSign,
  FileCheck,
  RefreshCw,
  AlertOctagon,
  MessageCircle,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Tip type definition
export type TipType = "pro" | "warning" | "info";

export interface Tip {
  type: TipType;
  title: string;
  content: string;
}

export interface GuideField {
  name: string;
  required: boolean;
  description: string;
  placeholder: string;
  tip: string;
}

export interface PhotoAngle {
  name: string;
  description: string;
  priority: "high" | "medium";
}

export interface PhotoGuide {
  minimumPhotos: number;
  recommendedAngles: PhotoAngle[];
  tips: string[];
}

export interface GuideService {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export interface GuideIssue {
  problem: string;
  solution: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface GuideStep {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields?: GuideField[];
  checklist?: string[];
  tips?: Tip[];
  photoGuide?: PhotoGuide;
  services?: GuideService[];
  issues?: GuideIssue[];
}

// Guide steps data
export const guideSteps: GuideStep[] = [
  {
    id: "step-1",
    number: 1,
    title: "Contact Information",
    shortTitle: "Contact Info",
    description: "Your business contact details for buyer inquiries",
    icon: User,
    fields: [
      {
        name: "Contact Name",
        required: true,
        description: "The primary contact person for this listing",
        placeholder: "John Smith",
        tip: "Use your full name or a recognizable business name",
      },
      {
        name: "Company Name",
        required: false,
        description: "Your business name (if applicable)",
        placeholder: "ABC Construction LLC",
        tip: "Helps build credibility for business listings",
      },
      {
        name: "Address Line 1",
        required: true,
        description: "Street address for equipment location",
        placeholder: "123 Main Street",
        tip: "Used for buyer logistics and shipping calculations",
      },
      {
        name: "Address Line 2",
        required: false,
        description: "Apartment, suite, or unit number",
        placeholder: "Suite 100",
        tip: "Leave blank if not applicable",
      },
      {
        name: "City",
        required: true,
        description: "City where equipment is located",
        placeholder: "Fort Myers",
        tip: "Important for local buyer searches",
      },
      {
        name: "State / Province",
        required: true,
        description: "State or province",
        placeholder: "Florida",
        tip: "Helps buyers find equipment near them",
      },
      {
        name: "Postal Code",
        required: false,
        description: "ZIP code or postal code",
        placeholder: "33901",
        tip: "Aids in accurate location mapping",
      },
      {
        name: "Country",
        required: true,
        description: "Country where equipment is located",
        placeholder: "United States",
        tip: "Required for international shipping considerations",
      },
      {
        name: "Phone",
        required: true,
        description: "Primary phone number for inquiries",
        placeholder: "+1 (239) 555-0123",
        tip: "Buyers prefer calling for quick questions",
      },
      {
        name: "Email",
        required: true,
        description: "Email address for notifications",
        placeholder: "john@example.com",
        tip: "Use a monitored email for inquiry responses",
      },
      {
        name: "Website",
        required: false,
        description: "Company website (optional)",
        placeholder: "https://www.example.com",
        tip: "Only add if you want buyers to visit your site",
      },
    ],
    checklist: [
      "Use a professional email address",
      "Ensure phone is monitored during business hours",
      "Address helps buyers calculate shipping/transport",
      "Consider time zone for inquiry response times",
    ],
    tips: [
      {
        type: "pro",
        title: "Pro Tip",
        content:
          "Use a business email for company listings to maintain professionalism and separate from personal communications.",
      },
      {
        type: "warning",
        title: "Important",
        content:
          "This contact info will be visible to all buyers. Only use information you're comfortable sharing publicly.",
      },
    ],
  },
  {
    id: "step-2",
    number: 2,
    title: "Listing Information",
    shortTitle: "Listing Info",
    description: "Core equipment details that buyers search and filter by",
    icon: Tag,
    fields: [
      {
        name: "Asking Price",
        required: true,
        description: "Your listed selling price",
        placeholder: "250000",
        tip: "Research comparable sales for competitive pricing",
      },
      {
        name: "Currency",
        required: true,
        description: "Currency for the asking price",
        placeholder: "USD",
        tip: "Choose currency appropriate for your target buyers",
      },
      {
        name: "Year",
        required: true,
        description: "Year of manufacture",
        placeholder: "2020",
        tip: "Use manufacture year, not purchase year",
      },
      {
        name: "Manufacturer",
        required: true,
        description: "Equipment manufacturer/brand",
        placeholder: "Vermeer",
        tip: "Use official manufacturer name",
      },
      {
        name: "Model",
        required: true,
        description: "Specific model name/number",
        placeholder: "D100x120",
        tip: "Include any model variations or series",
      },
      {
        name: "Condition",
        required: true,
        description: "Overall equipment condition",
        placeholder: "Excellent",
        tip: "Be honest - condition affects buyer trust",
      },
      {
        name: "Serial Number",
        required: true,
        description: "Equipment serial number",
        placeholder: "VD123456789",
        tip: "Required for verification and history checks",
      },
      {
        name: "Hours",
        required: false,
        description: "Operating hours on meter",
        placeholder: "2500",
        tip: "Lower hours = higher value for most equipment",
      },
      {
        name: "Miles",
        required: false,
        description: "Mileage (if applicable)",
        placeholder: "15000",
        tip: "Only for mobile equipment with road capability",
      },
      {
        name: "Repossessed",
        required: false,
        description: "Whether equipment is repossessed",
        placeholder: "No",
        tip: "Must be disclosed - affects buyer decisions",
      },
    ],
    checklist: [
      "Research market value before setting price",
      "Use manufacture year, not purchase year",
      "Be honest about condition rating",
      "Serial number helps verify equipment history",
      "Include hours/miles for heavy equipment",
      "Disclose repossessed status honestly",
    ],
    tips: [
      {
        type: "pro",
        title: "Pricing Strategy",
        content:
          "Price 5-10% below market average for faster sales. Check recent sales of similar equipment for accurate pricing.",
      },
      {
        type: "info",
        title: "Condition Guide",
        content:
          "Excellent: Like new, minimal wear | Good: Regular use, minor wear | Fair: Heavy use, visible wear | Poor: Needs repair",
      },
      {
        type: "warning",
        title: "Serial Number",
        content:
          "Never skip the serial number. Buyers need it for verification, parts ordering, and equipment history checks.",
      },
    ],
  },
  {
    id: "step-3",
    number: 3,
    title: "Listing Details",
    shortTitle: "Details",
    description: "Detailed information to showcase your equipment's features",
    icon: FileText,
    fields: [
      {
        name: "General Description",
        required: false,
        description: "Overall equipment description and history",
        placeholder: "Describe your equipment's condition, usage history, and key features...",
        tip: "Be specific about equipment capabilities and limitations",
      },
      {
        name: "Locating Systems",
        required: false,
        description: "Tracking/locating systems included",
        placeholder: "DCI DigiTrak F5, Mercury GPS, etc.",
        tip: "Specific to HDD rigs - important buyer feature",
      },
      {
        name: "Mixing Systems",
        required: false,
        description: "Mud mixing system details",
        placeholder: "Vacuum mixing system, 300-gallon tank...",
        tip: "Describe capacity and condition of mixing system",
      },
      {
        name: "Accessories",
        required: false,
        description: "Included tooling and accessories",
        placeholder: "Drill pipe, bits, tooling, spare parts...",
        tip: "List everything included in the sale",
      },
      {
        name: "Trailers",
        required: false,
        description: "Trailer information (if included)",
        placeholder: "Gooseneck trailer, year, condition...",
        tip: "Include trailer details if equipment includes transport",
      },
      {
        name: "Recent Work/Modifications",
        required: false,
        description: "Recent repairs, upgrades, or maintenance",
        placeholder: "New engine, recent service, hydraulic overhaul...",
        tip: "Recent work increases buyer confidence",
      },
      {
        name: "Additional Information",
        required: false,
        description: "Any other relevant details",
        placeholder: "Location availability, inspection details...",
        tip: "Include info that helps buyers make decisions",
      },
      {
        name: "Pipe Inventory",
        required: false,
        description: "Drill pipe details (HDD specific)",
        placeholder: "3-inch pipe, 20 joints, various lengths...",
        tip: "HDD buyers specifically look for pipe inventory",
      },
    ],
    checklist: [
      "Be specific about equipment condition",
      "Include all accessories in the sale",
      "Mention recent maintenance and repairs",
      "Describe any upgrades or modifications",
      "List any known issues or repairs needed",
      "Include equipment's typical applications",
    ],
    tips: [
      {
        type: "pro",
        title: "Description Template",
        content:
          "Start with: '[Year] [Manufacturer] [Model] in [condition] condition. Used primarily for [application]. Well maintained with [key features].'",
      },
      {
        type: "info",
        title: "What Buyers Want",
        content:
          "Buyers look for: usage history, maintenance records, upgrades, included accessories, and any known issues.",
      },
      {
        type: "warning",
        title: "Honesty Matters",
        content:
          "Disclosing issues upfront builds trust and prevents disputes. Hidden problems lead to deal failures.",
      },
    ],
  },
  {
    id: "step-4",
    number: 4,
    title: "Attachments",
    shortTitle: "Photos",
    description: "Upload photos and documents to showcase your equipment",
    icon: Image,
    fields: [
      {
        name: "Photos",
        required: false,
        description: "Equipment photos",
        placeholder: "Upload up to 20 photos",
        tip: "Upload 10+ photos minimum for best results",
      },
      {
        name: "Documents",
        required: false,
        description: "Service records, manuals, etc.",
        placeholder: "Upload PDFs or images",
        tip: "Service records build buyer confidence",
      },
    ],
    photoGuide: {
      minimumPhotos: 10,
      recommendedAngles: [
        {
          name: "Overall Shot",
          description: "Full view of equipment from side",
          priority: "high",
        },
        {
          name: "Front View",
          description: "Front of equipment showing condition",
          priority: "high",
        },
        {
          name: "Rear View",
          description: "Back of equipment",
          priority: "high",
        },
        {
          name: "Engine Compartment",
          description: "Engine bay showing engine and components",
          priority: "high",
        },
        {
          name: "Hydraulics",
          description: "Hydraulic system components",
          priority: "high",
        },
        {
          name: "Operator Cab",
          description: "Interior of operator station",
          priority: "medium",
        },
        {
          name: "Ground Engaging Tools",
          description: "Bits, teeth, or cutting edges",
          priority: "medium",
        },
        {
          name: "Attachments",
          description: "Any included attachments",
          priority: "medium",
        },
        {
          name: "Hour/Meter Display",
          description: "Photo of actual hours/miles",
          priority: "high",
        },
        {
          name: "Close-ups",
          description: "Detailed photos of key features",
          priority: "medium",
        },
        {
          name: "Damage/Wear",
          description: "Document any existing damage",
          priority: "high",
        },
      ],
      tips: [
        "Use natural daylight for best results",
        "Clean equipment before photographing",
        "Take photos from multiple angles",
        "Include close-ups of important features",
        "Document any damage or wear honestly",
        "Show equipment in operation if possible",
        "Front-facing photo should be first",
      ],
    },
    checklist: [
      "Upload 10+ photos minimum",
      "Include front-facing main photo",
      "Show all angles (front, sides, rear)",
      "Include engine and component photos",
      "Document any damage or wear",
      "Add photos of hour/meter display",
      "Include close-ups of key features",
    ],
    tips: [
      {
        type: "pro",
        title: "Photo Quality",
        content:
          "Good photos = faster sales. Listings with 10+ photos sell 3x faster than those with few or no photos.",
      },
      {
        type: "info",
        title: "Best Angles",
        content:
          "Always include: overall shot, engine, hydraulics, cab, hour meter, and any damage. Front-facing photo first.",
      },
      {
        type: "warning",
        title: "Photo Rules",
        content:
          "No blurry photos, no photos with people, no stock images. Real photos build buyer trust.",
      },
    ],
  },
  {
    id: "step-5",
    number: 5,
    title: "Review & Submit",
    shortTitle: "Review",
    description: "Review your listing before publishing to buyers",
    icon: CheckCircle2,
    fields: [
      {
        name: "Preview Listing",
        required: false,
        description: "See how your listing appears to buyers",
        placeholder: "Review all sections",
        tip: "View as a buyer to check appearance",
      },
      {
        name: "Contact Info",
        required: false,
        description: "Verify contact details are correct",
        placeholder: "Double-check all fields",
        tip: "Accurate contact = more inquiries",
      },
      {
        name: "Equipment Details",
        required: false,
        description: "Ensure all equipment info is accurate",
        placeholder: "Review year, model, condition",
        tip: "Mistakes reduce buyer trust",
      },
      {
        name: "Photos",
        required: false,
        description: "Confirm all photos look good",
        placeholder: "Check photo quality and order",
        tip: "First impression matters",
      },
    ],
    checklist: [
      "Review all information for accuracy",
      "Check photo quality and coverage",
      "Verify contact details are correct",
      "Ensure price is competitive",
      "Read through your description",
      "Save your reference number after submit",
    ],
    tips: [
      {
        type: "info",
        title: "What Happens Next",
        content:
          "After submission: Your listing will be published immediately. Buyers view can and contact you directly.",
      },
      {
        type: "pro",
        title: "Response Time",
        content:
          "Respond to inquiries within 24 hours. Quick responses lead to faster sales and better buyer experiences.",
      },
      {
        type: "warning",
        title: "Reference Number",
        content:
          "Save your reference number! You'll need it to access your listing later, especially for anonymous listings.",
      },
    ],
  },
  {
    id: "step-6",
    number: 6,
    title: "Success",
    shortTitle: "Success",
    description: "Your listing is live! Here's what happens next",
    icon: MailCheck,
    fields: [
      {
        name: "Email Confirmation",
        required: false,
        description: "You'll receive an email confirmation when your listing is online",
        placeholder: "Usually within 24 hours",
        tip: "Check your spam folder if you don't see it",
      },
      {
        name: "Listing Goes Live",
        required: false,
        description: "Your equipment is now visible to buyers worldwide",
        placeholder: "Active on the marketplace",
        tip: "Buyers can search and contact you directly",
      },
      {
        name: "HDD Broker Services",
        required: false,
        description: "We handle the entire transaction process",
        placeholder: "From start to finish",
        tip: "Advertising, buyer sourcing, financing, negotiation, closing",
      },
    ],
    services: [
      {
        icon: Eye,
        title: "Advertising",
        description: "Your equipment is promoted across multiple channels to reach qualified buyers",
      },
      {
        icon: User,
        title: "Locating Buyers",
        description: "We actively source and connect you with interested buyers",
      },
      {
        icon: DollarSign,
        title: "Financing",
        description: "Financing options available for qualified buyers (OAC)",
      },
      {
        icon: Handshake,
        title: "Negotiation",
        description: "We help negotiate a fair price on your behalf",
      },
      {
        icon: FileCheck,
        title: "Closing the Deal",
        description: "Professional handling of all paperwork and closing processes",
      },
      {
        icon: Truck,
        title: "Delivery & Transport",
        description: "We arrange logistics for equipment pickup and delivery",
      },
      {
        icon: FileText,
        title: "Title Transfers",
        description: "Proper documentation and title transfer handling",
      },
      {
        icon: CheckCircle2,
        title: "Payment Collection",
        description: "Secure collection and transfer of funds to you",
      },
    ],
    checklist: [
      "Check your email for confirmation (within 24 hours)",
      "Monitor your inbox for buyer inquiries",
      "Respond promptly to messages (within 24 hours)",
      "Be prepared to answer questions about your equipment",
      "Keep your reference number handy",
      "Consider creating an account to manage listings easily",
    ],
    tips: [
      {
        type: "info",
        title: "Email Confirmation",
        content:
          "You'll receive an email confirmation when your listing is online (usually within 24 hours). If you don't see it, check your spam folder.",
      },
      {
        type: "pro",
        title: "HDD Broker Advantage",
        content:
          "HDD Broker is NOT just a listing service! We handle the entire transaction from advertising to closing, including financing, negotiation, and title transfers.",
      },
      {
        type: "info",
        title: "Buyer Inquiries",
        content:
          "Qualified buyers will contact you through our platform. Respond quickly to maximize your selling opportunities.",
      },
    ],
  },
  {
    id: "step-7",
    number: 7,
    title: "Issues & Solutions",
    shortTitle: "Issues",
    description: "Common problems and how to resolve them",
    icon: AlertOctagon,
    fields: [
      {
        name: "Listing Not Published",
        required: false,
        description: "Your listing isn't showing up yet",
        placeholder: "Check email for status updates",
        tip: "Most listings go live within 24 hours",
      },
      {
        name: "No Inquiries Yet",
        required: false,
        description: "Haven't received any buyer messages",
        placeholder: "Review your listing quality",
        tip: "Good photos and competitive pricing help attract buyers",
      },
      {
        name: "Reference Number Lost",
        required: false,
        description: "Can't find your reference number",
        placeholder: "Check your email history",
        tip: "Search your email for 'HDD Broker' or listing confirmation",
      },
      {
        name: "Edit Your Listing",
        required: false,
        description: "Need to update information",
        placeholder: "Login or contact support",
        tip: "Create an account for easy listing management",
      },
    ],
    issues: [
      {
        problem: "Listing not showing online",
        solution: "Check your email for confirmation. Most listings go live within 24 hours. If it's been longer, contact us.",
        icon: RefreshCw,
      },
      {
        problem: "No buyer inquiries",
        solution: "Ensure you have quality photos (10+), competitive pricing, and complete equipment details. Consider reducing price.",
        icon: Image,
      },
      {
        problem: "Lost reference number",
        solution: "Search your email for 'HDD Broker' or 'reference number'. Contact us with your email and equipment details.",
        icon: AlertCircle,
      },
      {
        problem: "Need to update listing",
        solution: "Login to your account to edit, or contact us with the changes you need. Updates typically go live quickly.",
        icon: FileText,
      },
      {
        problem: "Equipment already sold",
        solution: "Contact us immediately to mark your listing as sold or remove it from the marketplace.",
        icon: CheckCircle2,
      },
      {
        problem: "Spam email concerns",
        solution: "Add listings@hddbroker.com to your contacts to ensure you receive all communications.",
        icon: Mail,
      },
    ],
    checklist: [
      "Check spam folder for confirmation email",
      "Verify listing details are complete and accurate",
      "Ensure photos are high quality (10+ recommended)",
      "Price competitively for your market",
      "Respond to inquiries within 24 hours",
      "Save your reference number in a safe place",
    ],
    tips: [
      {
        type: "warning",
        title: "Quick Response",
        content:
          "Respond to all inquiries within 24 hours. Slow responses often result in lost sales as buyers move on.",
      },
      {
        type: "info",
        title: "Still Having Issues?",
        content:
          "Contact our support team: Email listings@hddbroker.com or call (239) 256-2344. We're here to help!",
      },
      {
        type: "pro",
        title: "Create an Account",
        content:
          "Create a free account to easily manage your listings, track inquiries, and make updates anytime.",
      },
    ],
  },
];

// Sample data for examples
export const sampleListingData = {
  step1: {
    contactName: "John Doe",
    companyName: "ABC Construction Co.",
    addressLine1: "123 Main Street",
    addressLine2: "Suite 100",
    city: "Fort Myers",
    stateProvince: "Florida",
    postalCode: "33901",
    country: "United States",
    phone: "+1.239.256.2344",
    email: "john.doe@example.com",
    website: "https://www.example.com",
  },
  step2: {
    askingPrice: "250000",
    currency: "USD",
    year: "2020",
    manufacturer: "Vermeer",
    model: "D100x120",
    condition: "Excellent",
    serialNumber: "VD123456789",
    hours: "2500",
    miles: "15000",
    repossessed: false,
  },
  step3: {
    generalDescription:
      "Excellent condition HDD rig, well maintained with full service records. Used primarily for horizontal directional drilling operations.",
    locatingSystems: "DCI DigiTrak F5 locating system",
    mixingSystems: "Vacuum mixing system with 300-gallon tank",
    accessories: "Includes drill pipe, drill bits, and various tooling",
    trailers: "Gooseneck trailer included, excellent condition",
    recentWorkModifications: "Recently serviced, all fluids changed, new filters installed",
    additionalInformation: "Located in Florida, available for inspection by appointment",
    pipe: "3-inch drill pipe, 20 pieces, various lengths",
  },
};

// Helper function to get step data
export function getStepData(stepNumber: number) {
  return guideSteps[stepNumber - 1] ?? null;
}

// Condition options with descriptions
export const conditionOptions = [
  { value: "Excellent", description: "Like new condition, minimal wear" },
  { value: "Very Good", description: "Well maintained, light wear" },
  { value: "Good", description: "Regular use, normal wear" },
  { value: "Fair", description: "Heavy use, visible wear" },
  { value: "Poor", description: "Needs repair or refurbishment" },
];

// Currency options
export const currencyOptions = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
];

