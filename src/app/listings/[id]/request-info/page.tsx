import { RequestMoreInfoForm } from "@/components/request-more-info-form"
import { api } from "@/trpc/server"

function formatEquipmentDescription(listing: {
  year: string
  manufacturer: string
  model: string
  condition: string
  hours: string | null
}) {
  const hours = listing.hours ? `${listing.hours} hours` : null
  return [listing.year, `${listing.manufacturer} ${listing.model}`, "–", listing.condition, hours]
    .filter(Boolean)
    .join(" ")
}

export default async function ListingRequestInfoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isReferenceNumber = id.startsWith("REF-")

  const listing = isReferenceNumber
    ? await api.listing.getByReference({ referenceNumber: id })
    : await api.listing.getById({ listingId: id })
  const referenceNumber = listing.referenceNumber ?? id

  return (
    <RequestMoreInfoForm
      data={{
        referenceNumber,
        equipmentDescription: formatEquipmentDescription({
          year: listing.year,
          manufacturer: listing.manufacturer,
          model: listing.model,
          condition: listing.condition,
          hours: listing.hours,
        }),
        backHref: `/listings/${id}`,
        returnToListingHref: `/listings/${id}`,
      }}
    />
  )
}


