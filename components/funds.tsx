import Link from 'next/link'
import { useSelector, shallowEqual } from 'react-redux'

import utilStyles from '../styles/utils.module.css'

import { ReduxState } from '../types'

const Funds = () => {
  const funds = useSelector(
    (state: ReduxState) => state.funds,
    shallowEqual
  ) 

  return (
    <ul className={utilStyles.list}>
      {Object.keys(funds).map(id => (
        <Link href="/funds/[id]" as={`/funds/${id}`}>
          <a>
            <p>{funds[id].name}</p>
            <p>{funds[id].amount}</p>
            <p>{funds[id].createdAt}</p>
            <p>{funds[id].updatedAt}</p>
          </a>
       </Link>
      ))}
    </ul>
  )
}

export default Funds