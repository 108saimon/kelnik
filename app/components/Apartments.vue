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
  ).slice(store.page < 1 ? 0 : (store.page - 1) * 20, store.page * 20);

  // скрываем кнопку "загрузить ещё по необходимости"
  if (filterdData.length < 20) {
    showLoadMore.value = false;
  } else {
    showLoadMore.value = true;
  }

  return filterdData;
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

onMounted(() => {
  initData();
})
</script>

<template>
  <div class="container">
    <div class="apartments-list__container">
      <h1 class="apartments-list__title">Квартиры</h1>
      Бвшм 
      <div v-show="store.apartments.length > 0">
        <ul>
          <li v-for="(apartment, index) in store.currentApartments" :key="`apartment-index-${index}-id-${apartment.id}`">
            {{ 'номер квартиры ' + apartment.apartmentNumber + ' цена квартиры ' + apartment.price + ' площадь квартиры ' + apartment.areaOfTheApartment }}
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
      ></RangeSlider>
    </div>
  </div>
</template>
<style scoped>
.apartments-list__container {
  width: calc(100% - 318px);
}
.apartments-list__title {
  font-size: 24px;
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
.number-of-room__buttons {
  display: flex;
  width: 224px;
  height: 44px;
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
</style>