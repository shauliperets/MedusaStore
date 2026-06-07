import { Container, Skeleton } from "@modules/common/components/ui"

const SkeletonProductPreview = () => {
  return (
    <div>
      <Container className="aspect-[9/16] w-full !p-0">
        <Skeleton className="h-full w-full rounded-[inherit]" />
      </Container>
      <div className="flex justify-between text-base-regular mt-2">
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-6 w-1/5" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
