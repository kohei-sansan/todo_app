import { createApp } from 'vue'
import App from './App.vue'
//bootstrap
import "bootstrap/dist/css/bootstrap.min.css"
//fontawesome
import './css/fontawesome/css/all.min.css';
import Toaster from '@meforma/vue-toaster';

//コンポーネントの追加
//createApp(App).mount('#app')
createApp(App)
.use(Toaster)
.mount('#app');
