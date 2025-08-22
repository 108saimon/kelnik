<script lang="ts" setup>
import { useApartmentsStore } from '../stores/apartments';
import { ref, onMounted, onBeforeUnmount  } from 'vue';
import { addSpaces } from '~/utils/helpers';

// Локальные типы для строгой типизации
type ApartmentSortField = 'price' | 'areaOfTheApartment' | 'floor';
interface Apartment {
  id: string,
  image: string,
  floor: number,
  numberOfRooms: number,
  apartmentNumber: number,
  areaOfTheApartment: number,
  price: number,
  maxFloor: number
}
interface SliderExpose {
  valuesReset: () => void
}

const store = useApartmentsStore();

// получаем данные для фильтра
function initApartmentsConfig(data: Apartment[]) {
  const prices = data.map((item: Apartment) => item.price);
  store.filters.maxPrice = Math.max(...prices);
  store.filters.minPrice = Math.min(...prices);
  const areas = data.map((item: Apartment) => item.areaOfTheApartment);
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
function processApartmentsData(data: Apartment[]) {
  const filterdData = data.filter((item: Apartment) =>
    item.price >= store.filters.minPriceCurrent
    && item.price <= store.filters.maxPriceCurrent
    && item.areaOfTheApartment >= store.filters.minAreaCurrent
    && item.areaOfTheApartment <= store.filters.maxAreaCurrent
    && store.filters.numberOfRooms.includes(item.numberOfRooms)
  )

  const sortedData = store.sort.order === 'asc' ?
    filterdData.sort((a: Apartment, b: Apartment) => a[store.sort.type as ApartmentSortField] - b[store.sort.type as ApartmentSortField])
    : filterdData.sort((a: Apartment, b: Apartment) => b[store.sort.type as ApartmentSortField] - a[store.sort.type as ApartmentSortField]);

  const chankedData = sortedData.slice(store.page < 1 ? 0 : (store.page - 1) * 20, store.page * 20);

  // скрываем кнопку "загрузить ещё по необходимости"
  if (chankedData.length < 20) {
    showLoadMore.value = false;
  } else {
    showLoadMore.value = true;
  }

  return chankedData;
}

const priceSliderRef = ref<SliderExpose | null>(null);
const areaSliderRef = ref<SliderExpose | null>(null);

function resetFilters() {
  store.filters.maxPriceCurrent = store.filters.maxPrice;
  store.filters.minPriceCurrent = store.filters.minPrice;
  store.filters.maxAreaCurrent = store.filters.maxArea;
  store.filters.minAreaCurrent = store.filters.minArea;
  store.filters.numberOfRooms = [1,2,3,4];
  priceSliderRef.value?.valuesReset();
  areaSliderRef.value?.valuesReset();
  onFilterChange();
}

async function loadMore() {
  store.page++
  const data = await loadData();
  const newData = processApartmentsData(data);
  store.currentApartments.push(...newData);
}

function changePriceCurrent(values: [string, string]) {
  store.filters.minPriceCurrent = parseFloat(values[0]);
  store.filters.maxPriceCurrent = parseFloat(values[1]);

  onFilterChange();
}

function changeAreaCurrent(values: [string, string]) {
  store.filters.minAreaCurrent = parseFloat(values[0]);
  store.filters.maxAreaCurrent = parseFloat(values[1]);

  onFilterChange();
}

function changeNumberOfRooms(value: number) {
  if (dataIsLoading.value) return;
  if (value) {
    if (store.filters.numberOfRooms.includes(value)) {
      store.filters.numberOfRooms = store.filters.numberOfRooms.filter((item: number) => item !== value);
    } else {
      store.filters.numberOfRooms.push(value);
    }
  }
  onFilterChange();
}

function sortBy(type: ApartmentSortField) {
  store.sort.type = type;
  if (store.sort.order === 'asc') {
    store.sort.order = 'desc';
  } else {
    store.sort.order = 'asc';
  }
  onFilterChange();
}

// имитация запроса к серверу с выдачей отфильтрованных и отсортированных данных
async function onFilterChange() {
  store.page = 1
  dataIsLoading.value = true
  await loadData().then(data => {
    store.currentApartments = [...processApartmentsData(data)];
    dataIsLoading.value = false
  });
}

let storeIsReady = ref(false);

let dataIsLoading = ref(false);

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
// Можно было бы использовать такой подход для плавного скролла в том числе в сафари, но я думаю это уже переусложнение
// function scrollToTop() {
//   let top = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
//   if (top > 0) {
//     window.scrollBy(0, -100);  // прокручиваем на 100px вверх
//     setTimeout(scrollUpStep, 20);  // повторяем каждые 20 мс
//   }
// }

let screenWidth = ref(0);

const handleResize = () => {
  screenWidth.value = window.innerWidth;
}

onMounted(() => {
  initData();
  if (window) {
    screenWidth.value = window.innerWidth;
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
  }
})

onBeforeUnmount(() => {
  if (window) {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
  }
})
</script>

<template>
  <div class="container" @scroll="handleScroll" v-if="storeIsReady">
    <div class="apartments-list__container">
      <h1 class="apartments-list__title">Квартиры</h1>
      <div class="apartments__headers-wrap">
        <div class="apartments__cell-headers" v-if="screenWidth > 1439">
          <div class="cell-header__layout">Планировка</div>
          <div class="cell-header__room">Квартира</div>
        </div>
        <div class="apartments-sort__buttons">
          <div class="apartments-sort__button"
            :class="{ 'apartments-sort__button-active': store.sort.type === 'areaOfTheApartment' }"
            @click="sortBy('areaOfTheApartment')">
            S, м²<div class="apartments-sort__icon" :class="[{ 'apartments-sort__icon_active': store.sort.type === 'areaOfTheApartment' }, `order-${store.sort.order}`]"></div>
          </div>
          <div class="apartments-sort__button"
            :class="{ 'apartments-sort__button-active': store.sort.type === 'floor' }"
            @click="sortBy('floor')">
            Этаж<div class="apartments-sort__icon" :class="[{ 'apartments-sort__icon_active': store.sort.type === 'floor' }, `order-${store.sort.order}`]"></div>
          </div>
          <div class="apartments-sort__button"
            :class="{ 'apartments-sort__button-active': store.sort.type === 'price' }"
            @click="sortBy('price')">
            Цена, ₽<div class="apartments-sort__icon" :class="[{ 'apartments-sort__icon_active': store.sort.type === 'price' }, `order-${store.sort.order}`]"></div>
          </div>
        </div>
      </div>
      <div v-show="store.currentApartments.length > 0">
        <ul v-if="screenWidth < 1439">
          <li class="apartment-item__small-screen-block" v-for="(apartment, index) in store.currentApartments" :key="`apartment-index-${index}-id-${apartment.id}`">
            <div class="apartment-item__left-block">
              <div class="apartment-room">{{ apartment.numberOfRooms }}-комнатная №{{ apartment.apartmentNumber }}</div>
              <div class="apartment__down-block">
                <div class="apartment-area">{{ apartment.areaOfTheApartment }} м²</div>
                <div class="apartment-floor">{{ apartment.floor }} <span class="apartment-floor__span">из {{ apartment.maxFloor }} Этаж</span></div>
                <div class="apartment-price">{{ addSpaces(apartment.price) }} ₽</div>
              </div>
            </div>
            <div class="apartment-item__right-block">
              <img :src="apartment.image"></img>
            </div>
          </li>
        </ul>
        <ul v-else>
          <li class="apartment-item__wide-screen-block" v-for="(apartment, index) in store.currentApartments" :key="`apartment-index-${index}-id-${apartment.id}`">
            <div class="apartment-image apartment-item__block"><img :src="apartment.image"></img></div>
            <div class="apartment-room apartment-item__block">{{ apartment.numberOfRooms }}-комнатная №{{ apartment.apartmentNumber }}</div>
            <div class="apartment-area apartment-item__block">{{ apartment.areaOfTheApartment }} м²</div>
            <div class="apartment-floor apartment-item__block">{{ apartment.floor }}<span> из {{ apartment.maxFloor }} Этаж</span></div>
            <div class="apartment-price apartment-item__block">{{ addSpaces(apartment.price) }} ₽</div>
          </li>
        </ul>
      </div>
      <div v-show="store.currentApartments.length === 0">Нет подходящих вариантов</div>
      <button @click="loadMore" v-show="showLoadMore && store.apartments.length !== 0" class="load-more__button">
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
        :is-disabled="dataIsLoading"
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
        :is-disabled="dataIsLoading"
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
  padding-right: 28px;
}
.apartments-list__title {
  font-size: 54px;
  font-family: 'PTRootUIWebBold', sans-serif;
  margin-bottom: 24px;
}

