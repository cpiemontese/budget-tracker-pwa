import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { GetStaticProps } from 'next'
import { useSelector } from 'react-redux'
import { ReduxState } from '../types'
import Link from 'next/link'
import { amountToValue } from '../lib/crud/budget-items/common'

export default function Home() {
  const { funds, budgetItems } = useSelector((state: ReduxState) => ({
    funds: state.funds,
    budgetItems: state.budgetItems,
  }))

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Funds</h2>
        <ul className={utilStyles.list}>
          {Object.keys(funds).map(id => (
            <Link href="/funds/[id]" as={`/funds/${id}`} key={id}>
              <a>
                <p>{funds[id].name}</p>
                <p>{funds[id].amount}</p>
                <p>{funds[id].createdAt}</p>
                <p>{funds[id].updatedAt}</p>
              </a>
            </Link>
          ))}
        </ul>
        <h2 className={utilStyles.headingLg}>Budget Items</h2>
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
      </section>
    </Layout>
  )
}

/*
TODO
- impostare azioni asicrone di fetch dei fondi
- fare fetch dei fondi dall'api (i.e. fetch da mongo utente)
- impostare l'update asicrono tramite api
*/

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      initialReduxState: {
        logged: false,
        funds: {
          "1234": {
            id: "1234",
            amount: 123.30,
            name: "some fund",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
        },
        budgetItems: {
          "4567": {
            id: "4567",
            fund: "1234",
            amount: 50,
            type: "expense",
            name: "some item",
            category: "some category",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
        }
      }
    }
  }
}
