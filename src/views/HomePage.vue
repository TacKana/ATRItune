<template>
  <ion-page class="ion-padding-horizontal">
    <ion-content :fullscreen="true">
      <!-- 调音器 -->
      <div class="bg-red w-[100%] h-xs flex items-end justify-center">
        <!-- 指针 -->
        <div
          class="needle bg-emerald w-1 h-60 origin-bottom"
          :style="needleStyle"
        ></div>
        <div
          class="absolute bg-emerald w-30 h15 rounded-[100px_100px_0px_0px] flex items-center justify-center"
        >
          {{ pitch }}Hz
        </div>
      </div>
      <div class="bg-amber w-auto h-20 flex items-center justify-center">
        <div class="">{{ noteName }}</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import { computed, ref } from "vue";
import { startTuner } from "@/composables/useTuner";

// 音名
const noteName = ref("---");
const deviation = ref(0); // 音分偏差
const pitch = ref(0); // 音高

startTuner((res) => {
  noteName.value = res.noteName;
  deviation.value = res.deviation;
  pitch.value = res.pitch;
});

// 控制指针旋转角度
function name() {}
const needleStyle = computed(() => {
  // 限制偏差范围在 -50 到 50 音分之间
  const limitedDeviation = Math.max(-50, Math.min(50, deviation.value));
  // 将音分偏差映射到角度（-30度到30度）
  // 0音分对应0度，±50音分对应±30度
  const angle = (limitedDeviation / 50) * 90;
  return {
    transform: `translateX(-50%) rotate(${angle}deg)`,
    "transition-property": "transform",
    "transition-duration": "0.5s",
  };
});
</script>

<style lang="scss" scoped>
ion-content {
  --padding-top: var(--ion-safe-area-top, 0);
}
</style>
