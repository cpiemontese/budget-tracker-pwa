import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { GetStaticProps } from 'next'
import Funds from '../components/funds'
import BudgetItems from '../components/budget-items'

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Funds</h2>
        <Funds />
        <h2 className={utilStyles.headingLg}>Budget Items</h2>
        <BudgetItems />
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
