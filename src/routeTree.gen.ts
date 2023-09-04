import { route as rootRoute } from './routes/_root'

import { route as indexRoute } from './routes/index'
import { route as playgroundRoute } from './routes/playground'

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      parentRoute: typeof rootRoute
    }
    'playground': {
      parentRoute: typeof rootRoute
    }  
  }
}

Object.assign(indexRoute.options, {
  path: '/',
  getParentRoute: () => rootRoute,
})
Object.assign(playgroundRoute.options, {
  path: 'playground',
  getParentRoute: () => rootRoute,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  playgroundRoute
])