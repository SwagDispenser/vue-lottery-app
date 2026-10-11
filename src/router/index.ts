import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

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
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Home', layout: 'default' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { title: 'About author', layout: 'default' },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/UsersView.vue'),
    meta: { title: 'Users', layout: 'default' },
  },
  {
    path: '/users/:id',
    name: 'user-detail',
    component: () => import('../views/UserDetailView.vue'),
    props: true,
    meta: { title: 'User details', layout: 'default' },
    children: [
      {
        path: 'edit',
        name: 'user-edit',
        component: () => import('../views/UserEditView.vue'),
        props: true,
        meta: { title: 'Edit user', layout: 'default' },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Login', layout: 'auth' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Page not found', layout: 'default' },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.title} · Vue Lottery`
})
