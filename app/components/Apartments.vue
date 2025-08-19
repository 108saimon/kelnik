<script setup>
import apartmentsData from '../mock/apartments.json';
import { useApartmentsStore } from '../stores/apartments';

const store = useApartmentsStore();

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
  store.maxPrice = Math.max(...prices);
  store.minPrice = Math.min(...prices);
  const areas = data.map(item => item.areaOfTheApartment);
  store.maxArea = Math.max(...areas);
  store.minArea = Math.min(...areas);

  // если не сохранено значений фильтров устанавливаем их в значения по умолчанию
  store.maxPriceFilter = store.maxPrice;
  store.minPriceFilter = store.minPrice;
  store.maxAreaFilter = store.maxArea;
  store.minAreaFilter = store.minArea;
}

function processApartmentsData(data) {
  return data.filter(item =>
    item.price >= store.minPriceFilter
    && item.price <= store.maxPriceFilter
    && item.areaOfTheApartment >= store.minAreaFilter
    && item.areaOfTheApartment <= store.maxAreaFilter
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

onMounted(() => {
  // инициализируем стор
  fakeFetch(apartmentsData)
    .then(response => response.json())
    .then(json => {
      initApartmentsConfig(json);
      store.setApartments(json);
      store.setCurrentApartments(processApartmentsData(store.apartments));
      console.log(store.apartments);
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
    <div class="apartments__filter"></div>
  </div>
</template>
<style scoped>
.title {
  font-size: 24px;
}
</style>