<template>
  <section class="social-page">
    <!-- HEADER -->
    <header class="hero">
      <h1>Sosial Media Kami</h1>
      <p>
        Terhubung lebih dekat dengan kami melalui berbagai platform sosial media
        resmi. Ikuti update, informasi, dan aktivitas terbaru.
      </p>
      <span class="underline"></span>
    </header>

    <!-- LAYOUT 2 KOLOM -->
    <div class="social-layout" v-if="kontens.length && socials.length">
      <!-- KIRI: SLIDER BESAR -->
      <div
        class="slider-area"
        v-if="activeKonten"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <div class="slider-card">
          <h2>{{ activeKonten.namakontensosial }}</h2>
          <p class="slider-username">{{ activeKonten.kontenusername }}</p>

          <div class="slider-content" v-if="activeKonten.isikonten">
            <!-- HTML Widget -->
            <div
              v-if="getContentType(activeKonten.isikonten) === 'html'"
              v-html="activeKonten.isikonten"
            ></div>

            <!-- YouTube -->
            <iframe
              v-else-if="getContentType(activeKonten.isikonten) === 'youtube'"
              :id="'yt-player-' + activeKonten.id"
              :src="convertYoutubeUrl(activeKonten.isikonten)"
              width="100%"
              height="400"
              frameborder="0"
              allowfullscreen
              style="border-radius:1rem;"
            ></iframe>

            <!-- Facebook -->
            <iframe
              v-else-if="getContentType(activeKonten.isikonten) === 'facebook'"
              :id="'fb-player-' + activeKonten.id"
              :src="activeKonten.isikonten || ''"
              width="100%"
              height="400"
              frameborder="0"
              allowfullscreen
              style="border-radius:1rem;"
            ></iframe>

            <!-- Instagram LightWidget -->
            <div
              v-else-if="getContentType(activeKonten.isikonten) === 'instagram'"
              v-html="activeKonten.isikonten"
            ></div>

            <!-- Gambar -->
            <img
              v-else-if="getContentType(activeKonten.isikonten) === 'image'"
              :src="activeKonten.isikonten || ''"
              :alt="activeKonten.namakontensosial"
              style="max-width:100%; border-radius:1rem; margin-top:1rem;"
            />

            <!-- Teks fallback -->
            <p v-else>{{ activeKonten.isikonten }}</p>
          </div>
        </div>
      </div>

      <!-- KANAN: MINI-CARDS -->
      <div class="list-area">
        <article
          class="mini-card"
          v-for="item in socials"
          :key="item.id"
          @click="openLink(item.link)"
        >
          <img
            :src="`${API_URL}/uploads/sosialmedia/${item.iconsosialmedia || ''}`"
            :alt="item.namasosialmedia"
          />
          <div>
            <h3>{{ item.namasosialmedia }}</h3>
            <span>{{ item.username }}</span>
          </div>
        </article>
      </div>
    </div>

    <p v-else class="loading">Memuat data sosial media dan konten...</p>
  </section>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { kontenSosialApi, sosialMediaApi } from "@/services/api";
import type { KontenSosial, SosialMedia } from "@/services/api";

