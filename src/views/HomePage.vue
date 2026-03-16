<template>
  <ion-page class="ion-padding-horizontal">
    <ion-content :fullscreen="true">
      <!-- 调音器 -->
      <div class="bg-red w-[100%] h-xs flex items-end justify-center">
        <!-- 指针 -->
        <div
          class="needle bg-emerald w-1 h-60 origin-bottom"
          :style="{ rotate: rotate + 'deg' }"
        ></div>
      </div>
      <div class="bg-amber w-auto h-20 flex items-center justify-center">
        A3
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import { ref } from "vue";
import { useTuner } from "@/composables/useTuner";

const rotate = ref(0);

useTuner();
</script>

<style lang="scss" scoped>
ion-content {
  --padding-top: var(--ion-safe-area-top, 0);
}
</style>
