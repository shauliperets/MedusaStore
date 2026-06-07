import { Skeleton, Table } from "@modules/common/components/ui"

const SkeletonCartItem = () => {
  return (
    <Table.Row className="w-full m-4">
      <Table.Cell className="!pl-0 p-4 w-24">
        <Skeleton className="flex h-24 w-24 rounded-large" />
      </Table.Cell>
      <Table.Cell className="text-left">
        <div className="flex flex-col gap-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="flex gap-2 items-center">
          <Skeleton className="h-8 w-6" />
          <Skeleton className="h-10 w-14" />
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-12" />
        </div>
      </Table.Cell>
      <Table.Cell className="!pr-0 text-right">
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-6 w-12" />
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default SkeletonCartItem
