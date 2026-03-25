<script lang="ts">
  export let title: string;
  export let description: string;
  export let points: string[];
</script>

<div class="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-red-600/10 to-black border border-red-600/20 shadow-2xl overflow-hidden relative group">
  <div class="absolute -top-24 -right-24 w-64 h-64 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition duration-700"></div>
  
  <div class="relative z-10">
    <h3 class="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
      <span class="w-2 h-8 bg-red-600 rounded-full"></span>
      {title}
    </h3>
    
    <p class="text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl">
      {description}
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each points as point}
        <div class="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-600/30 transition duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-gray-200 font-medium">{point}</span>
        </div>
      {/each}
    </div>
    
    <div class="mt-12">
      <a href="mailto:sharif.khan@gmail.com" class="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition duration-300 shadow-xl shadow-red-900/40">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Let's Work Together
      </a>
    </div>
  </div>
</div>
