const routes = [
  { path: '/', name: 'Home', component: () => import('@/components/Home') },
  { path: '/fallback/:queryId', name: 'Fallback', component: () => import('@/components/Fallback'), props: true },
  { path: '/music/:queryId', name: 'MusicTemplate', component: () => import('@/components/domains/music/MusicTemplate'), props: true },
  { path: '/poi/:queryId', name: 'POI', component: () => import('@/components/domains/POI'), props: true },
  { path: '/weather/:queryId', name: 'Weather', component: () => import('@/components/domains/Weather') },
  { path: '/wikipedia/:queryId', name: 'Wikipedia', component: () => import('@/components/domains/Wikipedia') }
]

export default routes
