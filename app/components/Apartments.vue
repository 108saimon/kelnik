<script setup>
import apartmentsData from '../mock/apartments.json';
import { useAlertsStore } from '../stores/useApartmentsStore';

const store = useAlertsStore()

function fakeFetch(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({json: () => Promise.resolve(data)});
    }, 500);
  });
}

function processApartmentsData(data) {
  return data.filter(item => item.floor < 10)
}

onMounted(() => {
  fakeFetch(apartmentsData)
    .then(response => response.json())
    .then(json => {
      // const filtered = json.filter(item => item.floor > 3);
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