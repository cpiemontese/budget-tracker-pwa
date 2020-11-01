import Head from "next/head";
import Link from "next/link";

import commonStyles from "../styles/common.module.css";

const name = "Budget Tracker";
export const siteTitle = "Budget Tracker";

export default function Layout({
  children,
  home,
  overrideName,
}: {
  children: React.ReactNode;
  home?: boolean;
  overrideName?: string;
}) {
  return (
    <div className="max-w-xl min-h-screen mx-auto p-4">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="Budget Tracker"
          charSet="utf-8"
          content="Track your expenses and income with Budget Tracker"
        />
        <meta
          property="og:image"
          content={`https://og-image.now.sh/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <header className="flex relative mb-4 border-b-2">
        {home ? (
          <>
            <h1 className="w-4/5 sm:w-5/6 text-4xl font-light">{name}</h1>
            <button
              className={`sm:absolute sm:right-0 w-1/5 sm:w-1/6 self-center ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
            >
              Login
            </button>
          </>
        ) : (
          <h2 className="text-3xl font-light">{overrideName ?? name}</h2>
        )}
      </header>
      <main className="relative">{children}</main>
      {!home && (
        <div className="mt-6">
          <Link href="/">
            <button
              className={`w-1/4 ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
            >
              ← Back
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
