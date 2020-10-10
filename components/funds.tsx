import { useSelector, shallowEqual } from 'react-redux'
import { ReduxState } from '../types'
import utilStyles from '../styles/utils.module.css'

const Funds = () => {
  const funds = useSelector(
    (state: ReduxState) => state.funds,
    shallowEqual
  ) 

  return (
    <ul className={utilStyles.list}>
      {Object.keys(funds).map(id => (
        <li className={utilStyles.listItem} key={id}>
          <p>{funds[id].name}</p>
          <p>{funds[id].amount}</p>
          <p>{funds[id].createdAt}</p>
          <p>{funds[id].updatedAt}</p>
        </li>
      ))}
    </ul>
  )
}

export default Funds