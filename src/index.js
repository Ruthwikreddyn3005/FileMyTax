import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter as Router } from 'react-router-dom'

import { store, persistor } from './redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { AuthProvider } from './contexts/AuthContext'

import './index.css'

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={<h1>Loading from Local Storage</h1>}
        persistor={persistor}
      >
        <Router>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Router>
      </PersistGate>
    </Provider>
  </StrictMode>,
  document.getElementById('root')
)

serviceWorker.unregister()
