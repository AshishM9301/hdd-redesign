"use client";

import React from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import ContactInfoStep from "./steps/contact-info-step";
import ListingInfoStep from "./steps/listing-info-step";
import ListingDetailsStep from "./steps/listing-details-step";
import AttachmentsStep from "./steps/attachments-step";
import ReviewStep from "./steps/review-step";
import StepIndicator from "./step-indicator";
import { useRouter } from "next/navigation";
import { Wand2, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

// Form schema - we'll make it comprehensive
const listingFormSchema = z.object({
  // Contact Info
  contactName: z.string().min(1, "Contact name is required"),
  companyName: z.string().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  stateProvince: z.string().min(1, "State/Province is required"),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().optional(),
  hearAboutUs: z.array(z.string()).optional(),
  hearAboutUsOther: z.string().optional(),
  acceptTerms: z.boolean().refine((v) => v === true, "You must accept terms"),
  // Listing Info
  askingPrice: z.string().min(1, "Asking price is required"),
  currency: z.string().min(1, "Currency is required"),
  year: z.string().min(1, "Year is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  condition: z.string().min(1, "Condition is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  hours: z.string().optional(),
  miles: z.string().optional(),
  repossessed: z.boolean().optional(),
  sameAsContactAddress: z.boolean().optional(),
  equipmentCity: z.string().optional(),
  equipmentStateProvince: z.string().optional(),
  equipmentPostalCode: z.string().optional(),
  equipmentCountry: z.string().optional(),
  // Listing Details
  generalDescription: z.string().optional(),
  locatingSystems: z.string().optional(),
  mixingSystems: z.string().optional(),
  accessories: z.string().optional(),
  trailers: z.string().optional(),
  recentWorkModifications: z.string().optional(),
  additionalInformation: z.string().optional(),
  pipe: z.string().optional(),
  // Attachments
  attachments: z.array(z.instanceof(File)).optional(),
});

export type ListingFormData = z.infer<typeof listingFormSchema>;

const STEPS = [
  { id: 1, label: "CONTACT INFO", component: ContactInfoStep },
  { id: 2, label: "LISTING INFO", component: ListingInfoStep },
  { id: 3, label: "LISTING DETAILS", component: ListingDetailsStep },
  { id: 4, label: "ATTACHMENTS", component: AttachmentsStep },
  { id: 5, label: "REVIEW", component: ReviewStep },
];

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ListingForm() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [visitedSteps, setVisitedSteps] = React.useState<number[]>([1]); // Step 1 is visited by default
  const router = useRouter();

  // tRPC mutations
  const createListing = api.listing.create.useMutation({
    onSuccess: async (data) => {
      toast.success("Listing created successfully!");

      // Upload media files if any
      const attachments = form.getValues("attachments");
      if (attachments && attachments.length > 0) {
        try {
          const files = await Promise.all(
            attachments.map(async (file) => ({
              data: await fileToBase64(file),
              fileName: file.name,
              mimeType: file.type,
            })),
          );

          await uploadMedia.mutateAsync({
            listingId: data.id,
            files,
          });

          toast.success("Files uploaded successfully!");
        } catch (error) {
          console.error("Error uploading files:", error);
          toast.error("Listing created but failed to upload some files");
        }
      }

      // Redirect to listings page
      router.push("/sell/listings");
    },
    onError: (error) => {
      console.error("Error creating listing:", error);
      toast.error(error.message || "Failed to create listing");
    },
  });

  const uploadMedia = api.listing.uploadMedia.useMutation({
    onError: (error) => {
      console.error("Error uploading media:", error);
      toast.error(error.message || "Failed to upload files");
    },
  });

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      acceptTerms: false,
      repossessed: false,
      sameAsContactAddress: false,
      hearAboutUs: [],
      attachments: [],
    },
    mode: "onChange", // Validate on change to enable real-time button state updates
    reValidateMode: "onChange",
  });

  // Get step fields for current step
  const stepFields = React.useMemo(
    () => getStepFields(currentStep),
    [currentStep],
  );

  // Watch step-specific fields to trigger re-renders when they change
  const watchedValues = useWatch({
    control: form.control,
    name: stepFields.length > 0 ? (stepFields as any) : undefined,
  });

  // Compute if current step is valid
  const isCurrentStepValid = React.useMemo(() => {
    // Optional steps (no required fields) are always valid
    if (stepFields.length === 0) {
      return true;
    }

    const formValues = form.getValues();
    const errors = form.formState.errors;

    // Check if all required fields are filled and have no errors
    const allFieldsValid = stepFields.every((field) => {
      const value = formValues[field];
      const error = errors[field];

      // Special handling for boolean fields (acceptTerms)
      if (typeof value === "boolean") {
        return value === true && error === undefined;
      }

      // Field must have a value (not empty string, null, or undefined)
      const hasValue = value !== undefined && value !== null && value !== "";

      // Field must have no errors
      const hasNoError = error === undefined;

      return hasValue && hasNoError;
    });

    return allFieldsValid;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, stepFields, form.formState.errors, watchedValues]);

  const CurrentStepComponent = STEPS[currentStep - 1]?.component;

  const handleNext = async () => {
    const stepFields = getStepFields(currentStep);
    const isValid = await form.trigger(stepFields as any);
    if (isValid && currentStep < STEPS.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Mark the next step as visited when moving forward via Next button
      setVisitedSteps((prev) => {
        if (!prev.includes(nextStep)) {
          return [...prev, nextStep];
        }
        return prev;
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    router.push("/sell");
  };

  const onSubmit = async (data: ListingFormData) => {
    try {
      // Transform form data to match tRPC schema
      const contactInfo = {
        contactName: data.contactName,
        companyName: data.companyName,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        stateProvince: data.stateProvince,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        email: data.email,
        website: data.website,
        hearAboutUs: data.hearAboutUs || [],
        hearAboutUsOther: data.hearAboutUsOther,
        acceptTerms: data.acceptTerms,
      };

      const listingInfo = {
        year: data.year,
        manufacturer: data.manufacturer,
        model: data.model,
        condition: data.condition,
        serialNumber: data.serialNumber,
        askingPrice: data.askingPrice,
        currency: data.currency,
        hours: data.hours,
        miles: data.miles,
        repossessed: data.repossessed || false,
        equipmentCity: data.equipmentCity,
        equipmentStateProvince: data.equipmentStateProvince,
        equipmentPostalCode: data.equipmentPostalCode,
        equipmentCountry: data.equipmentCountry,
      };

      const listingDetails = {
        generalDescription: data.generalDescription,
        locatingSystems: data.locatingSystems,
        mixingSystems: data.mixingSystems,
        accessories: data.accessories,
        trailers: data.trailers,
        recentWorkModifications: data.recentWorkModifications,
        additionalInformation: data.additionalInformation,
        pipe: data.pipe,
      };

      // Create listing (media will be uploaded after)
      await createListing.mutateAsync({
        contactInfo,
        listingInfo,
        listingDetails: Object.values(listingDetails).some((v) => v)
          ? listingDetails
          : undefined,
      });
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error("Form submission error:", error);
    }
  };

  const handleStepSubmit = async () => {
    if (currentStep < STEPS.length) {
      await handleNext();
    } else {
      await form.handleSubmit(onSubmit)();
    }
  };

  // Check if a step is completed (has valid data) - only for steps with required fields
  const isStepCompleted = React.useCallback(
    (stepId: number) => {
      const stepFields = getStepFields(stepId);

      // Optional steps (no required fields) are NOT considered completed for navigation
      if (stepFields.length === 0) {
        return false;
      }

      const formValues = form.getValues();
      const errors = form.formState.errors;

      // Check if all required fields are filled and have no errors
      const allFieldsValid = stepFields.every((field) => {
        const value = formValues[field];
        const error = errors[field];

        // Special handling for boolean fields (acceptTerms)
        if (typeof value === "boolean") {
          return value === true && error === undefined;
        }

        // Field must have a value (not empty string, null, or undefined)
        const hasValue = value !== undefined && value !== null && value !== "";

        // Field must have no errors
        const hasNoError = error === undefined;

        return hasValue && hasNoError;
      });

      return allFieldsValid;
    },
    [form],
  );

  // Get all completed steps (only steps with required fields that are completed)
  const completedSteps = React.useMemo(() => {
    return STEPS.filter((step) => isStepCompleted(step.id)).map(
      (step) => step.id,
    );
  }, [isStepCompleted, form.formState.errors, watchedValues]);

  // Handle step click - also mark step as visited if clickable
  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    setVisitedSteps((prev) => {
      if (!prev.includes(stepId)) {
        return [...prev, stepId];
      }
      return prev;
    });
  };

  const handleAutoFill = () => {
    const sampleData: Partial<ListingFormData> = {
      // Step 1: Contact Info
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
      hearAboutUs: ["google", "otherOnline"],
      acceptTerms: true,
      // Step 2: Listing Info
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
      sameAsContactAddress: true,
      // Step 3: Listing Details
      generalDescription:
        "Excellent condition HDD rig, well maintained with full service records. Used primarily for horizontal directional drilling operations.",
      locatingSystems: "DCI DigiTrak F5 locating system",
      mixingSystems: "Vacuum mixing system with 300-gallon tank",
      accessories: "Includes drill pipe, drill bits, and various tooling",
      trailers: "Gooseneck trailer included, excellent condition",
      recentWorkModifications:
        "Recently serviced, all fluids changed, new filters installed",
      additionalInformation:
        "Located in Florida, available for inspection by appointment",
      pipe: "3-inch drill pipe, 20 pieces, various lengths",
    };

    // Fill only the fields for the current step
    const stepFields = getStepFields(currentStep);
    const fieldsToFill: Partial<ListingFormData> = {};

    if (currentStep === 1) {
      Object.assign(fieldsToFill, {
        contactName: sampleData.contactName,
        companyName: sampleData.companyName,
        addressLine1: sampleData.addressLine1,
        addressLine2: sampleData.addressLine2,
        city: sampleData.city,
        stateProvince: sampleData.stateProvince,
        postalCode: sampleData.postalCode,
        country: sampleData.country,
        phone: sampleData.phone,
        email: sampleData.email,
        website: sampleData.website,
        hearAboutUs: sampleData.hearAboutUs,
        acceptTerms: sampleData.acceptTerms,
      });
    } else if (currentStep === 2) {
      Object.assign(fieldsToFill, {
        askingPrice: sampleData.askingPrice,
        currency: sampleData.currency,
        year: sampleData.year,
        manufacturer: sampleData.manufacturer,
        model: sampleData.model,
        condition: sampleData.condition,
        serialNumber: sampleData.serialNumber,
        hours: sampleData.hours,
        miles: sampleData.miles,
        repossessed: sampleData.repossessed,
        sameAsContactAddress: sampleData.sameAsContactAddress,
      });
    } else if (currentStep === 3) {
      Object.assign(fieldsToFill, {
        generalDescription: sampleData.generalDescription,
        locatingSystems: sampleData.locatingSystems,
        mixingSystems: sampleData.mixingSystems,
        accessories: sampleData.accessories,
        trailers: sampleData.trailers,
        recentWorkModifications: sampleData.recentWorkModifications,
        additionalInformation: sampleData.additionalInformation,
        pipe: sampleData.pipe,
      });
    }

    // Set the form values
    Object.entries(fieldsToFill).forEach(([key, value]) => {
      if (value !== undefined) {
        form.setValue(key as keyof ListingFormData, value as any);
      }
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <StepIndicator
            currentStep={currentStep}
            steps={STEPS}
            completedSteps={completedSteps}
            visitedSteps={visitedSteps}
            onStepClick={handleStepClick}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAutoFill}
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Auto-fill Step
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          {CurrentStepComponent && (
            <CurrentStepComponent
              onEdit={currentStep === 5 ? setCurrentStep : undefined}
            />
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button
            type="button"
            onClick={handleStepSubmit}
            disabled={
              currentStep === STEPS.length
                ? form.formState.isSubmitting ||
                  createListing.isPending ||
                  uploadMedia.isPending
                : !isCurrentStepValid
            }
            className={`${currentStep === STEPS.length ? "text-background bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600" : isCurrentStepValid ? "bg-primary/90 hover:bg-primary-foreground/10 border border-white/20 hover:border-white" : ""}`}
          >
            {currentStep === STEPS.length ? (
              createListing.isPending || uploadMedia.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function getStepFields(step: number): (keyof ListingFormData)[] {
  switch (step) {
    case 1:
      return [
        "contactName",
        "addressLine1",
        "city",
        "stateProvince",
        "country",
        "phone",
        "email",
        "acceptTerms",
      ];
    case 2:
      return [
        "askingPrice",
        "currency",
        "year",
        "manufacturer",
        "model",
        "condition",
        "serialNumber",
      ];
    case 3:
      return [];
    case 4:
      return [];
    case 5:
      return [];
    default:
      return [];
  }
}
