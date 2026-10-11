<script setup lang="ts">
import LotteryApp from '@/components/LotteryApp.vue'

const technologies = [
  'Vue 3', 'Composition API', 'TypeScript', 'Vue Router', 'Pinia',
  'VeeValidate', 'Yup', 'DummyJSON REST API', 'Bootstrap SCSS',
]
</script>

<template>
  <main>
    <section
      class="home-intro panel"
      aria-labelledby="home-title"
    >
      <p class="home-intro__eyebrow">
        Навчальний SPA-проєкт
      </p>
      <h1 id="home-title">
        Лотерея учасників
      </h1>
      <p class="home-intro__description">
        Інтерактивний застосунок для реєстрації учасників, пошуку, редагування даних
        і випадкового вибору до трьох переможців. У цьому розділі працює початкова
        лотерея; сторінка Users використовуватиме окреме REST API.
      </p>
      <ul
        class="home-intro__technologies"
        aria-label="Технології проєкту"
      >
        <li
          v-for="technology in technologies"
          :key="technology"
        >
          {{ technology }}
        </li>
      </ul>
      <a
        href="https://github.com/SwagDispenser/vue-lottery-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        Переглянути проєкт на GitHub ↗
      </a>
    </section>
    <LotteryApp />
  </main>
</template>

<style scoped lang="scss">
.home-intro { padding: 28px 32px; }
.home-intro__eyebrow { margin: 0 0 8px; color: #008fad; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 0 0 12px; font-size: clamp(28px, 4vw, 38px); font-weight: 700; }
.home-intro__description { max-width: 720px; color: #607078; line-height: 1.65; }
.home-intro__technologies { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 20px 0; padding: 0; }
.home-intro__technologies li { padding: 5px 10px; border-radius: 3px; background: #eaf8fb; color: #087e99; font-size: 12px; font-weight: 600; }
a { color: #008fad; font-weight: 600; text-decoration: none; }
a:hover { text-decoration: underline; }
@media (max-width: 620px) { .home-intro { padding: 22px 20px; } }
</style>
