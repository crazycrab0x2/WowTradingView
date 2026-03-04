<script setup>
useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/wow.ico" }],
  htmlAttrs: {
    lang: "en",
  },
});

const title = "Wow Trade";
const description = "Wow Trading on HyperLiquid.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "/wow.png",
});
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
