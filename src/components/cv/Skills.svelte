<script lang="ts">
  interface SkillCategory {
    category: string;
    skills: string[];
  }

  export let categories: SkillCategory[];
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
  {#each categories as cat}
    <div class="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-red-600/50 transition duration-300 group">
      <h3 class="text-xl font-bold mb-6 text-white group-hover:text-red-500 transition duration-300">
        {cat.category}
      </h3>
      <div class="flex flex-wrap gap-2">
        {#each cat.skills as skill}
          <span class="px-4 py-2 rounded-lg bg-black/50 border border-white/5 text-gray-300 text-sm hover:border-red-600/30 transition duration-300">
            {skill}
          </span>
        {/each}
      </div>
    </div>
  {/each}
</div>
