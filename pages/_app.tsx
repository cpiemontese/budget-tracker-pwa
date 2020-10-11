import "../styles/global.css";
import { AppProps } from "next/app";
import { Provider } from 'react-redux'
import { useStore } from '../redux/store'
import { ReduxState } from "../redux/types";

export default function App({ Component, pageProps }: AppProps) {
  const store = useStore(pageProps.initialReduxState as ReduxState)

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  )
}