export default {
  name: "SocialMediaSlider",
  setup() {
    const kontens = ref<KontenSosial[]>([]);
    const activeKonten = ref<KontenSosial | null>(null);
    const socials = ref<SosialMedia[]>([]);
    let timer: number;

    const isHovering = ref(false);
    const isVideoPlaying = ref(false);
    const isPaused = ref(false);

    const ytPlayers: Record<number, any> = {};
    let youtubeScriptLoaded = false;

    const fetchKontens = async () => {
      try {
        const list = await kontenSosialApi.getAll();
        kontens.value = list;
        activeKonten.value = kontens.value[0] ?? null;
      } catch (error) {
        console.error("Gagal mengambil konten sosial:", error);
      }
    };

    const fetchSocials = async () => {
      try {
        const list = await sosialMediaApi.getAll();
        socials.value = list;
      } catch (error) {
        console.error("Gagal mengambil sosial media:", error);
      }
    };

    const updateSliderState = () => {
      isPaused.value = isHovering.value || isVideoPlaying.value;
    };

    const onMouseEnter = () => {
      isHovering.value = true;
      updateSliderState();
    };

    const onMouseLeave = () => {
      isHovering.value = false;
      updateSliderState();
    };

    const startSlider = () => {
      if (!kontens.value.length) return;
      let index = 0;
      timer = window.setInterval(() => {
        if (!isPaused.value) {
          index = (index + 1) % kontens.value.length;
          activeKonten.value = kontens.value[index] ?? null;
        }
      }, 10000);
    };

    const openLink = (url?: string) => {
      if (url) window.open(url, "_blank");
    };

    const getContentType = (content?: string) => {
      if (!content) return "none";
      if (content.includes("youtube.com") || content.includes("youtu.be")) return "youtube";
      if (content.includes("facebook.com")) return "facebook";
      if (content.includes("lightwidget.com")) return "instagram";
      if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(content)) return "image";
      if (content.includes("<iframe") || content.includes("<script")) return "html";
      return "text";
    };

    const convertYoutubeUrl = (url?: string) => {
      if (!url) return "";
      let videoId = "";
      if (url.includes("youtu.be")) {
        videoId = url.split("/").pop() || "";
      } else if (url.includes("youtube.com")) {
        const params = new URLSearchParams(url.split("?")[1]);
        videoId = params.get("v") || "";
      }
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    };

    const setupYouTubePlayer = (konten: KontenSosial) => {
      if (!konten || getContentType(konten.isikonten) !== "youtube") return;
      if (ytPlayers[konten.id]) return;

      const initPlayer = () => {
        ytPlayers[konten.id] = new (window as any).YT.Player("yt-player-" + konten.id, {
          events: {
            onReady: () => {
              const state = ytPlayers[konten.id].getPlayerState();
              isVideoPlaying.value = state === (window as any).YT.PlayerState.PLAYING;
              updateSliderState();
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                isVideoPlaying.value = true;
              } else if (
                event.data === (window as any).YT.PlayerState.PAUSED ||
                event.data === (window as any).YT.PlayerState.ENDED
              ) {
                isVideoPlaying.value = false;
              }
              updateSliderState();
            },
          },
        });
      };

      if (!youtubeScriptLoaded) {
        youtubeScriptLoaded = true;
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
        (window as any).onYouTubeIframeAPIReady = initPlayer;
      } else {
        initPlayer();
      }
    };

    watch(activeKonten, async (newVal) => {
      if (!newVal) return;
      const type = getContentType(newVal.isikonten);

      if (type === "youtube") setupYouTubePlayer(newVal);

      if (type === "instagram") {
        await nextTick();
        const oldScript = document.getElementById("lightwidget-script");
        if (oldScript) oldScript.remove();

        const script = document.createElement("script");
        script.id = "lightwidget-script";
        script.src = "https://cdn.lightwidget.com/widgets/lightwidget.js";
        script.async = true;
        document.body.appendChild(script);
      }
    });

    onMounted(async () => {
      await fetchKontens();
      await fetchSocials();
      startSlider();
    });

    const API_URL = import.meta.env.VITE_API_URL;

    onUnmounted(() => clearInterval(timer));

    return {
      kontens,
      activeKonten,
      socials,
      getContentType,
      convertYoutubeUrl,
      openLink,
      onMouseEnter,
      onMouseLeave,
      API_URL,
    };
  },
};
</script>

<style scoped>
/* CSS sama seperti sebelumnya */
.social-page { min-height: 100vh; padding: 4rem 6%; background: #fff; }
.hero { max-width: 760px; margin: 0 auto 4rem; text-align: center; }
.hero h1 { font-size: 2.6rem; font-weight: 800; color: #16a34a; }
.hero p { color: #4b5563; line-height: 1.6; margin-top: 0.5rem; }
.underline { display: block; width: 90px; height: 4px; background: #22c55e; margin: 1.6rem auto 0; border-radius: 999px; }
.social-layout { display: grid; grid-template-columns: 1.3fr 1fr; gap: 3rem; }
.slider-card { background: #f0fdf4; border-radius: 2rem; padding: 3rem; text-align: center; border: 1px solid #bbf7d0; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.slider-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
.slider-card h2 { font-size: 1.7rem; color: #166534; }
.slider-username { color: #6b7280; margin-bottom: 1.8rem; }
.list-area { display: flex; flex-direction: column; gap: 1rem; max-height: 360px; overflow-y: auto; overflow-x: hidden; width: 100%; padding-right: 4px; box-sizing: border-box; }
.mini-card { display: flex; gap: 1rem; align-items: center; padding: 1rem 1.2rem; border-radius: 1.2rem; background: #fff; border: 1px solid #e5e7eb; cursor: pointer; width: 100%; box-sizing: border-box; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.mini-card:hover { transform: translateX(5px); box-shadow: 0 6px 15px rgba(0,0,0,0.08); border-color: #22c55e; background: #f0fdf4; }
.mini-card img { width: 44px; height: 44px; object-fit: cover; }
.mini-card h3 { font-size: 1rem; color: #166534; }
.mini-card span { font-size: 0.85rem; color: #6b7280; }
@media (max-width: 900px) { .social-layout { grid-template-columns: 1fr; } }
</style>
