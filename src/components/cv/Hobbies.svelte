<script lang="ts">
  interface HobbyItem {
    name: string;
    description: string;
  }

  export let items: HobbyItem[];
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {#each items as item}
    <div class="flex items-start gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition duration-300">
      <div class="w-8 h-8 rounded-lg bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <div class="text-left">
        <h4 class="text-white font-bold mb-1">{item.name}</h4>
        <p class="text-gray-500 text-sm leading-snug">{item.description}</p>
      </div>
    </div>
  {/each}
</div>
