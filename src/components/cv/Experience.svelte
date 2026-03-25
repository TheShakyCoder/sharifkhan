<script lang="ts">
  interface ExperienceItem {
    company: string;
    role: string;
    period: string;
    description: string;
  }

  export let items: ExperienceItem[];
</script>

<div class="space-y-12">
  {#each items as item}
    <div class="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-red-600/30">
      <div class="absolute left-[-5px] top-0 w-[12px] h-[12px] rounded-full bg-red-600"></div>
      <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
        <div>
          <h3 class="text-2xl font-bold text-white mb-1">{item.role}</h3>
          <p class="text-xl text-red-500 font-medium">{item.company}</p>
        </div>
        <span class="mt-2 md:mt-0 text-gray-500 font-mono text-sm uppercase tracking-wider">{item.period}</span>
      </div>
      <p class="text-gray-400 leading-relaxed text-lg text-pretty">
        {item.description}
      </p>
    </div>
  {/each}
</div>
