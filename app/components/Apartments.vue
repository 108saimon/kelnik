<script setup>
import { useApartmentsStore } from '../stores/apartments';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const store = useApartmentsStore();

// получаем данные для фильтра
function initApartmentsConfig(data) {
  const prices = data.map(item => item.price);
  store.filters.maxPrice = Math.max(...prices);
  store.filters.minPrice = Math.min(...prices);
  const areas = data.map(item => item.areaOfTheApartment);
  store.filters.maxArea = Math.max(...areas);
  store.filters.minArea = Math.min(...areas);

  // если не сохранено значений фильтров устанавливаем их в значения по умолчанию
  // TODO - добавить извлечение из localStorage
  store.filters.maxPriceCurrent = store.filters.maxPrice;
  store.filters.minPriceCurrent = store.filters.minPrice;
  store.filters.maxAreaCurrent = store.filters.maxArea;
  store.filters.minAreaCurrent = store.filters.minArea;
  store.filters.numberOfRooms = [1,2,3,4];
}

// функция которая имитирует ответ от бэка - фильтрация, сортировка и выдача по 20 сущностей
function processApartmentsData(data) {
  const filterdData = data.filter(item =>
    item.price >= store.filters.minPriceCurrent
    && item.price <= store.filters.maxPriceCurrent
    && item.areaOfTheApartment >= store.filters.minAreaCurrent
    && item.areaOfTheApartment <= store.filters.maxAreaCurrent
    && store.filters.numberOfRooms.includes(item.numberOfRooms)
  )

  const sortedData = store.sort.order === 'asc' ?
    filterdData.sort((a, b) => a[store.sort.type] - b[store.sort.type])
    : filterdData.sort((a, b) => b[store.sort.type] - a[store.sort.type]);

  // скрываем кнопку "загрузить ещё по необходимости"
  if (sortedData.length < 20) {
    showLoadMore.value = false;
  } else {
    showLoadMore.value = true;
  }

  return sortedData.slice(store.page < 1 ? 0 : (store.page - 1) * 20, store.page * 20);;
}

const priceSliderRef = ref(null);
const areaSliderRef = ref(null);

function resetFilters() {
  store.filters.maxPriceCurrent = store.filters.maxPrice;
  store.filters.minPriceCurrent = store.filters.minPrice;
  store.filters.maxAreaCurrent = store.filters.maxArea;
  store.filters.minAreaCurrent = store.filters.minArea;
  store.filters.numberOfRooms = [1,2,3,4];
  priceSliderRef.value.valuesReset();
  areaSliderRef.value.valuesReset();
  onFilterChange();
}

async function loadMore() {
  store.page++
  const data = await loadData();
  const newData = processApartmentsData(data);
  store.currentApartments.push(...newData);
}

function changePriceCurrent(values) {
  store.filters.minPriceCurrent = parseFloat(values[0]);
  store.filters.maxPriceCurrent = parseFloat(values[1]);

  onFilterChange();
}

function changeAreaCurrent(values) {
  store.filters.minAreaCurrent = parseFloat(values[0]);
  store.filters.maxAreaCurrent = parseFloat(values[1]);

  onFilterChange();
}

function changeNumberOfRooms(value) {
  if (value) {
    if (store.filters.numberOfRooms.includes(value)) {
      store.filters.numberOfRooms = store.filters.numberOfRooms.filter(item => item !== value);
    } else {
      store.filters.numberOfRooms.push(value);
    }
  }
  onFilterChange();
}

function sortBy(type) {
  store.sort.type = type;
  if (store.sort.order === 'asc') {
    store.sort.order = 'desc';
  } else {
    store.sort.order = 'asc';
  }
  onFilterChange();
}

async function onFilterChange() {
  store.page = 1
  slidersIsDisabled.value = true
  await loadData().then(data => {
    store.currentApartments = [...processApartmentsData(data)];
    slidersIsDisabled.value = false
  });
}

let storeIsReady = ref(false);

let slidersIsDisabled = ref(false);

let showLoadMore = ref(true);

