<script lang="ts">
  interface ProjectItem {
    name: string;
    description: string;
    tech: string[];
    link: string;
    image: string;
  }

  export let items: ProjectItem[];
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
  {#each items as project}
    <div class="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-red-600/50 transition-all duration-500 hover:-translate-y-2">
      <!-- Image/Icon Area -->
      <div class="h-48 bg-gradient-to-br from-red-600/20 to-black relative overflow-hidden">
        <img 
          src={project.image} 
          alt={project.name} 
          class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition duration-700"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      <!-- Content Area -->
      <div class="p-8">
        <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-red-500 transition duration-300">
          {project.name}
        </h3>
        <p class="text-gray-400 mb-6 leading-relaxed line-clamp-3">
          {project.description}
        </p>

        <!-- Tech Tags -->
        <div class="flex flex-wrap gap-2 mb-8">
          {#each project.tech as tag}
            <span class="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-red-500/80 font-medium">
              {tag}
            </span>
          {/each}
        </div>

        <!-- Link -->
        <a 
          href={project.link} 
          target="_blank" 
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-white font-bold hover:text-red-500 transition duration-300 underline underline-offset-8 decoration-white/20 hover:decoration-red-500"
        >
          View Project
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  {/each}
</div>
