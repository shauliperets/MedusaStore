import { Metadata } from "next"
import { redirect } from "next/navigation"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getTranslations } from "next-intl/server"

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("store")
  return {
    title: t("allProducts"),
    description: "",
  }
}

export default async function Home(props: Params) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ])

  const query = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      query.set(key, value)
    }
  })

  const queryString = query.toString()
  const targetPath = `/${params.countryCode}/store${
    queryString ? `?${queryString}` : ""
  }`

  redirect(targetPath)
}
