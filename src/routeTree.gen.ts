import { route as rootRoute } from './routes/_root'

import { route as indexRoute } from './routes/index'

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      parentRoute: typeof rootRoute
    }  
  }
}

Object.assign(indexRoute.options, {
  path: '/',
  getParentRoute: () => rootRoute,
})

export const routeTree = rootRoute.addChildren([
  indexRoute
])