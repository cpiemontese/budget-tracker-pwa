import { useSelector, shallowEqual } from 'react-redux'
import { ReduxState } from '../types'
import utilStyles from '../styles/utils.module.css'
import { amountToValue } from '../lib/crud/budget-items/common'

const BudgetItems = () => {
  const budgetItems = useSelector(
    (state: ReduxState) => state.budgetItems,
    shallowEqual
  ) 

  return (
    <ul className={utilStyles.list}>
      {Object.keys(budgetItems).map(id => (
        <li className={utilStyles.listItem} key={id}>
          <p>{budgetItems[id].name}</p>
          <p>{amountToValue(budgetItems[id].amount, budgetItems[id].type)}</p>
          <p>{budgetItems[id].type}</p>
          <p>{budgetItems[id].category}</p>
          <p>{budgetItems[id].fund}</p>
          <p>{budgetItems[id].createdAt}</p>
          <p>{budgetItems[id].updatedAt}</p>
        </li>
      ))}
    </ul>
  )
}

export default BudgetItems