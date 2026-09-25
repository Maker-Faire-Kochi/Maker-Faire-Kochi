import { computed, reactive, ref } from 'vue'
import { emptyInterestForm, type InterestFormInput } from '~~/shared/interest/types'
import { interestNeeds } from '~~/shared/interest/validate'

export function useInterestForm() {
  const form = reactive<InterestFormInput>(emptyInterestForm())
  const submitting = ref(false)
  const submitted = ref(false)
  const errors = ref<string[]>([])

  const needs = computed(() => interestNeeds(form.participation))

  const showContribute = computed(() => needs.value.contribute)
  const showProjectBlock = computed(() => needs.value.projectBlock)
  const showVolunteer = computed(() => needs.value.volunteer)

  function toggleParticipation(value: InterestFormInput['participation'][number]) {
    const i = form.participation.indexOf(value)
    if (i >= 0) form.participation.splice(i, 1)
    else form.participation.push(value)
  }

  function toggleCategory(value: InterestFormInput['projectCategories'][number]) {
    const i = form.projectCategories.indexOf(value)
    if (i >= 0) form.projectCategories.splice(i, 1)
    else form.projectCategories.push(value)
  }

  function toggleVolunteerArea(value: InterestFormInput['volunteerAreas'][number]) {
    const i = form.volunteerAreas.indexOf(value)
    if (i >= 0) form.volunteerAreas.splice(i, 1)
    else form.volunteerAreas.push(value)
  }

  async function submit() {
    errors.value = []
    submitting.value = true
    try {
      await $fetch('/api/interest', { method: 'POST', body: { ...form } })
      submitted.value = true
    } catch (e: unknown) {
      const err = e as { data?: { data?: { errors?: string[] }; message?: string }; statusMessage?: string }
      const list = err?.data?.data?.errors
      if (list?.length) errors.value = list
      else errors.value = [err?.statusMessage || err?.data?.message || 'Something went wrong. Try again.']
    } finally {
      submitting.value = false
    }
  }

  return {
    form,
    submitting,
    submitted,
    errors,
    showContribute,
    showProjectBlock,
    showVolunteer,
    toggleParticipation,
    toggleCategory,
    toggleVolunteerArea,
    submit,
  }
}
