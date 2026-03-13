<template>
  <ion-page class="ion-padding-horizontal">
    <ion-content :fullscreen="true">
      <div class="flex">
        <div class="">
          <!-- 顶部内容 -->
          <h2>概览</h2>
          <p>这里是顶部区域，高度根据内容自适应</p>
        </div>
        <div class="">
          <!-- 底部内容，可滚动 -->
          <ion-list>
            <ion-item *ngFor="let item of items">66</ion-item>
          </ion-list>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  // IonHeader,
  IonPage,
  IonList,
  IonItem,
  // IonTitle,
  // IonToolbar,
} from "@ionic/vue";
</script>

<style lang="scss" scoped>
ion-content {
  --padding-top: var(--ion-safe-area-top, 0);
}
</style>
