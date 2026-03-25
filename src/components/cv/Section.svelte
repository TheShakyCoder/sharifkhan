<script lang="ts">
  export let title: string;
  export let id: string;
</script>

<section {id} class="py-16 md:py-24 border-b border-white/10 last:border-b-0">
  <div class="container mx-auto px-6">
    <h2 class="text-3xl md:text-4xl font-bold text-white mb-12 flex items-center gap-4">
      <span class="w-12 h-[2px] bg-red-600"></span>
      {title}
    </h2>
    <div class="max-w-4xl mx-auto">
      <slot />
    </div>
  </div>
</section>
