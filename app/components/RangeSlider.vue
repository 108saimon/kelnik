<script setup>
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { ref, onMounted, watch } from 'vue';

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
  isDisabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['change'])

const sliderRef = ref(null);

const sliderCurrentMin = ref(0);
const sliderCurrentMax = ref(0);

watch(() => props.isDisabled, (value) => {
  if (!sliderRef.value || !sliderRef.value.noUiSlider) return;
  if (value) {
    sliderRef.value.noUiSlider.disable();
  } else {
    sliderRef.value.noUiSlider.enable();
  }
})

onMounted(() => {
  if (sliderRef.value) {
    noUiSlider.create(sliderRef.value, {
      start: [props.startMin, props.startMax],
      connect: true,
      step: 1,
      range: {
        'min': props.rangeMin,
        'max': props.rangeMax,
      }
    })

    if (props.isDisabled) {
      sliderRef.value.noUiSlider.disable();
    } else {
      sliderRef.value.noUiSlider.enable();
    }

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
  <div>
    <div class="Labels">
      от {{ sliderCurrentMin }} до {{ sliderCurrentMax }}
    </div>
    <div ref="sliderRef"></div>
  </div>
</template>

<style scoped>
</style>
