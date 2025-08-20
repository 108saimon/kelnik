<script setup>
import { useApartmentsStore } from '../stores/apartments';
import { ref, onMounted } from 'vue';

const store = useApartmentsStore();

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
  console.log('processApartmentsData', data);
  const filterdData = data.filter(item =>
    item.price >= store.filters.minPriceCurrent
    && item.price <= store.filters.maxPriceCurrent
    && item.areaOfTheApartment >= store.filters.minAreaCurrent
    && item.areaOfTheApartment <= store.filters.maxAreaCurrent
  ).slice(store.page < 1 ? 0 : (store.page - 1) * 20, store.page * 20);

  return filterdData;
}

function loadMore() {
  store.page++
  console.log(store.page)
  const newData = processApartmentsData(store.apartments);
  console.log(newData)
  store.currentApartments.push(...newData);
  console.log('wtf', store.currentApartments);
}

function changePriceCurrent(data) {
  store.filters.minPriceCurrent = parseFloat(data[0]);
  store.filters.maxPriceCurrent = parseFloat(data[1]);

  store.page = 1
  store.currentApartments = [...processApartmentsData(store.apartments)];
}

function changeAreaCurrent(data) {
  store.filters.minAreaCurrent = parseFloat(data[0]);
  store.filters.maxAreaCurrent = parseFloat(data[1]);

  store.page = 1
  store.currentApartments = [...processApartmentsData(store.apartments)];
}

let storeIsReady = ref(false);

let slidersIsDisabled = ref(false);

let showLoadMore = true;

async function initData() {
  try {
    // Файлы из `public/` доступны по корню сайта без префикса `public`
    const response = await fetch('/apartments_with_id.json');
    if (!response.ok) {
      throw new Error(`Ошибка при загрузке данных: ${response.status}`);
    }
    const data = await response.json();
    console.log('fetchData', data);
    initApartmentsConfig(data);
    store.setApartments(data);
    store.setCurrentApartments(processApartmentsData(store.apartments));
    console.log(store.apartments);

    storeIsReady.value = true;
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}

onMounted(() => {
  initData();
})
</script>

<template>
  <div class="container">
    <div class="apartments__list">
      <h1 class="title">Квартиры</h1>
      <div v-show="store.apartments.length > 0">
        <ul>
          <li v-for="(apartment, index) in store.currentApartments" :key="`apartment-index-${index}-id-${apartment.id}`">
            {{ 'номер квартиры ' + apartment.apartmentNumber + ' цена квартиры ' + apartment.price + ' площадь квартиры ' + apartment.areaOfTheApartment }}
          </li>
        </ul>
      </div>
      <button @click="loadMore">
        Загрузить ещё
      </button>
    </div>
    <div class="apartments__filter">
      <div>Фильтры</div>
      <RangeSlider
        v-if="storeIsReady"
        :range-min="store.filters.minPrice"
        :range-max="store.filters.maxPrice"
        :start-min="store.filters.minPriceCurrent"
        :start-max="store.filters.maxPriceCurrent"
        :is-disabled="slidersIsDisabled"
        @change="changePriceCurrent"
      ></RangeSlider>
      <RangeSlider
        v-if="storeIsReady"
        :range-min="store.filters.minArea"
        :range-max="store.filters.maxArea"
        :start-min="store.filters.minAreaCurrent"
        :start-max="store.filters.maxAreaCurrent"
        :is-disabled="slidersIsDisabled"
        @change="changeAreaCurrent"
      ></RangeSlider>
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