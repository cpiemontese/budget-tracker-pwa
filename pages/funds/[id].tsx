import Head from 'next/head'
import { useRouter } from 'next/router'

import Fund from '../../components/fund'
import Layout from '../../components/layout'


export default function FundPage() {
  const router = useRouter()
  const { id } = router.query

  console.log(router.query, router.pathname, router.route)

  return (
    <Layout>
      <Head>
        <title>Fund with id {id}</title>
      </Head>
      <Fund id={id as string}/>
    </Layout>
  )
}
