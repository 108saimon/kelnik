<script setup>
import apartmentsData from '../mock/apartments.json';
import { useApartmentsStore } from '../stores/apartments';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

const store = useApartmentsStore();

// TODO - переделать на fetch
function fakeFetch(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({json: () => Promise.resolve(data)});
    }, 500);
  });
}

// TODO - количество комнат
// получаем данные для фильтра
function initApartmentsConfig(data) {
  const prices = data.map(item => item.price);
  store.filters.maxPrice = Math.max(...prices);
  store.filters.minPrice = Math.min(...prices);
  const areas = data.map(item => item.areaOfTheApartment);
  store.filters.maxArea = Math.max(...areas);
  store.filters.minArea = Math.min(...areas);

  // если не сохранено значений фильтров устанавливаем их в значения по умолчанию
  store.filters.maxPriceCurrent = store.filters.maxPrice;
  store.filters.minPriceCurrent = store.filters.minPrice;
  store.filters.maxAreaCurrent = store.filters.maxArea;
  store.filters.minAreaCurrent = store.filters.minArea;
}

// TODO - доработать конец списка
function processApartmentsData(data) {
  return data.filter(item =>
    item.price >= store.filters.minPriceCurrent
    && item.price <= store.filters.maxPriceCurrent
    && item.areaOfTheApartment >= store.filters.minAreaCurrent
    && item.areaOfTheApartment <= store.filters.maxAreaCurrent
  ).slice(store.page < 1 ? 0 : (store.page - 1) * 20, store.page * 20);
}

function loadMore() {
  store.page++
  console.log(store.page)
  const newData = processApartmentsData(store.apartments);
  console.log(newData)
  store.currentApartments.push(...newData);
  console.log('wtf', store.currentApartments);
}

const priceFilterRangeSlider = ref(null);

onMounted(() => {
  // инициализируем стор
  fakeFetch(apartmentsData)
    .then(response => response.json())
    .then(json => {
      initApartmentsConfig(json);
      store.setApartments(json);
      store.setCurrentApartments(processApartmentsData(store.apartments));
      console.log(store.apartments);
    }).then(data => {
        if (priceFilterRangeSlider.value) {
          noUiSlider.create(priceFilterRangeSlider.value, {
            // noUiSlider options
            start: [store.filters.minPriceCurrent, store.filters.maxPriceCurrent], // Initial values for handles
            connect: true, // Connect the handles with a bar
            range: {
              'min': store.filters.minPrice,
              'max': store.filters.maxPrice,
            }
          })

          // Optional: Listen for updates and handle values
          priceFilterRangeSlider.value.noUiSlider.on('update', (values, handle) => {
            console.log(values);
          });

          priceFilterRangeSlider.value.noUiSlider.on('change', (values, handle) => {
            console.log('CHANGE!!!', values);
          });
        } else {
          console.error("Slider element not found!")
        }
    });
})
</script>

<template>
  <div class="container">
    <div class="apartments__list">
      <h1 class="title">Квартиры</h1>
      <div v-show="store.apartments.length > 0">
        <ul>
          <li v-for="(apartment, index) in store.currentApartments" :key="`apartment-index-${index}`">
            {{ 'номер квартиры ' + apartment.apartmentNumber + ' цена квартиры ' + apartment.price + ' площадь квартиры ' + apartment.areaOfTheApartment }}
          </li>
        </ul>
      </div>
      <button @click="loadMore">
        Загрузить ещё
      </button>
    </div>
    <div class="apartments__filter">
      Фильтры
      <div ref="priceFilterRangeSlider"></div>
    </div>
  </div>
</template>
<style scoped>
.title {
  font-size: 24px;
}
.apartments__list {
  width: calc(100% - 318px);
}
.apartments__filter {
  width: 318px;
  background-image: linear-gradient(to right, #AEE4B2, #95D0A1);
  padding: 20px;
  border-radius: 20px;
}
.price_filter__slider-range {
  position: relative;
  width: 240px;
}
</style>