import type { WorkVariant } from '@/hooks/useChoice'
import WorkRows from './WorkRows'
import WorkIndex from './WorkIndex'
import WorkStrips from './WorkStrips'

const variants: Record<WorkVariant, () => React.JSX.Element> = {
  rows: WorkRows,
  index: WorkIndex,
  strips: WorkStrips,
}

export default function WorkSection({ variant }: { variant: WorkVariant }) {
  const Variant = variants[variant]
  return <Variant key={variant} />
}
