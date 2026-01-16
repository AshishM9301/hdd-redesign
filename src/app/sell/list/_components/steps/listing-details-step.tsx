"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { ListingFormData } from "../listing-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export default function ListingDetailsStep() {
  const { register } = useFormContext<ListingFormData>();

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Please fill in the descriptions for the applicable sections. If a
        section is not applicable (for example you don&apos;t have a trailer)
        then leave that section empty. Listings with detailed descriptions
        receive more viewings.
      </p>

      <FieldGroup>
        <Field>
          <FieldLabel>General Description</FieldLabel>
          <FieldContent>
            <Textarea
              {...register("generalDescription")}
              placeholder="Enter general description"
              rows={5}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Locating System(s)</FieldLabel>
          <FieldContent>
            <Textarea
              {...register("locatingSystems")}
              placeholder="Enter locating system details"
              rows={5}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Mixing System(s)</FieldLabel>
          <FieldContent>
            <Textarea
              {...register("mixingSystems")}
              placeholder="Enter mixing system details"
              rows={5}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Accessories</FieldLabel>
          <FieldContent>
            <Textarea
              {...register("accessories")}
              placeholder="Enter accessories details"
              rows={5}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Trailer(s)</FieldLabel>
          <FieldContent>
            <Textarea
              {...register("trailers")}
              placeholder="Enter trailer details"
              rows={5}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Recent Work/Modifications</FieldLabel>
          <FieldContent>
            <Textarea
              {...register("recentWorkModifications")}
              placeholder="Enter recent work and modifications"
              rows={5}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Additional Information</FieldLabel>
          <FieldContent>
            <Textarea
              {...register("additionalInformation")}
              placeholder="Enter any additional information"
              rows={5}
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Pipe</FieldLabel>
          <FieldContent>
            <Textarea
              {...register("pipe")}
              placeholder="Enter pipe details"
              rows={5}
            />
          </FieldContent>
        </Field>
      </FieldGroup>
    </div>
  );
}

