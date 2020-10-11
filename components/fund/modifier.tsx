import { format } from 'date-fns'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'
import { ReduxState, UPDATE_FUND } from '../../types'

const FundModifier = ({ id }: { id: string }) => {
  const fund = useSelector(
    (state: ReduxState) => state.funds[id],
    shallowEqual
  ) 

  const dispatch = useDispatch()

  const createChangeHandler = (name, validator = (_value: any) => true) => event  => {
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
          <input type="text" value={fund.name} onChange={createChangeHandler("name")}/>
        </label>
      </p>
      <p>
        <label>Amount:
          <input type="number" value={fund.amount} onChange={createChangeHandler("amount", value => /^(\d+(\.\d+)?)$/.test(value))}/>
        </label>
      </p>
      <p>Created: {format(fund.createdAt, "d MMMM y H:m")}</p>
      <p>Updated: {format(fund.updatedAt, "d MMMM y H:m")}</p>
    </form>
  )
}

export default FundModifier