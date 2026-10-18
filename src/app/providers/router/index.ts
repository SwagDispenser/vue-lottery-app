import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useSessionStore } from '@/entities/session'
import { pinia } from '../pinia'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    layout?: 'default' | 'auth'
    requiresAuth?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home').then((page) => page.HomeView),
    meta: { title: 'Home', layout: 'default' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/about').then((page) => page.AboutView),
    meta: { title: 'About author', layout: 'default' },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/pages/users').then((page) => page.UsersView),
    meta: { title: 'Users', layout: 'default', requiresAuth: true },
  },
  {
    path: '/users/:id',
    name: 'user-detail',
    component: () => import('@/pages/user-details').then((page) => page.UserDetailView),
    props: true,
    meta: { title: 'User details', layout: 'default', requiresAuth: true },
    children: [
      {
        path: 'edit',
        name: 'user-edit',
        component: () => import('@/pages/user-details').then((page) => page.UserEditView),
        props: true,
        meta: { title: 'Edit user', layout: 'default' },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login').then((page) => page.LoginView),
    meta: { title: 'Login', layout: 'auth' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found').then((page) => page.NotFoundView),
    meta: { title: 'Page not found', layout: 'default' },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useSessionStore(pinia)
  if (to.meta.requiresAuth && !await auth.ensureAuthenticated()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && await auth.ensureAuthenticated()) {
    return { name: 'users' }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title} · Vue Lottery`
})
