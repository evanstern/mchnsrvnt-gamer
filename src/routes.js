import React from 'react'
import Router from 'react-routing/src/Router'
import fetch from './core/fetch'
import App from './components/app'
import ContentPage from './components/content-page'
import ContactPage from './components/contact-page'
import LoginPage from './components/login-page'
import RegisterPage from './components/register-page'
import NotFoundPage from './components/not-found-page'
import ErrorPage from './components/error-page'

const router = new Router(on => {
    on('*', async (state, next) => {
        const component = await next()
        return component && <App context={state.context}>{component}</App>
    })

    on('/contact', async () => <ContactPage />)

    on('/login', async () => <LoginPage />)

    on('/register', async () => <RegisterPage />)

    on('*', async (state) => {
        const response = await fetch(`/api/content?path=${state.path}`)
        const content = await response.json()
        return content && <ContentPage {...content} />
    })

    on('error', (state, error) => state.statusCode === 404 ?
        <App context={state.context} error={error}><NotFoundPage /></App> :
        <App context={state.context} error={error}><ErrorPage /></App>
    )
})

export default router
