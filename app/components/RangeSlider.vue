<script setup>
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

const props = defineProps({
  rangeMin: {
    type: Number,
    default: 0
  },
  rangeMax: {
    type: Number,
    default: 0
  },
  startMin: {
    type: Number,
    default: 0
  },
  startMax: {
    type: Number,
    default: 0
  },
});

const emit = defineEmits(['change'])

const sliderRef = ref(null);

const sliderCurrentMin = ref(0);
const sliderCurrentMax = ref(0);

onMounted(() => {
  if (sliderRef.value) {
    noUiSlider.create(sliderRef.value, {
      start: [props.startMin, props.startMax], // Initial values for handles
      connect: true, // Connect the handles with a bar
      step: 10,
      range: {
        'min': props.rangeMin,
        'max': props.rangeMax,
      }
    })

    sliderRef.value.noUiSlider.on('update', (values, handle) => {
      console.log(values);
      sliderCurrentMin.value = parseFloat(values[0]);
      sliderCurrentMax.value = parseFloat(values[1]);
    });

    sliderRef.value.noUiSlider.on('change', (values, handle) => {
      emit('change', values)
    });
  } else {
    console.error("Slider element not found!")
  }
});
</script>

<template>
  <div class="Labels">
    от {{ sliderCurrentMin }} до {{ sliderCurrentMax }}
  </div>
  <div ref="sliderRef"></div>
</template>

<style scoped>
</style>
