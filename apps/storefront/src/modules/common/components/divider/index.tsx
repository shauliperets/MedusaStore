import { clx } from "@modules/common/components/ui"

const Divider = ({ className }: { className?: string }) => (
  <div
    className={clx(
      "mt-1 h-px w-full border-b border-ui-border-base",
      className
    )}
  />
)

export default Divider
