"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { ListingFormData } from "../listing-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Video } from "lucide-react";
import MediaPreviewDialog from "@/components/media-preview-dialog";
import type { MediaPreviewFile } from "@/components/media-preview-dialog";

type ReviewStepProps = {
  onEdit?: (step: number) => void;
};

export default function ReviewStep({ onEdit }: ReviewStepProps) {
  const { watch } = useFormContext<ListingFormData>();
  const formData = watch();
  const [previewFiles, setPreviewFiles] = React.useState<MediaPreviewFile[]>(
    [],
  );
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);

  // Create preview URLs for attachments
  React.useEffect(() => {
    if (formData.attachments && formData.attachments.length > 0) {
      const files: MediaPreviewFile[] = formData.attachments.map((file) => ({
        preview: URL.createObjectURL(file),
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "video",
      }));
      setPreviewFiles(files);
    } else {
      setPreviewFiles([]);
    }

    // Cleanup preview URLs on unmount or when attachments change
    return () => {
      setPreviewFiles((prevFiles) => {
        prevFiles.forEach((file) => {
          URL.revokeObjectURL(file.preview);
        });
        return [];
      });
    };
  }, [formData.attachments]);

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Please review your listing and make sure all information is accurate. If
        you need to make changes, click the Edit button to go to that section to
        make the necessary changes.
      </p>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>CONTACT INFO</CardTitle>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(1)}
                type="button"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Contact Name:</span>{" "}
              {formData.contactName}
            </div>
            <div>
              <span className="font-medium">Company:</span>{" "}
              {formData.companyName || "N/A"}
            </div>
            <div>
              <span className="font-medium">Address:</span>{" "}
              {formData.addressLine1}, {formData.city}, {formData.stateProvince}{" "}
              {formData.postalCode}
            </div>
            <div>
              <span className="font-medium">Country:</span> {formData.country}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {formData.phone}
            </div>
            <div>
              <span className="font-medium">Email:</span> {formData.email}
            </div>
            {formData.website && (
              <div>
                <span className="font-medium">Website:</span> {formData.website}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>LISTING INFO</CardTitle>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(2)}
                type="button"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Asking Price:</span>{" "}
              {formData.currency} {formData.askingPrice}
            </div>
            <div>
              <span className="font-medium">Year:</span> {formData.year}
            </div>
            <div>
              <span className="font-medium">Manufacturer:</span>{" "}
              {formData.manufacturer}
            </div>
            <div>
              <span className="font-medium">Model:</span> {formData.model}
            </div>
            <div>
              <span className="font-medium">Condition:</span>{" "}
              {formData.condition}
            </div>
            {formData.hours && (
              <div>
                <span className="font-medium">Hours:</span> {formData.hours}
              </div>
            )}
            {formData.miles && (
              <div>
                <span className="font-medium">Miles:</span> {formData.miles}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>LISTING DETAILS</CardTitle>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(3)}
                type="button"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(() => {
              const hasData =
                formData.generalDescription ||
                formData.locatingSystems ||
                formData.mixingSystems ||
                formData.accessories ||
                formData.trailers ||
                formData.recentWorkModifications ||
                formData.additionalInformation ||
                formData.pipe;

              if (!hasData) {
                return (
                  <p className="text-muted-foreground">
                    No listing details have been provided.
                  </p>
                );
              }

              return (
                <>
                  {formData.generalDescription && (
                    <div>
                      <span className="font-medium">General Description:</span>
                      <p className="text-muted-foreground mt-1">
                        {formData.generalDescription}
                      </p>
                    </div>
                  )}
                  {formData.locatingSystems && (
                    <div>
                      <span className="font-medium">Locating System(s):</span>
                      <p className="text-muted-foreground mt-1">
                        {formData.locatingSystems}
                      </p>
                    </div>
                  )}
                  {formData.mixingSystems && (
                    <div>
                      <span className="font-medium">Mixing System(s):</span>
                      <p className="text-muted-foreground mt-1">
                        {formData.mixingSystems}
                      </p>
                    </div>
                  )}
                  {formData.accessories && (
                    <div>
                      <span className="font-medium">Accessories:</span>
                      <p className="text-muted-foreground mt-1">
                        {formData.accessories}
                      </p>
                    </div>
                  )}
                  {formData.trailers && (
                    <div>
                      <span className="font-medium">Trailer(s):</span>
                      <p className="text-muted-foreground mt-1">
                        {formData.trailers}
                      </p>
                    </div>
                  )}
                  {formData.recentWorkModifications && (
                    <div>
                      <span className="font-medium">
                        Recent Work/Modifications:
                      </span>
                      <p className="text-muted-foreground mt-1">
                        {formData.recentWorkModifications}
                      </p>
                    </div>
                  )}
                  {formData.additionalInformation && (
                    <div>
                      <span className="font-medium">
                        Additional Information:
                      </span>
                      <p className="text-muted-foreground mt-1">
                        {formData.additionalInformation}
                      </p>
                    </div>
                  )}
                  {formData.pipe && (
                    <div>
                      <span className="font-medium">Pipe:</span>
                      <p className="text-muted-foreground mt-1">
                        {formData.pipe}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>ATTACHMENTS</CardTitle>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(4)}
                type="button"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="text-sm">
            {previewFiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {previewFiles.map((file, index) => (
                  <div key={index} className="space-y-2">
                    {file.type === "image" ? (
                      <button
                        type="button"
                        onClick={() => setPreviewIndex(index)}
                        className="group relative h-24 w-full overflow-hidden rounded border transition-opacity hover:opacity-80"
                      >
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreviewIndex(index)}
                        className="bg-muted hover:bg-muted/80 flex h-24 w-full items-center justify-center rounded border transition-colors"
                      >
                        <Video className="text-muted-foreground h-6 w-6" />
                      </button>
                    )}
                    <p className="text-muted-foreground truncate text-xs">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No pictures or documents have been submitted.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <MediaPreviewDialog
        open={previewIndex !== null}
        onOpenChange={(open) => !open && setPreviewIndex(null)}
        file={
          previewIndex !== null ? (previewFiles[previewIndex] ?? null) : null
        }
      />
    </div>
  );
}
