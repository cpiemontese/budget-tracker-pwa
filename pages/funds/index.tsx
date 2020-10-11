import Head from 'next/head'

import FundCreator from '../../components/fund/creator'
import Layout from '../../components/layout'

const pageName = "New Fund"

export default function FundPage() {
  return (
    <Layout overrideName={pageName}>
      <Head>
        <title>{pageName}</title>
      </Head>
      <FundCreator />
    </Layout>
  )
}
