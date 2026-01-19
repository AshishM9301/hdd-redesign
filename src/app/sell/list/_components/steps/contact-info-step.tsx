"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { ListingFormData } from "../listing-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function ContactInfoStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ListingFormData>();

  const hearAboutUs = watch("hearAboutUs") ?? [];
  const acceptTerms = watch("acceptTerms");

  const handleHearAboutUsChange = (value: string, checked: boolean) => {
    const current = hearAboutUs;
    if (checked) {
      setValue("hearAboutUs", [...current, value]);
    } else {
      setValue("hearAboutUs", current.filter((v) => v !== value));
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Please fill in your contact details. We use this information to get in
        touch with you when we have an interested buyer. Fields that are marked
        bold must be completed.
      </p>

      <FieldGroup>
        <Field>
          <FieldLabel>
            Contact Name <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("contactName")}
              placeholder="Enter contact name"
            />
            <FieldError errors={[errors.contactName]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Company Name</FieldLabel>
          <FieldContent>
            <Input
              {...register("companyName")}
              placeholder="Enter company name"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Address Line 1 <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("addressLine1")}
              placeholder="Enter address line 1"
            />
            <FieldError errors={[errors.addressLine1]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Address Line 2</FieldLabel>
          <FieldContent>
            <Input
              {...register("addressLine2")}
              placeholder="Enter address line 2"
            />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>
              City <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <Input {...register("city")}               placeholder="Enter city" />
              <FieldError errors={[errors.city]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>
              State/Province <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                {...register("stateProvince")}
                placeholder="Enter state/province"
              />
              <FieldError errors={[errors.stateProvince]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>Postal Code</FieldLabel>
            <FieldContent>
              <Input
                {...register("postalCode")}
                placeholder="Enter postal code"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>
              Country <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <Input {...register("country")}               placeholder="Enter country" />
              <FieldError errors={[errors.country]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>
            Phone <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Input {...register("phone")}               placeholder="Enter phone number" />
            <FieldError errors={[errors.phone]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Email <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              type="email"
              {...register("email")}
              placeholder="Enter email address"
            />
            <FieldError errors={[errors.email]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Website</FieldLabel>
          <FieldContent>
            <Input {...register("website")} placeholder="Enter website URL" />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>How did you hear about us?</FieldLabel>
          <FieldContent>
            <div className="space-y-3">
              {[
                { value: "google", label: "Google" },
                { value: "yahoo", label: "Yahoo!" },
                { value: "otherOnline", label: "Other Online" },
                { value: "wordOfMouth", label: "Word of Mouth" },
              ].map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={option.value}
                    checked={hearAboutUs.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleHearAboutUsChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="publication"
                  checked={hearAboutUs.includes("publication")}
                  onCheckedChange={(checked) =>
                    handleHearAboutUsChange("publication", checked as boolean)
                  }
                />
                <Label htmlFor="publication" className="cursor-pointer">
                  Publication
                </Label>
                <Input
                  {...register("hearAboutUsOther")}
                  placeholder="Publication"
                  className="ml-2 max-w-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tradeShow"
                  checked={hearAboutUs.includes("tradeShow")}
                  onCheckedChange={(checked) =>
                    handleHearAboutUsChange("tradeShow", checked as boolean)
                  }
                />
                <Label htmlFor="tradeShow" className="cursor-pointer">
                  Trade Show
                </Label>
                <Input
                  {...register("hearAboutUsOther")}
                  placeholder="Trade Show"
                  className="ml-2 max-w-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="other"
                  checked={hearAboutUs.includes("other")}
                  onCheckedChange={(checked) =>
                    handleHearAboutUsChange("other", checked as boolean)
                  }
                />
                <Label htmlFor="other" className="cursor-pointer">
                  Other
                </Label>
                <Input
                  {...register("hearAboutUsOther")}
                  placeholder="Other"
                  className="ml-2 max-w-xs"
                />
              </div>
            </div>
          </FieldContent>
        </Field>

        <Field>
          <FieldContent>
            <div className="flex items-center gap-2">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={(checked) =>
                  setValue("acceptTerms", checked as boolean)
                }
              />
              <Label htmlFor="acceptTerms" className="cursor-pointer">
                I have read the Terms and Conditions{" "}
                <span className="text-destructive">*</span>
              </Label>
            </div>
            <FieldError errors={[errors.acceptTerms]} />
          </FieldContent>
        </Field>
      </FieldGroup>
    </div>
  );
}

