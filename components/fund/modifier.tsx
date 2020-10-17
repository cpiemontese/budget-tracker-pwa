import { format } from 'date-fns'
import get from 'lodash.get'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'
import { ReduxState, UPDATE_FUND } from '../../redux/types'

const FundModifier = ({ id }: { id: string }) => {
  const fund = useSelector(
    (state: ReduxState) => state.funds[id],
    shallowEqual
  )

  const dispatch = useDispatch()

  const createChangeHandler = (name, validator = (_value: any) => true) => event => {
    const value = event.target.value

    if (!validator(value)) {
      return
    }

    dispatch({
      type: UPDATE_FUND,
      id: fund.id,
      updates: {
        [name]: value,
        updatedAt: Date.now()
      }
    })
  }

  return (
    <form onSubmit={event => event.preventDefault()}>
      <p>
        <label>Name:
          <input type="text" value={get(fund, 'name', '')} onChange={createChangeHandler("name")} />
        </label>
      </p>
      <p>
        <label>Amount:
          <input type="number" value={get(fund, 'amount', 0)} onChange={createChangeHandler("amount", value => /^(\d+(\.\d+)?)$/.test(value))} />
        </label>
      </p>
      <p>Created: {format(get(fund, 'createdAt', new Date()), "d MMMM y H:m")}</p>
      <p>Updated: {format(get(fund, 'updatedAt', new Date()), "d MMMM y H:m")}</p>
    </form>
  )
}

export default FundModifier