async function initData() {
  try {
    const response = await fetch('/apartments_with_id.json');
    if (!response.ok) {
      throw new Error(`Ошибка при загрузке данных: ${response.status}`);
    }
    const data = await response.json();
    initApartmentsConfig(data);
    store.setApartments(data);
    store.setCurrentApartments(processApartmentsData(store.apartments));

    storeIsReady.value = true;
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}

async function loadData() {
  const response = await fetch('/apartments_with_id.json');
  if (!response.ok) {
    throw new Error(`Ошибка при загрузке данных: ${response.status}`);
  }
  return await response.json();
}

let currentScrollTop = ref(0);

function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  currentScrollTop.value = scrollTop;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
// Можно было бы использовать такой подход для плавного скролла в том числе в сафари
// function scrollToTop() {
//   let top = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
//   if (top > 0) {
//     window.scrollBy(0, -100);  // прокручиваем на 100px вверх
//     setTimeout(scrollUpStep, 20);  // повторяем каждые 20 мс
//   }
// }

onMounted(() => {
  initData();
  if (window) {
    window.addEventListener('scroll', handleScroll);
  }
})

onBeforeUnmount(() => {
  if (window) {
    window.removeEventListener('scroll', handleScroll);
  }
})
</script>

<template>
  <div class="container" @scroll="handleScroll">
    <div class="apartments-list__container">
      <h1 class="apartments-list__title">Квартиры</h1>
      <div class="apartments-sort__buttons">
        <div class="apartments-sort__button"
          :class="{ 'apartments-sort__button-active': store.sort.type === 'areaOfTheApartment' }"
          @click="sortBy('areaOfTheApartment')">
          S, м²<div class="apartments-sort__icon" :class="[{ 'apartments-sort__icon_active': store.sort.type === 'areaOfTheApartment', 'order-asc': store.sort.order === 'asc', 'order-desc': store.sort.order === 'desc' }]"></div>
        </div>
        <div class="apartments-sort__button"
          :class="{ 'apartments-sort__button-active': store.sort.type === 'floor' }"
          @click="sortBy('floor')">
          Этаж<div class="apartments-sort__icon" :class="[{ 'apartments-sort__icon_active': store.sort.type === 'floor', 'order-asc': store.sort.order === 'asc', 'order-desc': store.sort.order === 'desc' }]"></div>
        </div>
        <div class="apartments-sort__button"
          :class="{ 'apartments-sort__button-active': store.sort.type === 'price' }"
          @click="sortBy('price')">
          Цена, ₽<div class="apartments-sort__icon" :class="[{ 'apartments-sort__icon_active': store.sort.type === 'price', 'order-asc': store.sort.order === 'asc', 'order-desc': store.sort.order === 'desc' }]"></div>
        </div>
      </div>
      <div v-show="store.apartments.length > 0">
        <ul>
          <li v-for="(apartment, index) in store.currentApartments" :key="`apartment-index-${index}-id-${apartment.id}`">
            {{ 'номер квартиры ' + apartment.apartmentNumber + ' цена квартиры ' + apartment.price + ' площадь квартиры ' + apartment.areaOfTheApartment + ' этаж ' + apartment.floor + ' из ' + apartment.maxFloor }}
          </li>
        </ul>
      </div>
      <button @click="loadMore" v-show="showLoadMore">
        Загрузить ещё
      </button>
    </div>
    <div class="apartments__filter">
      <div class="number-of-room__buttons">
        <div class="number-of-room__button"
          v-for="value in [1,2,3,4]"
          :key="`number-of-room-${value}`"
          :class="{ disabled: !store.filters.numberOfRooms.includes(value) }"
          @click="changeNumberOfRooms(value)">
            {{ value }}к
          </div>
      </div>
      <RangeSlider
        v-if="storeIsReady"
        :label="'Стоимость квартиры, ₽'"
        :range-min="store.filters.minPrice"
        :range-max="store.filters.maxPrice"
        :start-min="store.filters.minPriceCurrent"
        :start-max="store.filters.maxPriceCurrent"
        :is-disabled="slidersIsDisabled"
        @change="changePriceCurrent"
        ref="priceSliderRef"
      ></RangeSlider>
      <RangeSlider
        v-if="storeIsReady"
        :label="'Площадь, м²'"
        :range-min="store.filters.minArea"
        :range-max="store.filters.maxArea"
        :start-min="store.filters.minAreaCurrent"
        :start-max="store.filters.maxAreaCurrent"
        :is-disabled="slidersIsDisabled"
        @change="changeAreaCurrent"
        ref="areaSliderRef"
      ></RangeSlider>
      <div class="reset-filters" @click="resetFilters">
        Сбросить параметры<div class="reset-filters__icon"></div>
      </div>
    </div>
    <div class="scroll-top__button"
      v-show="currentScrollTop > 0"
      @click="scrollToTop"
      >
      <div class="scroll-top__img"></div>
    </div>
  </div>
</template>
<style scoped>
.apartments-list__container {
  width: calc(100% - 318px);
}
.apartments-list__title {
  font-size: 54px;
  font-family: 'PTRootUIWebBold', sans-serif;
  margin-bottom: 24px;
}

.apartments-sort__buttons {
  display: flex;
  margin-bottom: 12px;
}
.apartments-sort__button {
  margin-right: 20px;
  font-size: 14px;
  cursor: pointer;
}
.apartments-sort__icon {
  background-image: url('arrows.svg');
  display: inline-block;
  width: 6.86px;
  height: 10px;
  margin-left: 8px;
  background-repeat: no-repeat;
}
.apartments-sort__button-active {
  color: #3EB57C;
}
.apartments-sort__icon_active {
  background-image: url('arrows_active.svg');
  background-repeat: no-repeat;
}
.order-asc {
  transform: rotate(0deg);
}
.order-desc {
  transform: rotate(180deg);
}

.apartments__filter {
  width: 318px;
  height: 318px;
  background: linear-gradient(135deg, rgba(174, 228, 178, 0.3) 0%, rgba(149, 208, 161, 0.3) 100%);
  padding: 20px;
  border-radius: 20px;
}
.price_filter__slider-range {
  position: relative;
  width: 240px;
}

.number-of-room__buttons {
  display: flex;
  width: 224px;
  height: 44px;
  margin-bottom: 24px;
}
.number-of-room__button {
  width: 44px;
  height: 44px;
  background: #fff;
  color: #0B1739;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  cursor: pointer;
}
.number-of-room__button.disabled {
  color: rgba(11, 23, 57, 0.2);
}
.number-of-room__button:last-child {
  margin-right: 0px;
}
.number-of-room__button:hover {
  background: #3EB57C;
  color: #fff;
}

.reset-filters {
  font-size: 13px;
  cursor: pointer;
}
.reset-filters__icon {
  width: 8px;
  height: 8px;
  background-image: url('cross mini.svg');
  display: inline-block;
  margin-left: 8px;
  position: relative;
  top: -1px;
}

.scroll-top__button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #95D0A1;
  position: fixed;
  top: auto;
  bottom: 32px;
  right: 32px;
  left: auto;
  cursor: pointer;
}
.scroll-top__img {
  background-image: url('scroll_top_arrow.svg');
  height: 12px;
  width: 10px;
}
</style>