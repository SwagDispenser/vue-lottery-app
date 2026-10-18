<script setup lang="ts">
const skills = ['Vue 3', 'TypeScript', 'JavaScript', 'HTML', 'CSS / SCSS', 'Git']
</script>

<template>
  <main class="about-view panel">
    <p class="about-view__eyebrow">
      About author
    </p>
    <h1>Довгешко Д.С.</h1>
    <p>Студент, автор навчального застосунку Vue Lottery.</p>

    <section aria-labelledby="skills-title">
      <h2 id="skills-title">
        Technical skills
      </h2>
      <ul class="about-view__skills">
        <li
          v-for="skill in skills"
          :key="skill"
        >
          {{ skill }}
        </li>
      </ul>
    </section>

    <a
      href="https://github.com/SwagDispenser"
      target="_blank"
      rel="noopener noreferrer"
    >
      GitHub: SwagDispenser ↗
    </a>
  </main>
</template>

<style scoped lang="scss">
.about-view { max-width: 760px; padding: 32px; }
.about-view__eyebrow { margin: 0 0 8px; color: #008fad; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 0 0 8px; font-size: 30px; font-weight: 700; }
p { color: #64757c; }
section { margin: 30px 0; }
h2 { font-size: 18px; font-weight: 700; }
.about-view__skills { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; }
.about-view__skills li { padding: 7px 12px; background: #eaf8fb; border-radius: 3px; color: #087e99; }
a { color: #008fad; font-weight: 600; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>
