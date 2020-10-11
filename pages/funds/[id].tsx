import Head from 'next/head'
import { useRouter } from 'next/router'

import FundModifier from '../../components/fund/modifier'
import Layout from '../../components/layout'

const pageName = "Fund Detail"

export default function FundPage() {
  const router = useRouter()
  const { id } = router.query

  return (
    <Layout overrideName={pageName}>
      <Head>
        <title>{pageName}</title>
      </Head>
      <FundModifier id={id as string}/>
    </Layout>
  )
}
