import { useSelector, shallowEqual } from 'react-redux'
import { ReduxState } from '../types'

const Fund = ({ id }: { id: string }) => {
  const fund = useSelector(
    (state: ReduxState) => state.funds[id],
    shallowEqual
  ) 

  return (
    <div>
      <p>{fund.name}</p>
      <p>{fund.amount}</p>
      <p>{fund.createdAt}</p>
      <p>{fund.updatedAt}</p>
    </div>
  )
}

export default Fund