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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES = ["USD", "GBP", "EUR", "CAD"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];
const YEARS = Array.from({ length: 30 }, (_, i) => 2025 - i);

export default function ListingInfoStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ListingFormData>();

  const sameAsContactAddress = watch("sameAsContactAddress");

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Please fill in the information for your equipment. Detailed descriptions
        can be given in the next step. The asking price is what you would like
        to receive for your equipment. Please fill in the location of your
        equipment so we can provide shipping quotes for customers who are
        interested in your equipment. Fields that are marked bold must be
        completed.
      </p>

      <FieldGroup>
        <Field>
          <FieldLabel>
            Your Asking Price <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <div className="flex gap-2">
              <Input
                {...register("askingPrice")}
                placeholder="Enter price"
                className="flex-1"
                type="number"
              />
              <Select
                value={watch("currency")}
                onValueChange={(value) => setValue("currency", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FieldError errors={[errors.askingPrice]} />
            <FieldError errors={[errors.currency]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Year <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Select
              value={watch("year") || ""}
              onValueChange={(value) => setValue("year", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.year]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Manufacturer <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("manufacturer")}
              placeholder="Enter manufacturer"
            />
            <FieldError errors={[errors.manufacturer]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Model <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Input {...register("model")} placeholder="Enter model" />
            <FieldError errors={[errors.model]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Condition <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Select
              value={watch("condition") || ""}
              onValueChange={(value) => setValue("condition", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.condition]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Serial Number <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("serialNumber")}
              placeholder="Enter serial number"
            />
            <FieldDescription>
              This will NOT be displayed on the website but is required to sell
              the equipment.
            </FieldDescription>
            <FieldError errors={[errors.serialNumber]} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>Hours</FieldLabel>
            <FieldContent>
              <Input
                {...register("hours")}
                placeholder="Enter hours"
                type="number"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Miles</FieldLabel>
            <FieldContent>
              <Input
                {...register("miles")}
                placeholder="Enter miles"
                type="number"
              />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldContent>
            <div className="flex items-center gap-2">
              <Checkbox
                id="repossessed"
                checked={watch("repossessed")}
                onCheckedChange={(checked) =>
                  setValue("repossessed", checked as boolean)
                }
              />
              <Label htmlFor="repossessed" className="cursor-pointer">
                Repossessed
              </Label>
            </div>
          </FieldContent>
        </Field>

        <div className="border-t pt-6">
          <h3 className="mb-4 text-lg font-semibold">EQUIPMENT LOCATION</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Please be advised your location will not be disclosed to our
            clients and is mainly used for creating shipping quotes.
          </p>

          <Field>
            <FieldContent>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sameAsContactAddress"
                  checked={sameAsContactAddress}
                  onCheckedChange={(checked) => {
                    setValue("sameAsContactAddress", checked as boolean);
                    if (checked) {
                      setValue("equipmentCity", watch("city"));
                      setValue("equipmentStateProvince", watch("stateProvince"));
                      setValue("equipmentPostalCode", watch("postalCode"));
                      setValue("equipmentCountry", watch("country"));
                    }
                  }}
                />
                <Label
                  htmlFor="sameAsContactAddress"
                  className="cursor-pointer"
                >
                  Same as Contact Address
                </Label>
              </div>
            </FieldContent>
          </Field>

          {!sameAsContactAddress && (
            <>
              <Field>
                <FieldLabel>City</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("equipmentCity")}
                    placeholder="Enter city"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>State/Province</FieldLabel>
                <FieldContent>
                  <Input
                    {...register("equipmentStateProvince")}
                    placeholder="Enter state/province"
                  />
                </FieldContent>
              </Field>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Postal Code</FieldLabel>
                  <FieldContent>
                    <Input
                      {...register("equipmentPostalCode")}
                      placeholder="Enter postal code"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Country</FieldLabel>
                  <FieldContent>
                    <Input
                      {...register("equipmentCountry")}
                      placeholder="Enter country"
                    />
                  </FieldContent>
                </Field>
              </div>
            </>
          )}
        </div>
      </FieldGroup>
    </div>
  );
}

