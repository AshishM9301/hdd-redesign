export type SampleImage = {
  id: string;
  fileName: string;
  storagePath: string;
  thumbnailUrl: string;
};

export type SampleVideo = {
  id: string;
  fileName: string;
  storagePath: string;
  thumbnailUrl: string;
};

export type SampleDocument = {
  id: string;
  name: string;
  sizeLabel: string;
  url: string;
};

export type SampleListingData = {
  referenceNumber: string;
  manufacturer: string;
  model: string;
  year: string;
  condition: string;
  hours: string;
  serialNumber: string;
  askingPrice: number;
  currency: string;
  status: string;
  city: string;
  stateProvince: string;
  country: string;
  contactName: string;
  phone: string;
  email: string;
  companyName: string;
  generalDescription: string;
  locatingSystems: string;
  mixingSystems: string;
  accessories: string;
  trailers: string;
  recentWorkModifications: string;
  additionalInformation: string;
  pipe: string;
  features: string[];
  images: SampleImage[];
  videos: SampleVideo[];
  documents: SampleDocument[];
};

export const sampleListing: SampleListingData = {
  referenceNumber: "12345",
  manufacturer: "Vermeer",
  model: "D330X500",
  year: "2008",
  condition: "Machine Only!",
  hours: "9,762 hours",
  serialNumber: "VD123456789",
  askingPrice: 479000,
  currency: "USD",
  status: "SAMPLE",
  city: "Fort Myers",
  stateProvince: "Florida",
  country: "United States",
  contactName: "John Doe",
  phone: "+1.239.237.3744",
  email: "sales@hddbroker.com",
  companyName: "HDD Broker LLC",
  generalDescription:
    "Clean, well-maintained drill with strong performance history.\n\nMachine is being sold as Machine Only (no tooling beyond what is listed). Starts easily, runs smoothly, and has been used on typical utility installs.\n\nAll information provided by Seller; buyer should verify prior to purchase.",
  locatingSystems: "DCI DigiTrak F5 locating system",
  mixingSystems: "Vacuum mixing system with 300-gallon tank",
  accessories: "Includes drill pipe, drill bits, and various tooling",
  trailers: "Gooseneck trailer included",
  recentWorkModifications: "Recently serviced by local Vermeer dealer",
  additionalInformation:
    "Fluids and filters changed recently. Includes spare parts box. Stored indoors when not in use.",
  pipe: "3-inch drill pipe, 20 pieces",
  features: [
    "Caterpillar C7.1 Engine",
    "Pullback Capacity: 100,000 lbs",
    "Torque: 12,000 ft-lbs",
    "Carriage Speed: 0-120 fpm",
    "Spindle Speed: 0-200 rpm",
    "Ground Drive Speed: 0-2.5 mph",
    "On-board Crane: 8,000 lb capacity",
    "Track Size: 24 inches",
  ],
  images: Array.from({ length: 48 }, (_, idx) => {
    const id = String(idx + 1);
    return {
      id,
      fileName: `photo-${id}.jpg`,
      storagePath: `https://picsum.photos/seed/${id}/800/600`,
      thumbnailUrl: `https://picsum.photos/seed/${id}/400/400`,
    } satisfies SampleImage;
  }),
  videos: [
    {
      id: "v1",
      fileName: "walkaround.mp4",
      storagePath: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
      thumbnailUrl: "https://picsum.photos/seed/video-901/800/450",
    },
    {
      id: "v2",
      fileName: "startup.mp4",
      storagePath: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
      thumbnailUrl: "https://picsum.photos/seed/video-902/800/450",
    },
    {
      id: "v3",
      fileName: "controls.mp4",
      storagePath: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
      thumbnailUrl: "https://picsum.photos/seed/video-903/800/450",
    },
  ] satisfies SampleVideo[],
  documents: [
    { id: "1", name: "Condition Report", sizeLabel: "376KB", url: "#" },
    { id: "2", name: "Service History", sizeLabel: "873KB", url: "#" },
  ] satisfies SampleDocument[],
};

