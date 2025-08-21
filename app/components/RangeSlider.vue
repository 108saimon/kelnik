<script setup>
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
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

function addSpaces(numberString) {
  return numberString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

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
      sliderCurrentMin.value = addSpaces(parseFloat(values[0]));
      sliderCurrentMax.value = addSpaces(parseFloat(values[1]));
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
    <div class="filter__label" v-show="props.label.length > -1">{{ props.label }}</div>
    <div class="values__label">
      <div class="values__item">от<span class="values__strong-text">{{ sliderCurrentMin }}</span></div>
      <div class="values__item">до<span class="values__strong-text">{{ sliderCurrentMax }}</span></div>
    </div>
    <div ref="sliderRef"></div>
  </div>
</template>


<style>
.filter__label {
  font-size: 13px;
  line-height: 18px;
  margin-bottom: 8px;
}
.values__label {
  display: flex;
}
.values__item {
  font-size: 14px;
  line-height: 20px;
  color: #788690;
  display: flex;
  width: 140px;
}
.values__strong-text {
  color: #0B1739;
  margin-left: 8px;
}

.noUi-horizontal .noUi-handle {
  border-radius: 50%;
  width: 14px;
  height: 14px;
  top: 1px;
  right: -7px;
  background: #3EB57C;
  border-color: #3EB57C;
  box-shadow: none;
}
.noUi-connect {
  height: 3px;
  background: #3EB57C;
}
.noUi-connects {
  background: #CEDFD5;
  height: 3px;
  top: 7px;
}
.noUi-handle:before, .noUi-handle:after {
  display: none;
}
.noUi-target {
  background: transparent;
  border-radius: 4px;
  border: 0;
  box-shadow: none;
}
[disabled].noUi-target, [disabled].noUi-handle, [disabled] .noUi-handle {
  cursor: default;
}
[disabled] .noUi-handle, [disabled].noUi-handle {
  background: #B8B8B8;
  border-color: #B8B8B8;
}
</style>
