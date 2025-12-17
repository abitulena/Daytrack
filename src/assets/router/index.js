import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/registration',
    name: 'Registration',
    component: () => import('../views/Registration.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notes',
    name: 'Notes',
    component: () => import('../views/Notes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('../views/Gallery.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  console.log('🛡️ Проверка маршрута:', to.path)
  
  const isLoggedIn = localStorage.getItem('daytrack_logged_in') === 'true'
  const userId = localStorage.getItem('daytrack_user_id')
  
  console.log('🔑 Статус авторизации:', {
    isLoggedIn: isLoggedIn,
    userId: userId,
    requiresAuth: to.meta.requiresAuth
  })
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    console.log('🚫 Доступ запрещен, перенаправление на логин')
    next('/')
  } else {
    console.log('✅ Доступ разрешен')
    next()
  }
})

export default router