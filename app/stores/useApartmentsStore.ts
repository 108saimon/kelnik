import { defineStore } from 'pinia'

interface Apartment {
  image: 'imageURL',
  floor: number,
  numberOfRooms: number,
  apartmentNumber: number,
  areaOfTheApartment: number,
  price: number,
  maxFloor: number
}

interface UseApartmentsStore {
  apartments: Apartment[],
  maxPrice: number,
  maxPriceFilter: number,
  minPrice: number,
  minPriceFilter:number,
  minArea: number,
  maxAreaFilter: number,
  numberOfRoomsFilter: number[]
}

export const useApartmentsStore = defineStore('apartments', {
  state: (): UseApartmentsStore => ({
    apartments: [],
    maxPrice: 0,
    maxPriceFilter: 0,
    minPrice: 0,
    minPriceFilter:0,
    minArea: 0,
    maxAreaFilter: 0,
    numberOfRoomsFilter: []
  }),
  actions: {
    setApartments(apartments: any) {
      this.apartments = [...apartments]
    }
  }
})