<script setup>
import apartmentsData from '../mock/apartments.json';
import { useApartmentsStore } from '../stores/useApartmentsStore';

const store = useApartmentsStore();

function fakeFetch(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({json: () => Promise.resolve(data)});
    }, 500);
  });
}

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
  return data.filter(item => item.floor < 10);
}

onMounted(() => {
  // инициализируем стор
  fakeFetch(apartmentsData)
    .then(response => response.json())
    .then(json => {
      initApartmentsConfig(json);
      store.setApartments(processApartmentsData(json));
      console.log(store.apartments);
    });
})
</script>

<template>
  <div class="container">
    <div class="apartments__list">
      <h1>Квартиры</h1>
      <div v-show="store.apartments.length > 0">
        <ul>
          <li v-for="(apartment, index) in store.apartments" :key="`apartment-index-${index}`">
            {{ 'номер квартиры ' + apartment.apartmentNumber + ' цена квартиры ' + apartment.price + ' площадь квартиры ' + apartment.areaOfTheApartment }}
          </li>
        </ul>
      </div>
    </div>
    <div class="apartments__filter"></div>
  </div>
</template>
<style scoped>
</style>