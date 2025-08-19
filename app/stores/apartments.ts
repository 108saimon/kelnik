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
  minAreaFilter: number,
  maxArea: number,
  maxAreaFilter: number,
  numberOfRoomsFilter: number[],
  currentApartments: Apartment[],
  page: number,
}

export const useApartmentsStore = defineStore('apartments', {
  state: (): UseApartmentsStore => ({
    apartments: [],
    maxPrice: 0,
    maxPriceFilter: 0,
    minPrice: 0,
    minPriceFilter:0,
    minArea: 0,
    minAreaFilter: 0,
    maxArea: 0,
    maxAreaFilter: 0,
    numberOfRoomsFilter: [],
    currentApartments: [],
    page: 1,
  }),
  actions: {
    setApartments(apartments: any) {
      this.apartments = [...apartments]
    },
    setCurrentApartments(apartments: any) {
      this.currentApartments = [...apartments]
    }
  }
})