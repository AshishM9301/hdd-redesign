/**
 * Listing Types
 * 
 * TypeScript types for listing-related data structures and tRPC router outputs.
 */

import type {
  Listing,
  ContactInfo,
  ListingDetails,
  MediaAttachment,
} from "../../generated/prisma";
import {
  ListingStatus,
  AvailabilityStatus,
  MediaFileType,
  StorageProvider,
} from "../../generated/prisma";

// Re-export Prisma types
export type {
  Listing,
  ContactInfo,
  ListingDetails,
  MediaAttachment,
};

// Re-export Prisma enums (both type and value can be exported with same name)
export {
  ListingStatus,
  AvailabilityStatus,
  MediaFileType,
  StorageProvider,
};

/**
 * Listing with all relations included
 */
export type ListingWithRelations = Listing & {
  contactInfo: ContactInfo;
  listingDetails: ListingDetails | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  mediaAttachments: MediaAttachment[];
};

/**
 * ContactInfo with listings
 */
export type ContactInfoWithListings = ContactInfo & {
  listings: Listing[];
};

/**
 * ListingDetails with listing
 */
export type ListingDetailsWithListing = ListingDetails & {
  listing: Listing | null;
};

/**
 * MediaAttachment with listing
 */
export type MediaAttachmentWithListing = MediaAttachment & {
  listing: Listing;
};

/**
 * Paginated listing results
 */
export type PaginatedListings = {
  listings: ListingWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Listing creation input
 */
export type CreateListingInput = {
  contactInfo: {
    contactName: string;
    companyName?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince: string;
    postalCode?: string;
    country: string;
    phone: string;
    email: string;
    website?: string;
    hearAboutUs: string[];
    hearAboutUsOther?: string;
    acceptTerms: boolean;
  };
  listingInfo: {
    year: string;
    manufacturer: string;
    model: string;
    condition: string;
    serialNumber: string;
    askingPrice: number;
    currency: string;
    hours?: string;
    miles?: string;
    repossessed: boolean;
    equipmentCity?: string;
    equipmentStateProvince?: string;
    equipmentPostalCode?: string;
    equipmentCountry?: string;
  };
  listingDetails?: {
    generalDescription?: string;
    locatingSystems?: string;
    mixingSystems?: string;
    accessories?: string;
    trailers?: string;
    recentWorkModifications?: string;
    additionalInformation?: string;
    pipe?: string;
  };
};

/**
 * Listing update input
 */
export type UpdateListingInput = {
  listingId: string;
  contactInfo?: Partial<CreateListingInput["contactInfo"]>;
  listingInfo?: Partial<CreateListingInput["listingInfo"]>;
  listingDetails?: Partial<CreateListingInput["listingDetails"]>;
};

/**
 * Media upload input
 */
export type MediaUploadInput = {
  listingId: string;
  files: Array<{
    data: string; // base64 string
    fileName: string;
    mimeType: string;
  }>;
};

/**
 * Media upload result
 */
export type MediaUploadResult = {
  id: string;
  fileName: string;
  url: string;
  thumbnailUrl: string | null;
};

/**
 * Listing filters for search
 */
export type ListingFilters = {
  manufacturer?: string;
  model?: string;
  year?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

