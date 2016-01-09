import 'babel-core/polyfill'
import path from 'path'
import express from 'express'
import React from 'react'
import ReactDOM from 'react-dom/server'
import Router from './routes'
import Html from './components/html'
import assets from './assets'
import { port } from './config'

const server = global.server = express()

server.use(express.static(path.join(__dirname, 'public')))
server.use('/api/content', require('./api/content'))

server.get('*', async (req, res, next) => {
    try {
        let statusCode = 200
        const data = { title: '', description: '', css: '', body: '', entry: assets.main.js }
        const css = []
        const context = {
            insertCss: styles => css.push(styles._getCss()),
            onSetTitle: value => data.title = value,
            onSetMeta: (key, value) => data[key] = value,
            onPageNotFound: () => statusCode = 404,
        }

        await Router.dispatch({
            path: req.path,
            query: req.query,
            context
        }, (state, component) => {
            data.body = ReactDOM.renderToString(component)
            data.css = css.join('')
        })

        const html = ReactDOM.renderToStaticMarkup(<Html {...data} />)
        res.status(statusCode).send('<!doctype html>\n' + html)
    } catch (err) {
        next(err)
    }
})

server.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}/`)
})
