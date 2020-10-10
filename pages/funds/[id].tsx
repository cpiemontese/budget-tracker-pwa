import Head from 'next/head'
import { useRouter } from 'next/router'

import Fund from '../../components/fund'
import Layout from '../../components/layout'


export default function FundPage() {
  const router = useRouter()
  const { id } = router.query

  return (
    <Layout overrideName={`Fund ${id}`}>
      <Head>
        <title>Fund Detail</title>
      </Head>
      <Fund id={id as string}/>
    </Layout>
  )
}