.apartments__headers-wrap {
  width: 800px;
  display: flex;
}

.apartments__cell-headers {
  width: 380px;
  display: flex;
  font-size: 14px;
}
.cell-header__layout {
  width: 80px;
  margin-right: 20px;
}
.cell-header__room {
  width: 280px;
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
@media (min-width: 1440px) {
  .apartments-sort__button {
    width: 120px;
    margin-right: 20px;
  }
  .apartments-sort__button:last-child {
    margin-right: 0;
  }
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

.apartment-item__small-screen-block {
  height: 112px;
  border: 1px solid #E6E6E6;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.apartment-item__left-block {
  margin: 16px 24px;
  font-size: 14px;
}
.apartment__down-block {
  display: flex;
}
.apartment-area, .apartment-floor, .apartment-price {
  margin-right: 20px;
  height: 20px;
  display: flex;
  align-items: center;
}
.apartment-floor__span {
  margin-left: 4px;
  color: #858B9C;
}
.apartment-room {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
  height: 20px;
}
.apartment-item__right-block {
  margin-right: 24px;
  margin-top: 16px;
  margin-bottom: 16px;
}

.apartment-item__wide-screen-block {
  display: flex;
  width: 800px;
  /* justify-content: space-between; */
  height: 120px;
  border-top: 1px solid #E6E6E6;
  padding-top: 16px;
  font-size: 16px;
}
.apartment-item__wide-screen-block:last-child {
  border-bottom: 1px solid #E6E6E6;
}
@media (min-width: 1440px) {
  .apartment-image {
    margin-right: 20px;
  }
  .apartment-room {
    width: 280px;
    height: 24px;
  }
  .apartment-area, .apartment-floor, .apartment-price {
    width: 120px;
    height: 24px;
    margin-right: 20px;;
  }
  .apartment-price {
    margin-right: 0;
  }
}

.load-more__button {
  /* width: 149px; */
  height: 38px;
  border-radius: 25px;
  padding: 8px 24px;
  display: flex;
  font-size: 16px;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid #0B173933;
  margin-top: 24px;
}

.load-more__button:hover {
  background-color: #3EB57C;
  color: #fff;
  cursor: pointer;
}

.apartments__filter {
  width: 318px;
  height: 318px;
  background: linear-gradient(135deg, rgba(174, 228, 178, 0.3) 0%, rgba(149, 208, 161, 0.3) 100%);
  padding: 20px;
  border-radius: 10px;
}
@media (min-width: 1440px) {
  .apartments__filter {
    width: 400px;
    height: 372px;
    padding: 40px;
    border-radius: 10px;
  }
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
  display: flex;
  font-size: 13px;
  cursor: pointer;
  height: 20px;
}
@media (min-width: 1440px) {
  .reset-filters {
    font-size: 13px;
    align-items: center;
  }
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