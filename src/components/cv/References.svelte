<script lang="ts">
  interface ReferenceItem {
    name: string;
    role: string;
    contact: string;
    testimonial: string;
  }

  export let items: ReferenceItem[];
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
  {#each items as item}
    <div class="p-8 rounded-2xl bg-white/5 border border-white/10 italic leading-relaxed text-gray-400 text-lg relative group">
      <div class="absolute -top-4 -left-4 text-6xl text-red-600/20 font-serif leading-none">"</div>
      <p class="mb-8 relative z-10">{item.testimonial}</p>
      <div class="not-italic flex items-center gap-4 text-left">
        <div class="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 font-bold shrink-0">
          {item.name.charAt(0)}
        </div>
        <div>
          <h4 class="text-white font-bold">{item.name}</h4>
          <p class="text-sm text-gray-500">{item.role}</p>
          <a href={`mailto:${item.contact}`} class="text-xs text-red-500/70 hover:text-red-500 transition underline underline-offset-4">{item.contact}</a>
        </div>
      </div>
    </div>
  {/each}
</div>
