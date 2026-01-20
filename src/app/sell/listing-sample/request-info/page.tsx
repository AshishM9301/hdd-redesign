import { RequestMoreInfoForm } from "@/components/request-more-info-form"

export default function SampleListingRequestInfoPage() {
  return (
    <RequestMoreInfoForm
      data={{
        referenceNumber: "12345",
        equipmentDescription: "2008 Vermeer D330X500 – Machine Only! 9,762 hours",
        backHref: "/sell/listing-sample",
        returnToListingHref: "/sell/listing-sample",
      }}
    />
  )
}
