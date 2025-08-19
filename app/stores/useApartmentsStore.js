import { defineStore } from 'pinia'

export const useAlertsStore = defineStore('apartments', {
  state: () => ({
    apartments: []
  }),
  actions: {
    setApartments(apartments) {
      this.apartments = [...apartments]
    }
  }
})