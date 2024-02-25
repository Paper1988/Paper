import { createApp } from 'vue';
import App from './App.vue';

const vm = createApp(App);

document.addEventListener('DOMContentLoaded', () => {
    vm.mount('#app');
});