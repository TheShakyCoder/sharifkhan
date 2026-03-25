<script lang="ts">
  export let name: string;
  export let title: string;
  export let summary: string;
  export let profilePicture: string;
</script>

<section class="min-h-screen flex items-center justify-center pt-24 pb-16 bg-gradient-to-b from-red-950 to-black">
  <div class="container mx-auto px-6 flex flex-col items-center text-center">
    <div class="relative mb-8 group">
      <div class="absolute -inset-1 bg-red-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <img
        src={profilePicture}
        alt={name}
        class="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-white/10 object-cover shadow-2xl"
      />
    </div>
    <h1 class="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight font-outfit">
      {name}
    </h1>
    <h2 class="text-2xl md:text-3xl text-red-500 font-medium mb-8">
      {title}
    </h2>
    <p class="max-w-2xl text-lg md:text-xl text-gray-400 leading-relaxed">
      {summary}
    </p>
    <div class="mt-12 flex gap-6">
      <a href="#experience" class="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition duration-300 shadow-lg shadow-red-900/20">
        View Experience
      </a>
      <a href="#skills" class="px-8 py-3 border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition duration-300">
        Key Skills
      </a>
    </div>
  </div>
</section>
