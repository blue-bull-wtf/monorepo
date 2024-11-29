import { createApp } from 'vue'

// pcss/js styles
import './index.css'
// components
import App from './App.vue'
import Svg from './components/Svg.vue'
import Slider from './components/Slider.vue'
import Picker from './components/Picker.vue'
import Table from './components/Table.vue'
import Lottie from './components/Lottie.vue'
import Chart from './components/Chart.vue'
import Modal from './components/Modal.vue'

// directives
import RenderDirective from './directives/render';
// services
import { app, clients } from './store'
import { HttpClient } from './services/http-client'

app.instance = createApp(App)
  .component('Svg', Svg)
  .component('Lottie', Lottie)
  .component('Slider', Slider)
  .component('Picker', Picker)
  .component('Table', Table)
  .component('Chart', Chart)
  .component('Modal', Modal)
  .use(RenderDirective);

app.instance.mount('#app');
app.element = app.instance._container as HTMLElement;
app.rect = app.element.getBoundingClientRect();

clients.http = HttpClient;
