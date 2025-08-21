import { defineStore } from 'pinia'

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

type SortTypes = 'price' | 'areaOfTheApartment' | 'floor';
type SortOrder = 'asc' | 'desc';

interface UseApartmentsStore {
  apartments: Apartment[],
  currentApartments: Apartment[],
  page: number,
  filters: {
    maxPrice: number,
    maxPriceCurrent: number,
    minPrice: number,
    minPriceCurrent:number,
    minArea: number,
    minAreaCurrent: number,
    maxArea: number,
    maxAreaCurrent: number,
    numberOfRooms: number[],
  },
  sort: {
    type: SortTypes,
    order: SortOrder,
  }
}

export const useApartmentsStore = defineStore('apartments', {
  state: (): UseApartmentsStore => ({
    apartments: [],
    currentApartments: [],
    page: 1,
    filters: {
      maxPrice: 0,
      maxPriceCurrent: 0,
      minPrice: 0,
      minPriceCurrent:0,
      minArea: 0,
      minAreaCurrent: 0,
      maxArea: 0,
      maxAreaCurrent: 0,
      numberOfRooms: [],
    },
    sort: {
      type: 'price',
      order: 'asc',
    }
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